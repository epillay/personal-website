import React, { useState } from "react"
import styled from "styled-components"
import "../../styles/fonts.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaintBrush } from "@fortawesome/free-solid-svg-icons"

const Bar = styled.div`
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 2;
`
const IconContainer = styled.a``

const Paintbrush = styled(FontAwesomeIcon)`
  margin-right: 80px;
  padding: 16px;
`

const Nav = ({ props }) => {
  const [colorScheme, setColorScheme] = useState(false)
  return (
    <Bar>
      {colorScheme && <span>SHOW COLOR SCHEMES</span>}
      <IconContainer onClick={() => setColorScheme(!colorScheme)}>
        <Paintbrush icon={faPaintBrush} size="2x"></Paintbrush>
      </IconContainer>
    </Bar>
  )
}

export default Nav
