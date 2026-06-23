import React, { useState, useRef, useEffect } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import Layout from "../components/v1/layout"

// ─── Palette ────────────────────────────────────────────────────────────────
const bg       = "#020B18"
const surface  = "#041325"
const blue     = "#4DA2FF"
const teal     = "#6FBCF0"
const accent   = "#009ECE"
const textMain = "#E8F4FF"
const textMid  = "rgba(232,244,255,0.62)"
const textDim  = "rgba(232,244,255,0.28)"
const border   = "rgba(77,162,255,0.16)"
const borderHi = "rgba(77,162,255,0.45)"

// ─── Animations ─────────────────────────────────────────────────────────────
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`
const breathe = keyframes`
  0%, 100% { opacity: 0.25; }
  50%       { opacity: 0.7; }
`
const floatUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`
const pulseRing = keyframes`
  0%   { transform: scale(0.95); opacity: 0.6; }
  70%  { transform: scale(1.08); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0; }
`

// ─── Global ─────────────────────────────────────────────────────────────────
const SuiGlobal = createGlobalStyle`
  html, body {
    background: ${bg};
  }
  ::-webkit-scrollbar { display: none; }
  * { -ms-overflow-style: none; scrollbar-width: none; box-sizing: border-box; }
`

// ─── Layout ──────────────────────────────────────────────────────────────────
const Viewport = styled.div`
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  background: ${bg};
  color: ${textMain};
`

const Slide = styled.section`
  min-height: 100vh;
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 clamp(1.5rem, 7vw, 7rem);
  position: relative;
  overflow: hidden;
`

const CenterSlide = styled(Slide)`
  align-items: center;
  text-align: center;
`

// ─── Nav dots ────────────────────────────────────────────────────────────────
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
  background: ${({ $active }) => ($active ? blue : textDim)};
  transform: ${({ $active }) => ($active ? "scale(1.8)" : "scale(1)")};
  transition: background 0.3s, transform 0.3s;
  &:hover { background: ${teal}; transform: scale(1.5); }
`

// ─── Background glow ─────────────────────────────────────────────────────────
const Glow = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.12;
`

// ─── Common text atoms ───────────────────────────────────────────────────────
const Label = styled.span`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${blue};
  display: block;
  margin-bottom: 14px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s ease-out 80ms, transform 0.5s ease-out 80ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const Heading = styled.h2`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(2.6rem, 9vw, 8rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin: 0;
  color: ${textMain};
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.55s ease-out 160ms, transform 0.55s ease-out 160ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const Sub = styled.span`
  display: block;
  font-size: 0.4em;
  font-weight: 900;
  color: ${blue};
  opacity: 0.7;
  line-height: 1.25;
  margin-top: 6px;
`

const Body = styled.p`
  font-family: "Courier Prime", Courier, monospace;
  font-size: clamp(13px, 1.45vw, 15.5px);
  line-height: 1.85;
  max-width: 560px;
  color: ${textMid};
  margin: 22px 0 0;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 260ms, transform 0.55s ease-out 260ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const AccentBar = styled.div`
  width: 0;
  height: 2px;
  background: ${blue};
  margin-bottom: 20px;
  transition: width 0.45s ease-out;
  .is-visible & { width: 44px; }
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
  color: ${textDim};
  animation: ${breathe} 3s ease-in-out infinite;
  white-space: nowrap;
`

// ─── Hero ────────────────────────────────────────────────────────────────────
const HeroEyebrow = styled.span`
  font-family: "Courier Prime", Courier, monospace;
  font-size: clamp(10px, 1.2vw, 13px);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: ${blue};
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  opacity: 0;
  transition: opacity 0.5s ease-out 0ms;
  .is-visible & { opacity: 1; }
  &::before {
    content: "";
    display: inline-block;
    width: 28px;
    height: 1px;
    background: ${blue};
  }
`

const HeroName = styled.h1`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(3.5rem, 12vw, 11rem);
  line-height: 0.86;
  margin: 0;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  background: linear-gradient(135deg, ${textMain} 30%, ${blue} 70%, ${teal} 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 6s linear infinite;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.6s ease-out 100ms, transform 0.6s ease-out 100ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const HeroSub = styled.p`
  font-family: "Courier Prime", Courier, monospace;
  font-size: clamp(12px, 1.5vw, 16px);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${textMid};
  margin: 26px 0 0;
  max-width: 480px;
  line-height: 1.8;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 280ms, transform 0.55s ease-out 280ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const HeroCTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding: 14px 32px;
  border: 1.5px solid ${blue};
  font-family: "Courier Prime", Courier, monospace;
  font-size: 12px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: ${blue};
  text-decoration: none;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 380ms, transform 0.55s ease-out 380ms, background 0.2s, color 0.2s;
  .is-visible & { opacity: 1; transform: translateY(0); }
  &:hover {
    background: ${blue};
    color: ${bg};
  }
`

// ─── Stats row ───────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: flex;
  gap: 0;
  margin-top: 36px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 340ms, transform 0.55s ease-out 340ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
  @media (max-width: 580px) { flex-direction: column; }
`

const StatItem = styled.div`
  padding: 18px 32px 18px 0;
  border-right: 1px solid ${border};
  margin-right: 32px;
  &:last-child { border-right: none; margin-right: 0; }
  @media (max-width: 580px) {
    border-right: none;
    border-bottom: 1px solid ${border};
    padding: 14px 0;
    margin-right: 0;
    margin-bottom: 0;
  }
`

const StatNum = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(1.5rem, 3.5vw, 2.6rem);
  color: ${blue};
  line-height: 1;
`

const StatLabel = styled.div`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${textDim};
  margin-top: 5px;
`

// ─── Why Sui section ─────────────────────────────────────────────────────────
const PillarsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 28px;
  max-width: 600px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 280ms, transform 0.55s ease-out 280ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`

const Pillar = styled.div`
  padding: 18px 20px;
  border: 1px solid ${border};
  background: ${surface};
  position: relative;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(77,162,255,0.04) 0%, transparent 60%);
    pointer-events: none;
  }
