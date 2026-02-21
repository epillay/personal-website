import React from "react"
import { Link } from "gatsby"
import styled, { createGlobalStyle } from "styled-components"

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    background: #F6F1EB;
  }
`

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F6F1EB;
  color: #18140E;
  font-family: "Courier Prime", Courier, monospace;
`

const Heading = styled.h1`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(3rem, 10vw, 7rem);
  margin: 0;
  color: #18140E;
  letter-spacing: -0.03em;
`

const Sub = styled.p`
  font-size: clamp(13px, 1.4vw, 16px);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(24, 20, 14, 0.5);
  margin: 16px 0 40px;
`

const HomeLink = styled(Link)`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #C4503A;
  text-decoration: none;
  border-bottom: 1px solid rgba(196, 80, 58, 0.3);
  &:hover { border-color: #C4503A; }
`

const NotFoundPage = () => (
  <>
    <GlobalStyle />
    <Container>
      <Heading>404</Heading>
      <Sub>Page not found</Sub>
      <HomeLink to="/">← back home</HomeLink>
    </Container>
  </>
)

export const Head = () => <title>404 — Emily Pillay</title>

export default NotFoundPage
