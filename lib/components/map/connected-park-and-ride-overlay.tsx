import { connect } from 'react-redux'
// FIXME: type OTP-UI
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import React, { Component } from 'react'

import { parkAndRideQuery } from '../../actions/api'
import { setLocation } from '../../actions/map'

type ParkAndRideParams = {
  maxTransitDistance?: number
  // FIXME: properly type
}

class ConnectedParkAndRideOverlay extends Component<
  { parkAndRideQuery: (params: ParkAndRideParams) => void } & ParkAndRideParams
> {
  componentDidMount() {
    const params: ParkAndRideParams = {}
    if (this.props.maxTransitDistance) {
      params.maxTransitDistance = this.props.maxTransitDistance
    }
    // TODO: support config-defined bounding envelope

    this.props.parkAndRideQuery(params)
  }

  render() {
    return <ParkAndRideOverlay {...this.props} />
  }
}

// connect to the redux store

const mapStateToProps = (state: {
  // FIXME: Properly type OTP state
  otp: { overlay: { parkAndRide: { locations: unknown } } }
}) => {
  const { locations } = state.otp.overlay?.parkAndRide

  // object type indicates error
  if (typeof locations === 'object') {
    return {}
  }

  return {
    parkAndRideLocations: locations
  }
}

const mapDispatchToProps = {
  parkAndRideQuery,
  setLocation
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedParkAndRideOverlay)
