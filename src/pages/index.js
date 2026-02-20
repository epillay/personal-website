import React, { useState, useRef, useEffect } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import Layout from "../components/v1/layout"

// ─── Palette ────────────────────────────────────────────────────────────────
const bg     = "#0A0906"
const cream  = "#F0EAE1"
const pink   = "#FF2D55"
const yellow = "#EDDF5E"
const muted  = "rgba(240, 234, 225, 0.28)"

// ─── Animations ─────────────────────────────────────────────────────────────
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`
const breathe = keyframes`
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 0.85; }
`

// ─── Global ─────────────────────────────────────────────────────────────────
const DarkGlobal = createGlobalStyle`
  html, body {
    background: ${bg};
  }
  ::-webkit-scrollbar { display: none; }
  * { -ms-overflow-style: none; scrollbar-width: none; box-sizing: border-box; }
`

// ─── Viewport ───────────────────────────────────────────────────────────────
const Viewport = styled.div`
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  background: ${bg};
  color: ${cream};
`

// ─── Slides ──────────────────────────────────────────────────────────────────
const Slide = styled.section`
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 clamp(1.5rem, 7vw, 7rem);
  position: relative;
`
const CenterSlide = styled(Slide)`
  align-items: center;
  text-align: center;
`

// ─── Progress Dots ───────────────────────────────────────────────────────────
const NavDots = styled.nav`
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 500;
  @media (max-width: 600px) { display: none; }
`
const NavDot = styled.button`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $active }) => ($active ? pink : muted)};
  transform: ${({ $active }) => ($active ? "scale(1.8)" : "scale(1)")};
  transition: background 0.3s ease, transform 0.3s ease;
  &:hover {
    background: ${cream};
    transform: scale(1.5);
  }
`

// ─── Hero Typography ─────────────────────────────────────────────────────────
const HeroName = styled.h1`
  font-family: "Bungee Shade", cursive;
  font-size: clamp(3rem, 10.5vw, 9.5rem);
  line-height: 0.88;
  margin: 0;
  color: ${cream};
  letter-spacing: -0.01em;
`
const Cursor = styled.span`
  display: inline-block;
  width: 3px;
  height: 0.72em;
  background: ${pink};
  margin-left: 8px;
  vertical-align: middle;
  animation: ${blink} 1s step-end infinite;
`
const HeroRole = styled.p`
  font-family: "Courier Prime", Courier, monospace;
  font-size: clamp(11px, 1.4vw, 16px);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${pink};
  margin: 28px 0 0;
`
const ScrollCue = styled.span`
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Courier Prime", Courier, monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${muted};
  animation: ${breathe} 3s ease-in-out infinite;
  white-space: nowrap;
`

// ─── Section Slides ───────────────────────────────────────────────────────────
const AccentBar = styled.div`
  width: 44px;
  height: 2px;
  background: ${({ $yellow }) => ($yellow ? yellow : pink)};
  margin-bottom: 18px;
`
const Category = styled.span`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: ${({ $yellow }) => ($yellow ? yellow : pink)};
  display: block;
  margin-bottom: 12px;
