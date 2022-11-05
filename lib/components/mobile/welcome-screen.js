/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { MobileScreens, setMobileScreen } from '../../actions/ui'
import { setLocationToCurrent } from '../../actions/map'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

class MobileWelcomeScreen extends Component {
  static propTypes = {
    intl: PropTypes.object,
    setLocationToCurrent: PropTypes.func,
    setMobileScreen: PropTypes.func
  }

  _toFieldClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_INITIAL_LOCATION)
  }

  /* Called when the user selects a from/to location using the selection
   * popup (invoked in mobile mode via a long tap). Note that BaseMap already
   * takes care of updating the query in the store w/ the selected location */

  _locationSetFromPopup = (selection) => {
    const { intl, setLocationToCurrent } = this.props
    // If the tapped location was selected as the 'from' endpoint, set the 'to'
    // endpoint to be the current user location. (If selected as the 'to' point,
    // no action is needed since 'from' is the current location by default.)
    if (selection.type === 'from') {
      setLocationToCurrent({ locationType: 'to' }, intl)
    }
  }

  render() {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={
            <FormattedMessage id="components.BatchSearchScreen.header" />
          }
        />
        <div className="welcome-location mobile-padding">
          <LocationField
            inputPlaceholder={this.props.intl.formatMessage({
              id: 'components.WelcomeScreen.prompt'
            })}
            locationType="to"
            onTextInputClick={this._toFieldClicked}
            showClearButton={false}
          />
        </div>
        <div className="welcome-map">
          <DefaultMap onSetLocation={this._locationSetFromPopup} />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  setLocationToCurrent,
  setMobileScreen
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MobileWelcomeScreen))
