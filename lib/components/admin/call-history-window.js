import React from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import Icon from '../util/icon'

import CallRecord from './call-record'
import DraggableWindow from './draggable-window'
import {WindowHeader} from './styled'

function CallHistoryWindow (props) {
  const {callTaker, fetchQueries, intl, searches, toggleCallHistory} = props
  const {activeCall, callHistory} = callTaker
  if (!callHistory.visible) return null
  return (
    <DraggableWindow
      header={<WindowHeader><Icon type='history' /> Call history</WindowHeader>}
      onClickClose={toggleCallHistory}
      style={{right: '15px', top: '50px', width: '450px'}}
    >
      {activeCall
        ? <CallRecord
          call={activeCall}
          inProgress
          intl={intl}
          searches={searches} />
        : null
      }
      {callHistory.calls.data.length > 0
        ? callHistory.calls.data.map((call, i) => (
          <CallRecord
            // Create a key so that when call records get added, elements in this list are
            // recreated/remounted so that they don't show the state from the previous list.
            call={call}
            fetchQueries={fetchQueries}
            index={i}
            intl={intl}
            key={`${call.id}-${i}`} />
        ))
        : <div>No calls in history</div>
      }
    </DraggableWindow>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker,
    currentQuery: state.otp.currentQuery,
    searches: state.otp.searches
  }
}

const mapDispatchToProps = {
  fetchQueries: callTakerActions.fetchQueries,
  toggleCallHistory: callTakerActions.toggleCallHistory
}

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(CallHistoryWindow)
)