`

const PillarIcon = styled.div`
  font-size: 1.4rem;
  margin-bottom: 10px;
  line-height: 1;
`

const PillarTitle = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: clamp(0.9rem, 1.6vw, 1.05rem);
  color: ${textMain};
  margin-bottom: 6px;
`

const PillarBody = styled.div`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 12px;
  line-height: 1.7;
  color: ${textMid};
`

// ─── Tiers section ───────────────────────────────────────────────────────────
const TiersRow = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 28px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.55s ease-out 220ms, transform 0.55s ease-out 220ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
  @media (max-width: 700px) { flex-direction: column; }
`

const TierCard = styled.div`
  flex: 1;
  padding: 24px 20px;
  border: 1.5px solid ${({ $featured }) => ($featured ? blue : border)};
  background: ${({ $featured }) => ($featured ? "rgba(77,162,255,0.06)" : surface)};
  position: relative;
  display: flex;
  flex-direction: column;
`

const TierBadge = styled.div`
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: ${blue};
  color: ${bg};
  font-family: "Courier Prime", Courier, monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  padding: 3px 14px;
`

const TierName = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $featured }) => ($featured ? blue : textMid)};
  margin-bottom: 4px;
`

const TierTagline = styled.div`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 11px;
  color: ${textDim};
  margin-bottom: 16px;
`

const TierDivider = styled.div`
  height: 1px;
  background: ${border};
  margin-bottom: 16px;
`

const TierList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`

const TierItem = styled.li`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: ${textMid};
  padding: 4px 0;
  &::before {
    content: "→ ";
    color: ${blue};
  }
`

const TierCTA = styled.a`
  display: block;
  margin-top: 20px;
  padding: 10px;
  text-align: center;
  border: 1px solid ${({ $featured }) => ($featured ? blue : border)};
  font-family: "Courier Prime", Courier, monospace;
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: ${({ $featured }) => ($featured ? blue : textDim)};
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ $featured }) => ($featured ? blue : "rgba(77,162,255,0.08)")};
    color: ${({ $featured }) => ($featured ? bg : textMain)};
  }
`

// ─── Benefits section ────────────────────────────────────────────────────────
const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 28px;
  max-width: 620px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 220ms, transform 0.55s ease-out 220ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const BenefitRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 16px 20px;
  border: 1px solid ${border};
  background: ${surface};
  transition: border-color 0.2s;
  &:hover { border-color: ${borderHi}; }
`

