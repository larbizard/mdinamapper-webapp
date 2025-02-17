/* eslint-disable react/jsx-handler-names */
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { getDateFormat } from '@opentripplanner/core-utils/lib/time'
import { injectIntl } from 'react-intl'
import moment from 'moment'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as fieldTripActions from '../../actions/field-trip'
import { getActiveFieldTripRequest } from '../../util/state'
import {
  getGroupSize,
  GROUP_FIELDS,
  PAYMENT_FIELDS,
  TICKET_TYPES
} from '../../util/call-taker'
import Icon from '../util/icon'

import {
  Bold,
  Button,
  Container,
  WindowHeader as DefaultWindowHeader,
  FullWithMargin,
  Half,
  Header,
  InlineHeader,
  Para,
  Text,
  Val
} from './styled'
import DraggableWindow from './draggable-window'
import EditableSection from './editable-section'
import FieldTripNotes from './field-trip-notes'
import TripStatus from './trip-status'
import Updatable from './updatable'

const WindowHeader = styled(DefaultWindowHeader)`
  margin-bottom: 0px;
`

/**
 * Shows the details for the active Field Trip Request.
 */
class FieldTripDetails extends Component {
  _editSubmitterNotes = (val) => {
    const { editSubmitterNotes, intl, request } = this.props
    editSubmitterNotes(request, val, intl)
  }

  _getRequestLink = (path, isPublic = false) => {
    return `${this.props.datastoreUrl}/${
      isPublic ? 'public/' : ''
    }fieldtrip/${path}?requestId=${this.props.request.id}`
  }

  _onToggleStatus = () => {
    const { intl, request, setRequestStatus } = this.props
    if (request.status !== 'cancelled') {
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm(
          'Are you sure you want to cancel this request? Any associated trips will be deleted.'
        )
      ) {
        setRequestStatus(request, 'cancelled', intl)
      }
    } else {
      setRequestStatus(request, 'active', intl)
    }
  }

  _renderFooter = () => {
    const { request, sessionId } = this.props
    const cancelled = request.status === 'cancelled'
    const printFieldTripLink = `/#/printFieldTrip/?requestId=${request.id}&sessionId=${sessionId}`
    return (
      <div style={{ padding: '5px 10px 0px 10px' }}>
        <DropdownButton
          aria-label="Field Trip Menu"
          bsSize="xsmall"
          dropup
          id="field-trip-menu"
          title="View"
        >
          <MenuItem
            href={this._getRequestLink('feedbackForm', true)}
            target="_blank"
          >
            <Icon type="commenting-o" /> Feedback link
          </MenuItem>
          <MenuItem href={this._getRequestLink('receipt')} target="_blank">
            <Icon type="file-text-o" /> Receipt link
          </MenuItem>
          <MenuItem href={printFieldTripLink} target="_blank">
            <Icon type="print" /> Printable trip plan
          </MenuItem>
        </DropdownButton>
        <Button
          bsSize="xsmall"
          bsStyle={cancelled ? undefined : 'danger'}
          className="pull-right"
          onClick={this._onToggleStatus}
        >
          {cancelled ? 'Reactivate' : 'Cancel'} request
        </Button>
      </div>
    )
  }

  _renderHeader = () => {
    const { dateFormat, request } = this.props
    const { id, schoolName, travelDate } = request
    const travelDateAsMoment = moment(travelDate)
    return (
      <WindowHeader>
        <Icon type="graduation-cap" /> {schoolName} Trip (#{id})
        <div style={{ marginLeft: '28px' }}>
          <small>
            Travel date: {travelDateAsMoment.format(dateFormat)} (
            {travelDateAsMoment.fromNow()})
          </small>
        </div>
      </WindowHeader>
    )
  }

  render() {
    const {
      addFieldTripNote,
      clearActiveFieldTrip,
      deleteFieldTripNote,
      intl,
      request,
      setRequestGroupSize,
      setRequestPaymentInfo,
      style
    } = this.props
    if (!request) return null
    const {
      invoiceRequired,
      notes,
      schoolName,
      submitterNotes,
      teacherName,
      ticketType
    } = request
    const internalNotes = []
    const operationalNotes = []
    notes &&
      notes.forEach((note) => {
        if (note.type === 'internal') internalNotes.push(note)
        else operationalNotes.push(note)
      })
    return (
      <DraggableWindow
        footer={this._renderFooter()}
        header={this._renderHeader()}
        height="375px"
        onClickClose={clearActiveFieldTrip}
        style={style}
      >
        <Container>
          <Header>Group Information</Header>
          <Half>
            <Para>
              <Bold>{schoolName}</Bold>
            </Para>
            <Para>Teacher: {teacherName}</Para>
            <Para>
              Ticket type: <Val>{TICKET_TYPES[ticketType]}</Val>
            </Para>
            <Para>
              Invoice required: <Val>{invoiceRequired ? 'Yes' : 'No'}</Val>
            </Para>
            <Para>
              <Updatable
                fieldName="Teacher notes"
                label={<Icon title="Teacher notes" type="sticky-note-o" />}
                onUpdate={this._editSubmitterNotes}
                value={submitterNotes}
              />
            </Para>
          </Half>
          <Half>
            <EditableSection
              // This is a custom children prop
              // eslint-disable-next-line react/no-children-prop
              children={
                <Text>
                  <Bold>{getGroupSize(request)}</Bold> total
                </Text>
              }
              fields={GROUP_FIELDS}
              inputStyle={{
                lineHeight: '0.8em',
                padding: '0px',
                width: '50px'
              }}
              intl={intl}
              onChange={setRequestGroupSize}
              request={request}
              valueFirst
            />
          </Half>
          <TripStatus outbound request={request} />
          <TripStatus request={request} />
          <FullWithMargin>
            <EditableSection
              // Use inline header so that 'Change' button appears on top line.
              // This is a custom children prop
              // eslint-disable-next-line react/no-children-prop
              children={
                <InlineHeader>
                  <Icon type="credit-card" /> Payment information
                </InlineHeader>
              }
              fields={PAYMENT_FIELDS}
              inputStyle={{
                lineHeight: '0.8em',
                padding: '0px',
                width: '100px'
              }}
              intl={intl}
              onChange={setRequestPaymentInfo}
              request={request}
            />
          </FullWithMargin>
          <FieldTripNotes
            addFieldTripNote={addFieldTripNote}
            deleteFieldTripNote={deleteFieldTripNote}
            intl={intl}
            request={request}
          />
        </Container>
      </DraggableWindow>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentQuery: state.otp.currentQuery,
    datastoreUrl: state.otp.config.datastoreUrl,
    dateFormat: getDateFormat(state.otp.config),
    request: getActiveFieldTripRequest(state),
    sessionId: state.callTaker.session.sessionId
  }
}

const mapDispatchToProps = {
  addFieldTripNote: fieldTripActions.addFieldTripNote,
  clearActiveFieldTrip: fieldTripActions.clearActiveFieldTrip,
  deleteFieldTripNote: fieldTripActions.deleteFieldTripNote,
  editSubmitterNotes: fieldTripActions.editSubmitterNotes,
  setActiveFieldTrip: fieldTripActions.setActiveFieldTrip,
  setRequestGroupSize: fieldTripActions.setRequestGroupSize,
  setRequestPaymentInfo: fieldTripActions.setRequestPaymentInfo,
  setRequestStatus: fieldTripActions.setRequestStatus,
  toggleFieldTrips: fieldTripActions.toggleFieldTrips
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FieldTripDetails))
