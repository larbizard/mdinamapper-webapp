import { ButtonGroup } from 'react-bootstrap'
import styled from 'styled-components'

export const FlexButtonGroup = styled(ButtonGroup)`
  display: flex;
  flex: 1;
  margin-top: 5px;
  button {
    flex: 1;
  }
`

export const NarrativeItinerariesContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`