const BenefitNum = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: 1.4rem;
  color: ${blue};
  opacity: 0.35;
  line-height: 1;
  min-width: 32px;
`

const BenefitContent = styled.div``

const BenefitTitle = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: clamp(0.88rem, 1.5vw, 1rem);
  color: ${textMain};
  margin-bottom: 4px;
`

const BenefitBody = styled.div`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 12px;
  line-height: 1.7;
  color: ${textMid};
`

// ─── Ecosystem section ───────────────────────────────────────────────────────
const EcosystemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 28px;
  max-width: 680px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 220ms, transform 0.55s ease-out 220ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
  @media (max-width: 560px) { grid-template-columns: 1fr 1fr; }
`

const EcoCard = styled.div`
  padding: 18px 16px;
  border: 1px solid ${border};
  background: ${surface};
  &:hover { border-color: ${borderHi}; }
  transition: border-color 0.2s;
`

const EcoIcon = styled.div`
  font-size: 1.3rem;
  margin-bottom: 10px;
`

const EcoName = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${textMain};
  margin-bottom: 5px;
`

const EcoDesc = styled.div`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 11px;
  line-height: 1.65;
  color: ${textDim};
`

// ─── CTA section ────────────────────────────────────────────────────────────
const CtaHeading = styled.h2`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(2.4rem, 8vw, 7rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin: 0;
  color: ${textMain};
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.55s ease-out 160ms, transform 0.55s ease-out 160ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const CtaButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease-out 300ms, transform 0.55s ease-out 300ms;
  .is-visible & { opacity: 1; transform: translateY(0); }
`

const PrimaryBtn = styled.a`
  padding: 14px 36px;
  background: ${blue};
  color: ${bg};
  font-family: "Courier Prime", Courier, monospace;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: 700;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
`

const SecondaryBtn = styled.a`
  padding: 13px 36px;
  border: 1.5px solid ${border};
  color: ${textMid};
  font-family: "Courier Prime", Courier, monospace;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
  &:hover { border-color: ${blue}; color: ${blue}; }
`

const CtaNote = styled.p`
  font-family: "Courier Prime", Courier, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: ${textDim};
  margin-top: 20px;
  opacity: 0;
  transition: opacity 0.55s ease-out 400ms;
  .is-visible & { opacity: 1; }
`

// ─── Dot pulse for hero ──────────────────────────────────────────────────────
const PulseDot = styled.span`
  position: relative;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${blue};
  margin-right: 10px;
  vertical-align: middle;
  &::after {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1.5px solid ${blue};
    animation: ${pulseRing} 2s ease-out infinite;
  }
`

const Cursor = styled.span`
  display: inline-block;
  width: 3px;
  height: 0.72em;
  background: ${blue};
  margin-left: 8px;
  vertical-align: middle;
  animation: ${blink} 1s step-end infinite;
`

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { num: "297ms",  label: "Avg. time-to-finality" },
  { num: "297K+",  label: "TPS capacity"           },
  { num: "3,000+", label: "Ecosystem projects"     },
  { num: "$500M+", label: "Partner grant pool"     },
]

const PILLARS = [
  { icon: "⚡", title: "Move-native Speed",     body: "Object-centric execution model eliminates bottlenecks that slow EVM chains." },
  { icon: "🔒", title: "Parallel Processing",   body: "Independent transactions run simultaneously, unlocking linear throughput scaling." },
  { icon: "🌊", title: "zkLogin & Wallets",     body: "Abstract crypto complexity with social login. Ship to mainstream users, not just degens." },
  { icon: "🌐", title: "Multi-chain Ready",     body: "Native bridges to Ethereum, Solana, and Aptos. Meet your users wherever they are." },
]