`
const BigText = styled.h2`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(2.8rem, 9.5vw, 8.5rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin: 0;
  color: ${cream};
`
const Sub = styled.span`
  display: block;
  font-size: 0.42em;
  font-weight: 900;
  opacity: 0.22;
  line-height: 1.15;
  margin-top: 4px;
`
const Body = styled.p`
  font-family: "Courier Prime", Courier, monospace;
  font-size: clamp(13px, 1.45vw, 16px);
  line-height: 1.8;
  max-width: 540px;
  color: rgba(240, 234, 225, 0.6);
  margin: 22px 0 0;
`
const InlineLink = styled.a`
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgba(240, 234, 225, 0.2);
  transition: border-color 0.2s;
  &:hover { border-color: ${pink}; }
`

// ─── Hobbies ─────────────────────────────────────────────────────────────────
const HobbyList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
`
const Hobby = styled.li`
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: clamp(1.25rem, 3vw, 2.5rem);
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: ${cream};
  &::before {
    content: "→";
    color: ${pink};
    margin-right: 12px;
    font-weight: 400;
  }
`

// ─── Contact ─────────────────────────────────────────────────────────────────
const ContactBig = styled(BigText)`
  font-size: clamp(2.5rem, 8.5vw, 7.5rem);
`
const Socials = styled.div`
  display: flex;
  gap: 36px;
  margin-top: 40px;
  justify-content: center;
`
const SocialLink = styled.a`
  color: ${muted};
  font-size: clamp(20px, 2.4vw, 26px);
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
  &:hover {
    color: ${cream};
    transform: translateY(-4px);
  }
`

// ─── Page ────────────────────────────────────────────────────────────────────
const TOTAL = 9

const IndexPage = () => {
  const [active, setActive] = useState(0)
  const vpRef = useRef(null)

  useEffect(() => {
    const el = vpRef.current
    if (!el) return
    const handler = () => {
      setActive(Math.round(el.scrollTop / window.innerHeight))
    }
    el.addEventListener("scroll", handler, { passive: true })
    return () => el.removeEventListener("scroll", handler)
  }, [])

  const goTo = i => {
    const el = vpRef.current
    if (!el) return
    el.scrollTo({ top: i * window.innerHeight, behavior: "smooth" })
  }

  return (
    <Layout>
      <DarkGlobal />

      <NavDots aria-label="Page navigation">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <NavDot
            key={i}
            $active={active === i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </NavDots>

      <Viewport ref={vpRef}>

        {/* 0 — Hero */}
        <Slide>
          <HeroName>
            Emily
            <br />
            Pillay
            <Cursor />
          </HeroName>
          <HeroRole>Senior Software Engineer</HeroRole>
          <ScrollCue>scroll to explore ↓</ScrollCue>
        </Slide>

        {/* 1 — Klaviyo */}
        <Slide>
          <AccentBar />
          <Category>senior software engineer</Category>
          <BigText>Klaviyo</BigText>
          <Body>
            On the WhatsApp team, building infrastructure to send messages at
            scale and supporting WhatsApp as a fully integrated channel across
            the Klaviyo platform.
          </Body>
        </Slide>

        {/* 2 — Nike */}
        <Slide>
          <AccentBar />
          <Category>internship</Category>
          <BigText>Nike</BigText>
          <Body>
            Worked on store inventory management services and led a new store
            concept pitch with fellow interns. Our presentation made the top four.
          </Body>
        </Slide>

        {/* 2 — Appfolio */}
        <Slide>
          <AccentBar />
          <Category>co-op</Category>
          <BigText>
            Appfolio
            <Sub>Investment Management</Sub>
          </BigText>
          <Body>
            Ruby, React, and TypeScript on CRM features. Iterated on a contact
            form with real customer feedback, joined customer calls, and owned
            user scenarios end-to-end.
          </Body>
        </Slide>

        {/* 3 — Blueport */}
        <Slide>
          <AccentBar />
          <Category>co-op</Category>
          <BigText>
            Blueport
            <Sub>Commerce</Sub>
          </BigText>
          <Body>
            Built a delivery tracking project, led agile ceremonies, onboarded
            incoming co-ops, and shipped custom CSS components in Angular.
          </Body>
        </Slide>

        {/* 4 — Sandbox */}
        <Slide>
          <AccentBar />
          <Category>student-led consultancy</Category>
          <BigText>
            <InlineLink
              href="https://www.sandboxnu.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sandbox
            </InlineLink>
          </BigText>
          <Body>
            React psych research app → marketing director → led the website
            redesign → SearchNEU contributor → operations director.
          </Body>
        </Slide>

        {/* 5 — Vienna */}
        <Slide>
          <AccentBar $yellow />
          <Category $yellow>study abroad</Category>
          <BigText>
            Vienna
            <Sub>Austria</Sub>
          </BigText>
          <Body>
            Studied textile design + creative coding. Our "fish bowl" program
            was exhibited at the{" "}
            <InlineLink
              href="https://youtu.be/18q1gBEdaGQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ars Electronica
            </InlineLink>{" "}
            museum.
          </Body>
        </Slide>

        {/* 6 — Hobbies */}
        <Slide>
          <AccentBar />
          <Category>outside the terminal</Category>
          <BigText>Life</BigText>
          <HobbyList>
            <Hobby>learning</Hobby>
            <Hobby>thrifting</Hobby>
            <Hobby>travelling</Hobby>
            <Hobby>cooking</Hobby>
            <Hobby>한국어</Hobby>
          </HobbyList>
        </Slide>

        {/* 7 — Contact */}
        <CenterSlide>
          <Category>let's connect</Category>
          <ContactBig>
            Get in
            <br />
            Touch
          </ContactBig>
          <Socials>
            <SocialLink
              href="mailto:epillay221@gmail.com"
              aria-label="Email"
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </SocialLink>
            <SocialLink
              href="https://linkedin.com/in/epillay"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </SocialLink>
            <SocialLink
              href="https://github.com/epillay"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} />
            </SocialLink>
          </Socials>
        </CenterSlide>

      </Viewport>
    </Layout>
  )
}

export default IndexPage
