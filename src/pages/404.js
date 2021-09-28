import React from "react"
import Layout from "../components/v1/layout"
import SEO from "../components/v1/seo"
import styled, { keyframes } from "styled-components"
import "../styles/fonts.js"
import SlideContainer from "../components/v2/slideContainer"
import Slide from "../components/v2/slide"

const gradient = keyframes`
  0% {
    background-position: 0% 50%
  }
  50% {
    background-position: 100% 50%
  }
  100% {
    background-position: 0% 50%
  }
`
const GradientContainer = styled(SlideContainer)`
  background: linear-gradient(
    -45deg,
    #fc35ac,
    #b14ebe,
    #fedd74,
    #86e0ce,
    #3bd7e4
  );
  background-size: 400% 400%;
  -webkit-animation: ${gradient} 15s ease infinite;
`
const BigText = styled.span`
  font-family: Montserrat;
  font-size: 50px;
  margin-top: 4px;

  @media (min-width: 800px) {
    font-size: 80px;
  }
`

const Description = styled.div`
  font-family: Courier;
  font-size: 18px;
  margin-left: 4px;
  margin-top: 8px;
  text-align: center;

  @media (min-width: 800px) {
    font-size: 20px;
  }

  @media (min-width: 1000px) {
    padding-bottom: 36px;
  }
`
const StyledLink = styled.a`
  color: inherit;
`

const OopsSlide = styled(Slide)`
  flex-direction: column;
  align-items: center;
  position: relative;

  @media (min-width: 800px) {
    font-size: 80px;
  }
`

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <GradientContainer>
      <OopsSlide>
        <BigText>Oops.</BigText>
        <Description>
          There's nothing here{" "}
          <StyledLink href="/">take me back home</StyledLink>
        </Description>
      </OopsSlide>
    </GradientContainer>
  </Layout>
)

export default NotFoundPage