const TIERS = [
  {
    name: "Builder",
    tagline: "For indie devs & early startups",
    featured: false,
    perks: [
      "Access to Sui developer docs & SDK",
      "Testnet SUI token grant (up to $10K)",
      "Community Discord support channel",
      "Listed in Sui Ecosystem directory",
      "Monthly partner roundtable",
    ],
  },
  {
    name: "Growth",
    tagline: "For scaling protocols & dApps",
    featured: true,
    badge: "Most Popular",
    perks: [
      "Everything in Builder",
      "Dedicated partner success manager",
      "Co-marketing & joint announcements",
      "SUI grant up to $250K",
      "Early access to protocol upgrades",
      "Sui Foundation introductions",
    ],
  },
  {
    name: "Strategic",
    tagline: "For enterprises & major protocols",
    featured: false,
    perks: [
      "Everything in Growth",
      "Executive-level alignment sessions",
      "Custom integration engineering",
      "SUI grant — negotiated",
      "Flagship ecosystem placement",
      "Direct board & investor access",
    ],
  },
]

const BENEFITS = [
  { title: "Technical Integration Support",  body: "Dedicated Move engineers pair with your team to accelerate on-chain integration, audit smart contracts, and optimize gas efficiency from day one." },
  { title: "Go-to-Market Amplification",     body: "Co-branded campaigns, Mysten Labs press support, and placement across Sui's owned channels reaching 2M+ followers." },
  { title: "SUI Token Grants",               body: "Non-dilutive funding from the Sui Foundation to cover infrastructure, audits, liquidity, and growth experiments." },
  { title: "Investor & BD Introductions",    body: "Warm intros to Mysten Labs' VC network, strategic LPs, and ecosystem funds actively deploying into Sui projects." },
  { title: "Early Protocol Access",          body: "Shape the roadmap. Growth and Strategic partners receive draft EIPs, testnet access, and seats in governance working groups." },
]

const ECOSYSTEM = [
  { icon: "💸", name: "DeFi",       desc: "Cetus, Turbos, Aftermath — deep liquidity from day one" },
  { icon: "🎮", name: "Gaming",     desc: "Native asset ownership with sub-second settlement" },
  { icon: "🖼", name: "NFTs",       desc: "Object model enables truly on-chain, composable assets" },
  { icon: "🏦", name: "RWA",        desc: "Regulated tokenization with zkLogin compliance flows" },
  { icon: "🤖", name: "AI × Web3", desc: "On-chain agent coordination & verifiable inference" },
  { icon: "🔗", name: "Infra",      desc: "Oracles, indexers, wallets — the stack is open" },
]

const TOTAL = 7

