import React from "react"
import styled, { keyframes } from "styled-components"
import SlideContainer from "../components/v2/slideContainer"
import Slide from "../components/v2/slide"
import Layout from "../components/v1/layout"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"

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

const SocialIcon = styled.a`
  text-decoration: none;
  color: inherit;
  margin-right: 20px;
  margin-left: 20px;
`
const Icon = styled(FontAwesomeIcon)`
  font-size: 18px;

  @media (min-width: 800px) {
    font-size: 24px;
  }
`
const Icons = styled.div`
  display: flex;
  justify-content: center;
`

const Header = styled.span`
  font-family: Courier;
  font-size: 24px;
  margin-left: 4px;

  @media (min-width: 800px) {
    font-size: 36px;
    text-align: left;
  }
`

const IntroHeader = styled(Header)`
  text-align: center;
`

const BigText = styled.span`
  font-family: Montserrat;
  font-size: 50px;
  margin-top: 4px;

  @media (min-width: 800px) {
    font-size: 80px;
  }
`

const CenterBigText = styled(BigText)`
  text-align: center;
`

const Description = styled.div`
  font-family: Courier;
  font-size: 18px;
  margin-left: 4px;
  margin-top: 8px;

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

const StyledSandboxLink = styled(StyledLink)`
  text-decoration: none;
  border-bottom: 1px solid black;
`

const IntroSlide = styled(Slide)`
  flex-direction: column;
  align-items: center;
  position: relative;

  @media (min-width: 800px) {
    font-size: 80px;
  }
`

const About = styled(Description)`
  text-align: center;
`

const BlueportSlide = styled(IntroSlide)`
  align-items: start;
`

const BigBlueportText = styled(BigText)`
  font-size: 40px;
`

const AppfolioSlide = styled(BlueportSlide)``

const AppfolioSubtext = styled(BigText)`
  display: none;

  @media (min-width: 800px) {
    display: block;
  }
`

const NikeSlide = styled(BlueportSlide)``

const PersonalWebsiteSlide = styled(BlueportSlide)``

const ViennaSlide = styled(BlueportSlide)``

const SandboxSlide = styled(BlueportSlide)``

const HobbiesSlide = styled(BlueportSlide)``

const GetInTouchSlide = styled(IntroSlide)``

const GetInTouchText = styled(BigText)`
  font-size: 46px;
  margin-top: 8px;
  text-align: center;
`

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

const Scroll = styled(About)`
  font-family: Montserrat;
  position: absolute;
  bottom: 48px;
  font-size: 22px;
  animation: 3s ${fadeIn} infinite;
`

const IndexPage = () => {
  return (
    <Layout>
      <GradientContainer>
        <IntroSlide>
          <IntroHeader>hello, my name is</IntroHeader>
          <CenterBigText>Emily Pillay</CenterBigText>
          <About>
            I’m in my 4th year at Northeastern University studying computer
            science + cognitive psychology
          </About>
          <Scroll>scroll to learn more about me</Scroll>
        </IntroSlide>
        <NikeSlide>
          <Header>internship</Header>
          <BigText>Nike</BigText>
          <Description>
            I worked on store inventory management services + new store concept
            pitch with a group of other interns, our presentation made it to the
            top four!
          </Description>
        </NikeSlide>
        <AppfolioSlide>
          <Header>co-op</Header>
          <BigText>
            Appfolio <AppfolioSubtext>Investment Management</AppfolioSubtext>
          </BigText>
          <Description>
            worked with ruby, react, and typescript on customer relationship
            management functionalities + I iterated on a contact form feature
            with customer feedback, participated in customer calls, and worked
            on user scenarios
          </Description>
        </AppfolioSlide>
        <BlueportSlide>
          <Header>co-op</Header>
          <BigBlueportText>Blueport Commerce</BigBlueportText>
          <Description>
            I worked on a delivery tracking project, co-op led project,
            onboarding new co-ops, angular and custom css, and lead agile
            meetings
          </Description>
        </BlueportSlide>
        <SandboxSlide>
          <Header>student-led software consultancy</Header>
          <BigText>
            <StyledSandboxLink
              href="https://www.sandboxnu.com/"
              target="_blank"
            >
              Sandbox
            </StyledSandboxLink>
          </BigText>
          <Description>
            I worked on a react psychology project, became marketing director,
            lead our website redesign, worked on SearchNeu, and became
            operations director
          </Description>
        </SandboxSlide>
        <PersonalWebsiteSlide>
          <Header>website v0</Header>
          <BigText>Personal Website</BigText>
          <Description>
            this was the first iteration of my website that I made in summer of
            2020 check it out{" "}
            <StyledLink href="/old" target="_blank">
              here
            </StyledLink>
            {", "}
            for the current version of my website, I wanted to make a simple
            website from both a development and design perspective that still
            looked polished
          </Description>
        </PersonalWebsiteSlide>
        <ViennaSlide>
          <Header>study abroad</Header>
          <BigText>Vienna, Austria</BigText>
          <Description>
            I studied textile design + creative coding in Vienna, and had our
            "fish bowl" program shown at the Ars Electronica museum, check it
            out{" "}
            <StyledLink href="https://youtu.be/18q1gBEdaGQ" target="_blank">
              here
            </StyledLink>
          </Description>
        </ViennaSlide>
        <HobbiesSlide>
          <Header>here are some of my</Header>
          <BigText>Hobbies</BigText>
          <Description>
            I love baking, penpalling, thrifting, arts and crafts, and genshin
            impact
          </Description>
        </HobbiesSlide>
        <GetInTouchSlide>
          <Header>feel free to</Header>
          <GetInTouchText>Get in Touch</GetInTouchText>
          <Description>
            <Icons>
              <SocialIcon
                href={`mailto:pillay.e@northeastern.edu`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon={faEnvelope}></Icon>
              </SocialIcon>
              <SocialIcon
                href={"https://linkedin.com/in/epillay"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon={faLinkedin}></Icon>
              </SocialIcon>
              <SocialIcon
                href={"https://github.com/epillay"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon={faGithub}></Icon>
              </SocialIcon>
            </Icons>
          </Description>
        </GetInTouchSlide>
      </GradientContainer>
    </Layout>
  )
}

export default IndexPage
