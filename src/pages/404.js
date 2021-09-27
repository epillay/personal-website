import React from "react"

import Layout from "../components/v1/layout"
import SEO from "../components/v1/seo"
import { Link } from "gatsby"
import styled from "styled-components"
import "../styles/fonts.js"
import Container from "../components/v1/container"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowDown } from "@fortawesome/free-solid-svg-icons"
import { melon, floatie, bluebell, oak, bananaMilk } from "../styles/v1/colors"

const Background = styled.div`
  background-color: #fddfd7;
  display: block;
`

const NotFoundContainer = styled(Container)`
  padding-top: 25vh;
  height: 75vh;

  @media (min-width: 1000px) {
    padding-top: 25vh;
    height: 75vh;
  }
`

const Highlight = styled.span`
  background-color: ${bananaMilk};
  width: min-content;
  padding: 5px;
  font-style: italic;
  color: ${oak};
  transition: background-color 0.5s ease-out;
  &:hover {
    background-color: ${bluebell};
  }
`

const Title = styled.span`
  font-size: 83px;
  display: block;
  font-weight: 700;
  color: ${melon};

  @media (min-width: 1000px) {
    font-size: 145px;
    width: 100%;
  }
`

const Subtitle = styled.p`
  font-size: 17px;
  display: block;
  padding-left: 5px;
  color: ${oak};
  margin-left: 15px;

  @media (min-width: 1000px) {
    font-size: 24px;
  }
`

const BackHome = styled(Link)`
  margin-left: 20px;
  padding: 5px;
  text-decoration: none;
  width: fit-content;
`

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <Background>
      <NotFoundContainer>
        <Title>Oops.</Title>
        <Subtitle>There's nothing here</Subtitle>
        <BackHome to="/">
          <Highlight>Take me back home</Highlight>
        </BackHome>
      </NotFoundContainer>
    </Background>
  </Layout>
)

export default NotFoundPage
