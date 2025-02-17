import React from 'react'

import Icon from '../util/icon'

const FieldTripStatusIcon = ({ ok }) => (
  ok
    ? <Icon className='text-success' type='check' />
    : <Icon className='text-warning' type='exclamation-circle' />
)

export default FieldTripStatusIcon
