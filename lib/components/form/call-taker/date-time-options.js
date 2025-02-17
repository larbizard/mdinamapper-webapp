/* eslint-disable react/prop-types */
import { injectIntl } from 'react-intl'
import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import moment from 'moment'
import React, { Component } from 'react'

function getDepartureOptions(intl) {
  return [
    {
      // Default option.
      text: intl.formatMessage({ id: 'components.DateTimeOptions.now' }),
      value: 'NOW'
    },
    {
      text: intl.formatMessage({ id: 'components.DateTimeOptions.departAt' }),
      value: 'DEPART'
    },
    {
      text: intl.formatMessage({ id: 'components.DateTimeOptions.arriveBy' }),
      value: 'ARRIVE'
    }
  ]
}

/**
 * Time formats passed to moment.js used to parse the user's time input.
 */
const SUPPORTED_TIME_FORMATS = [
  'HH:mm:ss',
  'h:mm:ss a',
  'h:mm:ssa',
  'h:mm a',
  'h:mma',
  'h:mm',
  'HHmm',
  'hmm',
  'ha',
  'h',
  'HH:mm'
].map((format) => `YYYY-MM-DDT${format}`)

/**
 * Convert input moment object to date/time query params in OTP API format.
 * @param  {[type]} [time=moment(] [description]
 * @return {[type]}                [description]
 */
function momentToQueryParams(time = moment()) {
  return {
    date: time.format(OTP_API_DATE_FORMAT),
    time: time.format(OTP_API_TIME_FORMAT)
  }
}

/**
 * Contains depart/arrive selector and time/date inputs for the admin-oriented
 * Call Taker form. A few unique features/behaviors to note:
 * - when "leave now" is selected the time/date will now stay up to date in the
 *   form and query params
 * - the time input will interpret various time formats using moment.js so that
 *   users can quickly type a shorthand value (5p) and have that be parsed into
 *   the correct OTP format.
 * - when a user changes the date or time, "leave now" (if selected) will
 *   automatically switch to "depart at".

 * @type {Object}
 */
class DateTimeOptions extends Component {
  state = {
    timeInput: ''
  }

  componentDidMount() {
    if (this.props.departArrive === 'NOW') {
      this._startAutoRefresh()
    }
  }

  componentWillUnmount() {
    this._stopAutoRefresh()
  }

  componentDidUpdate(prevProps) {
    const { date, departArrive, time } = this.props
    const dateTime = this.dateTimeAsMoment()
    const parsedTime = this.parseInputAsTime(this.state.timeInput, date)
    // Update time input if time changes and the parsed time does not match what
    // the user originally input (this helps avoid changing the time input while
    // the user is simultaneously updating it).
    if (prevProps.time !== time && !parsedTime.isSame(dateTime)) {
      this._updateTimeInput(dateTime)
    }
    // If departArrive has been changed to leave now, begin auto refresh.
    if (departArrive !== prevProps.departArrive) {
      if (departArrive === 'NOW') this._startAutoRefresh()
      else this._stopAutoRefresh()
    }
  }

  _updateTimeInput = (time = moment()) =>
    // If auto-updating time input (for leave now), use short 24-hr format to
    // avoid writing a value that is too long for the time input's width.
    this.setState({ timeInput: time.format('H:mm') })

  _startAutoRefresh = () => {
    const timer = window.setInterval(this._refreshDateTime, 1000)
    this.setState({ timer })
  }

  _stopAutoRefresh = () => {
    window.clearInterval(this.state.timer)
    this.setState({ timer: null })
  }

  _refreshDateTime = () => {
    const now = moment()
    this._updateTimeInput(now)
    const dateTimeParams = momentToQueryParams(now)
    // Update query param if the current time has changed (i.e., on minute ticks).
    if (dateTimeParams.time !== this.props.time) {
      this.props.setQueryParam(dateTimeParams)
    }
  }

  _setDepartArrive = (evt) => {
    const { value: departArrive } = evt.target
    if (departArrive === 'NOW') {
      const now = moment()
      // If setting to leave now, update date/time and start auto refresh to keep
      // form input in sync.
      this.props.setQueryParam({
        departArrive,
        ...momentToQueryParams(now)
      })
      if (!this.state.timer) {
        this._startAutoRefresh()
      }
    } else {
      // If set to depart at/arrive by, stop auto refresh.
      this._stopAutoRefresh()
      this.props.setQueryParam({ departArrive })
    }
  }

  handleDateChange = (evt) =>
    this.handleDateTimeChange({ date: evt.target.value })

  /**
   * Handler that should be used when date or time is manually updated. This
   * will also update the departArrive value if need be.
   */
  handleDateTimeChange = (params) => {
    const { departArrive: prevDepartArrive } = this.props
    // If previously set to leave now, change to depart at when time changes.
    if (prevDepartArrive === 'NOW') params.departArrive = 'DEPART'
    this.props.setQueryParam(params)
  }

  /**
   * Select input string when time input is focused by user (for quick changes).
   */
  handleTimeFocus = (evt) => evt.target.select()

  parseInputAsTime = (
    timeInput,
    date = moment().startOf('day').format('YYYY-MM-DD')
  ) => {
    return moment(date + 'T' + timeInput, SUPPORTED_TIME_FORMATS)
  }

  dateTimeAsMoment = () => moment(`${this.props.date}T${this.props.time}`)

  handleTimeChange = (evt) => {
    if (this.state.timer) this._stopAutoRefresh()
    const timeInput = evt.target.value
    const parsedTime = this.parseInputAsTime(timeInput)
    this.handleDateTimeChange({ time: parsedTime.format(OTP_API_TIME_FORMAT) })
    this.setState({ timeInput })
  }

  render() {
    const { departArrive, intl, onKeyDown } = this.props
    const { timeInput } = this.state
    const dateTime = this.dateTimeAsMoment()
    return (
      <>
        <select
          onBlur={this._setDepartArrive}
          onChange={this._setDepartArrive}
          onKeyDown={onKeyDown}
          value={departArrive}
        >
          {getDepartureOptions(intl).map(({ text, value }) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
        <OverlayTrigger
          overlay={
            <Tooltip id="time-tooltip">{intl.formatTime(dateTime)}</Tooltip>
          }
          placement="bottom"
          trigger={['focus', 'hover']}
        >
          <input
            className="datetime-slim"
            onChange={this.handleTimeChange}
            onFocus={this.handleTimeFocus}
            onKeyDown={onKeyDown}
            style={{
              fontSize: 'inherit',
              lineHeight: '.8em',
              marginLeft: '3px',
              padding: '0px',
              width: '50px'
            }}
            // Don't use intl.formatTime, so that users can enter time in 12hr or 24hr format at their leisure.
            value={timeInput || dateTime.format('H:mm')}
          />
        </OverlayTrigger>
        <input
          className="datetime-slim"
          onChange={this.handleDateChange}
          onKeyDown={onKeyDown}
          style={{
            fontSize: '14px',
            lineHeight: '1em',
            outline: 'none',
            width: '109px'
          }}
          type="date"
          value={dateTime.format('YYYY-MM-DD')}
        />
      </>
    )
  }
}

export default injectIntl(DateTimeOptions)
