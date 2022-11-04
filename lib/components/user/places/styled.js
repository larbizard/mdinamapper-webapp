import React from 'react'
import styled from 'styled-components'

import Place, {
  ActionButton,
  ActionButtonPlaceholder,
  IconWrapper,
  PlaceButton,
  PlaceContent,
  PlaceDetail,
  PlaceName
} from './place'

// Styles and exports for favorite place components
// used in the My account page.

const FAVORITE_PLACE_HEIGHT_PX = '60px'

const StyledFavoritePlace = styled(Place)`
  align-items: stretch;
  display: flex;
  height: ${FAVORITE_PLACE_HEIGHT_PX};
  margin-bottom: 10px;

  ${PlaceButton} {
    align-items: center;
    display: flex;
    flex: 1 0 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
  }
  ${PlaceContent} {
    display: inline-block;
    margin-left: 10px;
  }
  ${PlaceDetail} {
    color: #888;
    display: block;
  }
  ${IconWrapper} {
    color: #888;
    flex-shrink: 0;
  }
  ${ActionButton}, ${ActionButtonPlaceholder} {
    margin-left: 4px;
    width: ${FAVORITE_PLACE_HEIGHT_PX};
  }
`

export const FavoritePlace = (props) => (
  <StyledFavoritePlace largeIcon {...props} />
)

// Styles and exports for the place component
// used in the main panel.

export const StyledMainPanelPlace = styled(Place)`
  ${PlaceButton} {
    border: none;
  }
  ${PlaceName} {
    margin-left: 0.25em;
  }
  ${PlaceDetail} {
    display: block;
    height: 100%;
  }
  ${ActionButton} {
    border: none;
    width: 40px;
  }
`
