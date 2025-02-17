// REMOVE THIS LINE BEFORE EDITING THIS FILE
/* eslint-disable  */
import { FormattedMessage, injectIntl } from 'react-intl'
import { VelocityTransitionGroup } from 'velocity-react'
import React, { Component } from 'react'

import { stopTimeComparator } from '../../util/viewer'
import Icon from '../util/icon'
import Strong from '../util/strong-text'

import RealtimeStatusLabel from './realtime-status-label'
import StopTimeCell from './stop-time-cell'

/**
 * Represents a single pattern row for displaying arrival times in the stop
 * viewer.
 */
class PatternRow extends Component {
  constructor() {
    super()
    this.state = { expanded: false }
  }

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render() {
    const {
      homeTimezone,
      intl,
      pattern,
      route,
      stopTimes,
      stopViewerArriving,
      stopViewerConfig
    } = this.props

    // sort stop times by next departure
    let sortedStopTimes = []
    const hasStopTimes = stopTimes && stopTimes.length > 0
    if (hasStopTimes) {
      sortedStopTimes = stopTimes
        .concat()
        .sort(stopTimeComparator)
        // We request only x departures per pattern, but the patterns are merged
        // according to shared headsigns, so we need to slice the stop times
        // here as well to ensure only x times are shown per route/headsign combo.
        // This is applied after the sort, so we're keeping the soonest departures.
        .slice(0, stopViewerConfig.numberOfDepartures)
    } else {
      // Do not render pattern row if it has no stop times.
      return null
    }

    const routeName = route.shortName ? route.shortName : route.longName
    return (
      <div className="route-row" role="table">
        {/* header row */}
        <div className="header" role="row">
          {/* route name */}
          <div className="route-name">
            <FormattedMessage
              id="components.PatternRow.routeName"
              values={{
                headsign: pattern.headsign,
                routeName: routeName,
                strong: Strong
              }}
            />
          </div>
          {/* next departure preview */}
          {hasStopTimes && (
            <div className="next-trip-preview" role="columnheader">
              <StopTimeCell
                homeTimezone={homeTimezone}
                soonText={stopViewerArriving}
                stopTime={sortedStopTimes[0]}
              />
            </div>
          )}

          {/* expansion chevron button */}
          <div className="expansion-button-container">
            <button
              aria-controls={`route-${routeName}`}
              aria-expanded={this.state.expanded}
              aria-label={intl.formatMessage(
                { id: 'components.PatternRow.collapseOrExpandDepartures' },
                {
                  expanded: this.state.expanded,
                  routeName
                }
              )}
              className="expansion-button"
              onClick={this._toggleExpandedView}
            >
              <Icon type={`chevron-${this.state.expanded ? 'up' : 'down'}`} />
            </button>
          </div>
        </div>

        {/* expanded view */}
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}
        >
          {this.state.expanded && (
            <div id={`route-${routeName}`}>
              <div className="trip-table" role="table">
                {/* trips table header row */}
                <div className="header" role="row">
                  <div className="cell" role="columnheader" />
                  <div className="cell time-column" role="columnheader">
                    <FormattedMessage id="components.PatternRow.departure" />
                  </div>
                  <div className="cell status-column" role="columnheader">
                    <FormattedMessage id="components.PatternRow.status" />
                  </div>
                </div>

                {/* list of upcoming trips */}
                {hasStopTimes &&
                  sortedStopTimes.map((stopTime, i) => {
                    const { departureDelay: delay, realtimeState } = stopTime
                    return (
                      <div
                        className="trip-row"
                        key={i}
                        role="row"
                        style={{
                          display: 'table-row',
                          fontSize: 14,
                          marginTop: 6
                        }}
                      >
                        <div className="cell" role="cell">
                          <FormattedMessage
                            id="components.PatternRow.routeShort"
                            values={{ headsign: stopTime.headsign }}
                          />
                        </div>
                        <div className="cell time-column" role="cell">
                          <StopTimeCell
                            homeTimezone={homeTimezone}
                            soonText={stopViewerArriving}
                            stopTime={stopTime}
                          />
                        </div>
                        <div className="cell status-column" role="cell">
                          <RealtimeStatusLabel
                            className="status-label"
                            delay={delay}
                            isRealtime={realtimeState === 'UPDATED'}
                            withBackground
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </VelocityTransitionGroup>
      </div>
    )
  }
}

export default injectIntl(PatternRow)