// ─── Page ────────────────────────────────────────────────────────────────────
const SuiPage = () => {
  const [active, setActive] = useState(0)
  const vpRef = useRef(null)
  const slideRefs = useRef([])

  useEffect(() => {
    const el = vpRef.current
    if (!el) return
    const handler = () => setActive(Math.round(el.scrollTop / window.innerHeight))
    el.addEventListener("scroll", handler, { passive: true })
    return () => el.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    const root = vpRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { root, threshold: 0.25 }
    )
    slideRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const goTo = i => {
    const el = vpRef.current
    if (!el) return
    el.scrollTo({ top: i * window.innerHeight, behavior: "smooth" })
  }

  return (
    <Layout>
      <SuiGlobal />

      <NavDots aria-label="Page navigation">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <NavDot key={i} $active={active === i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </NavDots>

      <Viewport ref={vpRef}>

        {/* 0 — Hero */}
        <Slide ref={el => (slideRefs.current[0] = el)}>
          <Glow style={{ width: 600, height: 600, top: -200, right: -100, background: blue }} />
          <HeroEyebrow>
            <PulseDot />
            Sui Partnership Program
          </HeroEyebrow>
          <HeroName>
            Build on
            <br />
            Sui
            <Cursor />
          </HeroName>
          <HeroSub>
            Join 3,000+ projects powering the next generation of Web3
            on the fastest L1 ever built.
          </HeroSub>
          <HeroCTA href="#" onClick={e => { e.preventDefault(); goTo(6) }}>
            Apply to Partner →
          </HeroCTA>
          <ScrollCue>scroll to explore ↓</ScrollCue>
        </Slide>

        {/* 1 — Numbers */}
        <Slide ref={el => (slideRefs.current[1] = el)}>
          <Glow style={{ width: 500, height: 500, bottom: -150, left: -100, background: accent }} />
          <AccentBar />
          <Label>By the numbers</Label>
          <Heading>
            Scale
            <br />
            That Matters
          </Heading>
          <StatsRow>
            {STATS.map(s => (
              <StatItem key={s.label}>
                <StatNum>{s.num}</StatNum>
                <StatLabel>{s.label}</StatLabel>
              </StatItem>
            ))}
          </StatsRow>
          <Body>
            Sui processes more transactions than any other L1 in production
            — without sacrificing decentralisation or developer experience.
          </Body>
        </Slide>

        {/* 2 — Why Sui */}
        <Slide ref={el => (slideRefs.current[2] = el)}>
          <AccentBar />
          <Label>Why Sui</Label>
          <Heading>
            Built
            <br />
            Different
            <Sub>Move · Parallel · Object-Centric</Sub>
          </Heading>
          <PillarsGrid>
            {PILLARS.map(p => (
              <Pillar key={p.title}>
                <PillarIcon>{p.icon}</PillarIcon>
                <PillarTitle>{p.title}</PillarTitle>
                <PillarBody>{p.body}</PillarBody>
              </Pillar>
            ))}
          </PillarsGrid>
        </Slide>

        {/* 3 — Tiers */}
        <Slide ref={el => (slideRefs.current[3] = el)}>
          <AccentBar />
          <Label>Partnership tiers</Label>
          <Heading>
            Find
            <br />
            Your Fit
          </Heading>
          <TiersRow>
            {TIERS.map(t => (
              <TierCard key={t.name} $featured={t.featured}>
                {t.badge && <TierBadge>{t.badge}</TierBadge>}
                <TierName $featured={t.featured}>{t.name}</TierName>
                <TierTagline>{t.tagline}</TierTagline>
                <TierDivider />
                <TierList>
                  {t.perks.map(p => <TierItem key={p}>{p}</TierItem>)}
                </TierList>
                <TierCTA href="#" $featured={t.featured} onClick={e => { e.preventDefault(); goTo(6) }}>
                  Get Started
                </TierCTA>
              </TierCard>
            ))}
          </TiersRow>
        </Slide>

        {/* 4 — Benefits */}
        <Slide ref={el => (slideRefs.current[4] = el)}>
          <AccentBar />
          <Label>What you get</Label>
          <Heading>
            Partner
            <br />
            Benefits
          </Heading>
          <BenefitsList>
            {BENEFITS.map((b, i) => (
              <BenefitRow key={b.title}>
                <BenefitNum>0{i + 1}</BenefitNum>
                <BenefitContent>
                  <BenefitTitle>{b.title}</BenefitTitle>
                  <BenefitBody>{b.body}</BenefitBody>
                </BenefitContent>
              </BenefitRow>
            ))}
          </BenefitsList>
        </Slide>

        {/* 5 — Ecosystem */}
        <Slide ref={el => (slideRefs.current[5] = el)}>
          <Glow style={{ width: 400, height: 400, top: -100, right: -50, background: blue }} />
          <AccentBar />
          <Label>Ecosystem</Label>
          <Heading>
            Every
            <br />
            Vertical
            <Sub>DeFi · Gaming · NFTs · RWA · AI · Infra</Sub>
          </Heading>
          <EcosystemGrid>
            {ECOSYSTEM.map(e => (
              <EcoCard key={e.name}>
                <EcoIcon>{e.icon}</EcoIcon>
                <EcoName>{e.name}</EcoName>
                <EcoDesc>{e.desc}</EcoDesc>
              </EcoCard>
            ))}
          </EcosystemGrid>
        </Slide>

        {/* 6 — CTA */}
        <CenterSlide ref={el => (slideRefs.current[6] = el)}>
          <Glow style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: blue }} />
          <Label>Ready to ship?</Label>
          <CtaHeading>
            Apply
            <br />
            Today
          </CtaHeading>
          <CtaButtons>
            <PrimaryBtn href="https://sui.io/ecosystem" target="_blank" rel="noopener noreferrer">
              Apply to Partner
            </PrimaryBtn>
            <SecondaryBtn href="https://docs.sui.io" target="_blank" rel="noopener noreferrer">
              Read the Docs
            </SecondaryBtn>
          </CtaButtons>
          <CtaNote>
            Response within 5 business days · Non-dilutive grants available · All stages welcome
          </CtaNote>
        </CenterSlide>

      </Viewport>
    </Layout>
  )
}

export const Head = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Courier+Prime&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Sui Partnership Program</title>
  </>
)

export default SuiPage
