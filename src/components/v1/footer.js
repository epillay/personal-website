import PropTypes from "prop-types"
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import styled from "styled-components"
import Container from "./container"
import { monochromeBlue } from "../../styles/v1/colors"

const Background = styled.div`
  background-color: white;
  display: block;
`
const FooterContainer = styled(Container)`
  height: 20vh;
  padding-top: 5vh;
  margin: 0 auto;
  display: block;
  text-align: center;
`
const SocialIcon = styled.a`
  text-decoration: none;
  color: inherit;
  margin-right: 20px;
  margin-left: 20px;
  color: ${monochromeBlue.dark2};
`

const Title = styled.span`
  display: block;
  margin-bottom: 25px;
  font-weight: 500;
  font-family: Montserrat;
  font-size: 32px;
  font-style: italic;
  color: ${monochromeBlue.dark2};
`

const Icons = styled.div`
  margin-bottom: 50px;
  display: flex;
  justify-content: center;
  color: ${monochromeBlue.dark2};
`

const BuiltWith = styled.span`
    color: ${monochromeBlue.dark0};
    font-size: 14px;
    margin-top: 45px;
    display: block;
    margin-bottom: 20px;
}
`

const Icon = styled(FontAwesomeIcon)`
  font-size: 26px;
`

const FooterLink = styled(SocialIcon)`
  margin-right: 0;
  margin-left: 0;
  text-decoration: underline;
  color: ${monochromeBlue.dark0};
`

const Footer = ({ title, socials }) => {
  return (
    <Background>
      <FooterContainer>
        <Title>{title}</Title>
        <Icons>
          <SocialIcon
            href={`mailto:${socials.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon={faEnvelope}></Icon>
          </SocialIcon>
          <SocialIcon
            href={socials.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon={faLinkedin}></Icon>
          </SocialIcon>
          <SocialIcon
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon={faGithub}></Icon>
          </SocialIcon>
        </Icons>
        <BuiltWith>
          © {new Date().getFullYear()}, Built by Emily Pillay with
          {` `}
          <FooterLink
            href="https://www.gatsbyjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gatsby
          </FooterLink>
        </BuiltWith>
      </FooterContainer>
    </Background>
  )
}

Footer.propTypes = {
  title: PropTypes.string.isRequired,
}

export default Footer
