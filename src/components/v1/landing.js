import React from "react"
import styled from "styled-components"
import "../../styles/fonts.js"
import Container from "./container"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"
import { monochromeBlue } from "../../styles/v1/colors"

const Background = styled.div`
  background-color: ${monochromeBlue.light3};
  display: block;
`

const LandingContainer = styled(Container)`
  padding-top: 15vh;
  height: 85vh;

  @media (min-width: 1000px) {
    padding-top: 25vh;
    height: 75vh;
  }
`

const Highlight = styled.span`
  background-color: ${monochromeBlue.light2};
  display: block;
  width: fit-content;
`

const Title = styled.span`
  font-size: 83px;
  display: block;
  font-weight: 700;
  color: ${monochromeBlue.primary};

  @media (min-width: 1000px) {
    font-size: 145px;
    width: 100%;
  }
`

const Subtitle = styled.span`
  font-style: italic;
  font-weight: 500;
  font-size: 28px;
  padding-left: 5px;
  display: block;
  color: ${monochromeBlue.dark3};

  @media (min-width: 1000px) {
    padding-left: 15px;
  }
`

const About = styled.p`
  font-size: 17px;
  display: block;
  padding-left: 5px;
  color: ${monochromeBlue.dark3};

  @media (min-width: 1000px) {
    font-size: 24px;
  }
`

const Arrow = styled(FontAwesomeIcon)`
  display: block;
  margin-top: 50px;
  color: ${monochromeBlue.light0};
  font-size: 5em;
  cursor: pointer;
  max-width: 65px;
`

const Landing = ({ title, subtitle, about }) => {
  return (
    <Background>
      <LandingContainer>
        <Subtitle>{subtitle}</Subtitle>
        <Title>{title}</Title>
        <About>{about}</About>
        <Arrow
          onClick={() => {
            const ref = document.getElementById("experience-section")
            ref.scrollIntoView({ behavior: "smooth" })
          }}
          icon={faArrowDown}
          size="1x"
          csssize="1em"
        ></Arrow>
      </LandingContainer>
    </Background>
  )
}

export default Landing
