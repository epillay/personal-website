import React, { useState, useRef, useCallback } from "react"
import styled, { createGlobalStyle, keyframes, css } from "styled-components"
import Layout from "../components/v1/layout"

// ── DATA ──────────────────────────────────────────────────────────────────────

const CIVS = [
  { name:"America",      leader:"George Washington",        ability:"Manifest Destiny",               uniques:["Minuteman","B-17"],                        source:"base" },
  { name:"Arabia",       leader:"Harun al-Rashid",          ability:"Trade Caravans",                 uniques:["Camel Archer","Bazaar"],                   source:"base" },
  { name:"Aztec",        leader:"Montezuma",                ability:"Sacrificial Captives",           uniques:["Jaguar","Floating Gardens"],                source:"base" },
  { name:"China",        leader:"Wu Zetian",                ability:"Art of War",                     uniques:["Cho-Ko-Nu","Paper Maker"],                  source:"base" },
  { name:"Egypt",        leader:"Ramesses II",              ability:"Monument Builders",              uniques:["War Chariot","Burial Tomb"],                source:"base" },
  { name:"England",      leader:"Elizabeth I",              ability:"Sun Never Sets",                 uniques:["Longbowman","Ship of the Line"],            source:"base" },
  { name:"France",       leader:"Napoleon Bonaparte",       ability:"City of Light",                  uniques:["Musketeer","Château"],                     source:"base" },
  { name:"Germany",      leader:"Otto von Bismarck",        ability:"Furor Teutonicus",               uniques:["Landsknecht","Panzer"],                    source:"base" },
  { name:"Greece",       leader:"Alexander",                ability:"Hellenic League",                uniques:["Hoplite","Companion Cavalry"],              source:"base" },
  { name:"India",        leader:"Gandhi",                   ability:"Population Growth",              uniques:["War Elephant","Mughal Fort"],               source:"base" },
  { name:"Iroquois",     leader:"Hiawatha",                 ability:"The Great Warpath",              uniques:["Mohawk Warrior","Longhouse"],               source:"base" },
  { name:"Japan",        leader:"Oda Nobunaga",             ability:"Bushido",                        uniques:["Samurai","Zero"],                          source:"base" },
  { name:"Mongols",      leader:"Genghis Khan",             ability:"Mongol Terror",                  uniques:["Keshik","Khan"],                           source:"base" },
  { name:"Ottoman",      leader:"Suleiman the Magnificent", ability:"Barbary Corsairs",               uniques:["Janissary","Sipahi"],                      source:"base" },
  { name:"Persia",       leader:"Darius I",                 ability:"Achaemenid Legacy",              uniques:["Immortal","Satrap's Court"],               source:"base" },
  { name:"Rome",         leader:"Augustus Caesar",          ability:"The Glory of Rome",              uniques:["Ballista","Legion"],                       source:"base" },
  { name:"Russia",       leader:"Catherine",                ability:"Siberian Riches",                uniques:["Cossack","Krepost"],                       source:"base" },
  { name:"Siam",         leader:"Ramkhamhaeng",             ability:"Father Governs Children",        uniques:["Naresuan's Elephant","Wat"],               source:"base" },
  { name:"Songhai",      leader:"Askia",                    ability:"River Warlord",                  uniques:["Mandekalu Cavalry","Mud Pyramid Mosque"],  source:"base" },
  { name:"Byzantium",    leader:"Theodora",                 ability:"Patriarchate of Constantinople", uniques:["Cataphract","Dromon"],                     source:"gk"   },
  { name:"Carthage",     leader:"Dido",                     ability:"Phoenician Heritage",            uniques:["African Forest Elephant","Quinquereme"],   source:"gk"   },
  { name:"Celts",        leader:"Boudicca",                 ability:"Druidic Lore",                   uniques:["Pictish Warrior","Ceilidh Hall"],           source:"gk"   },
  { name:"Ethiopia",     leader:"Haile Selassie",           ability:"Spirit of Adwa",                 uniques:["Mehal Sefari","Stele"],                    source:"gk"   },
  { name:"The Huns",     leader:"Attila",                   ability:"Scourge of God",                 uniques:["Horse Archer","Battering Ram"],             source:"gk"   },
  { name:"Maya",         leader:"Pacal",                    ability:"The Long Count",                 uniques:["Atlatlist","Pyramid"],                     source:"gk"   },
  { name:"Netherlands",  leader:"William",                  ability:"Dutch Watertnet",                uniques:["Sea Beggar","Polder"],                     source:"gk"   },
  { name:"Sweden",       leader:"Gustavus Adolphus",        ability:"Nobel Prize",                    uniques:["Carolean","Hakkapeliitta"],                source:"gk"   },
  { name:"Assyria",      leader:"Ashurbanipal",             ability:"Treasure of Nineveh",            uniques:["Siege Tower","Royal Library"],             source:"bnw"  },
  { name:"Brazil",       leader:"Pedro II",                 ability:"Carnival",                       uniques:["Pracinha","Brazilwood Camp"],               source:"bnw"  },
  { name:"Indonesia",    leader:"Gajah Mada",               ability:"Spice Islanders",                uniques:["Kris Swordsman","Candi"],                  source:"bnw"  },
  { name:"Morocco",      leader:"Ahmad al-Mansur",          ability:"Gateway to Africa",              uniques:["Berber Cavalry","Kasbah"],                 source:"bnw"  },
  { name:"Poland",       leader:"Casimir III",              ability:"Solidarity",                     uniques:["Winged Hussar","Ducal Stable"],             source:"bnw"  },
  { name:"Portugal",     leader:"Maria I",                  ability:"Mare Clausum",                   uniques:["Nau","Feitoria"],                          source:"bnw"  },
  { name:"Shoshone",     leader:"Pocatello",                ability:"Great Expanse",                  uniques:["Pathfinder","Comanche Riders"],             source:"bnw"  },
  { name:"Venice",       leader:"Enrico Dandolo",           ability:"Serenissima",                    uniques:["Merchant of Venice","Great Galleass"],     source:"bnw"  },
  { name:"Zulu",         leader:"Shaka",                    ability:"Iklwa",                          uniques:["Impi","Ikanda"],                           source:"bnw"  },
  { name:"Austria",      leader:"Maria Theresa",            ability:"Diplomatic Marriage",            uniques:["Hussar","Coffee House"],                   source:"dlc"  },
  { name:"Babylon",      leader:"Nebuchadnezzar II",        ability:"Ingenuity",                      uniques:["Bowman","Walls of Babylon"],               source:"dlc"  },
  { name:"Denmark",      leader:"Harald Bluetooth",         ability:"Viking Fury",                    uniques:["Berserker","Norwegian Ski Infantry"],       source:"dlc"  },
  { name:"Inca",         leader:"Pachacuti",                ability:"Great Andean Road",              uniques:["Slinger","Terrace Farm"],                  source:"dlc"  },
  { name:"Korea",        leader:"Sejong",                   ability:"Scholars of the Jade Hall",      uniques:["Hwacha","Turtle Ship"],                    source:"dlc"  },
  { name:"Polynesia",    leader:"Kamehameha",               ability:"Wayfinding",                     uniques:["Maori Warrior","Moai"],                    source:"dlc"  },
  { name:"Spain",        leader:"Isabella",                 ability:"Seven Cities of Gold",           uniques:["Conquistador","Tercio"],                   source:"dlc"  },
]

const SOURCE_LABELS = { base: "Base Game", gk: "Gods & Kings", bnw: "Brave New World", dlc: "DLC" }

const RIVALRIES = [
  { name:"Greco-Persian Wars",     desc:"Clash of civilizations across the ancient Mediterranean",          civs:["Greece","Persia","Egypt","Rome","Carthage","Arabia","Babylon"] },
  { name:"Fall of Rome",           desc:"Barbarian hordes tear the eternal empire apart",                   civs:["Rome","The Huns","Germany","Celts","Byzantium","France","England"] },
  { name:"The Crusades",           desc:"Holy war drives armies across three continents",                   civs:["England","France","Germany","Arabia","Ottoman","Byzantium","Venice"] },
  { name:"Mongol Conquest",        desc:"The great horde sweeps from the Pacific to the gates of Europe",   civs:["Mongols","China","Persia","Russia","Japan","Korea","Siam"] },
  { name:"Age of Exploration",     desc:"European powers race to carve up the New World",                   civs:["Spain","Portugal","England","France","Netherlands","Aztec","Inca","Iroquois"] },
  { name:"Ottoman Ascendancy",     desc:"The empire at the crossroads of East and West",                    civs:["Ottoman","Byzantium","Venice","Austria","Persia","Arabia","Egypt"] },
  { name:"Cold War",               desc:"Superpowers hold the world on the brink of annihilation",          civs:["America","Russia","England","France","Germany","China","Japan","Korea"] },
  { name:"East Asian Powers",      desc:"Ancient rivalries simmer across the Pacific Rim",                  civs:["China","Japan","Korea","Mongols","Siam","Indonesia","India"] },
  { name:"African Empires",        desc:"Great kingdoms of the continent vie for dominance",                civs:["Ethiopia","Zulu","Morocco","Songhai","Egypt","Carthage"] },
  { name:"World War I",            desc:"An assassination ignites the powder keg of Europe",               civs:["Germany","England","France","Russia","Ottoman","Austria","Netherlands"] },
  { name:"Viking Age",             desc:"Norse raiders terrorize coastal kingdoms from Iceland to Byzantium",civs:["Denmark","Sweden","England","France","Germany","Netherlands","Celts"] },
  { name:"Mesopotamian Empires",   desc:"Cradle of civilization — ancient powers of the fertile crescent",  civs:["Babylon","Assyria","Persia","Arabia","Egypt","Ottoman","Greece"] },
  { name:"New World Resistance",   desc:"Indigenous nations resist and compete with colonial encroachment", civs:["America","Iroquois","Shoshone","Aztec","Inca","Maya","France","England"] },
  { name:"Mediterranean Powers",   desc:"Trade empires battle for control of the inland sea",               civs:["Venice","Ottoman","Carthage","Rome","Greece","Spain","Portugal","Morocco"] },
]

const REGIONS = {
  "Europe":               ["England","France","Germany","Spain","Netherlands","Sweden","Denmark","Poland","Portugal","Celts","Rome","Greece","Byzantium","Ottoman","Venice","Austria","Russia"],
  "Asia & Pacific":       ["China","Japan","Korea","Mongols","Siam","Indonesia","India","Persia","Polynesia","The Huns"],
  "Africa & Middle East": ["Arabia","Babylon","Assyria","Egypt","Carthage","Ethiopia","Morocco","Zulu","Songhai"],
  "Americas":             ["America","Aztec","Inca","Iroquois","Shoshone","Brazil","Maya"],
}

const PLAYSTYLES = {
  "Domination": { icon:"⚔", civs:["Mongols","The Huns","Germany","Aztec","Japan","Zulu","Denmark","Rome","Assyria","England","Ottoman","China"] },
  "Science":    { icon:"⚗", civs:["Korea","Babylon","Maya"] },
  "Culture":    { icon:"♦", civs:["France","Brazil","Poland","Polynesia","Egypt"] },
  "Religion":   { icon:"✦", civs:["Byzantium","Ethiopia","India","Celts","Arabia"] },
  "Economic":   { icon:"◈", civs:["Venice","Morocco","Portugal","Netherlands","Persia","Songhai","Russia"] },
  "Diplomatic": { icon:"◉", civs:["Greece","Austria","Siam","Sweden"] },
  "Expansion":  { icon:"◎", civs:["America","Inca","Iroquois","Shoshone","Spain","Carthage","Indonesia"] },
}

const NAME_TO_IDX = {}
CIVS.forEach((c, i) => { NAME_TO_IDX[c.name] = i })

// ── HELPERS ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function resolvePlaystylePool(selectedPlaystyles) {
  const names = new Set()
  selectedPlaystyles.forEach(style => PLAYSTYLES[style].civs.forEach(n => names.add(n)))
  return [...names].map(n => NAME_TO_IDX[n]).filter(i => i !== undefined)
}

// ── ANIMATIONS ────────────────────────────────────────────────────────────────

const revealGlow = keyframes`
  0%   { box-shadow: 0 0 0 rgba(201,168,76,0); border-color: #2a1e0c; }
  25%  { box-shadow: 0 0 50px rgba(201,168,76,0.45); border-color: #c9a84c; }
  100% { box-shadow: 0 0 25px rgba(201,168,76,0.07); border-color: #7a5f28; }
`

const cardRollAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20%  { transform: translateX(-1.5px); }
  60%  { transform: translateX(1.5px); }
`

const textFlicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

const bannerIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const civFadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── GLOBAL STYLE ──────────────────────────────────────────────────────────────

const CivGlobal = createGlobalStyle`
  html, body {
    background: #080603 !important;
    font-family: 'EB Garamond', Georgia, serif !important;
    margin: 0;
    min-height: 100vh;
  }
`

// ── PALETTE ───────────────────────────────────────────────────────────────────

const C = {
  bg:          "#080603",
  card:        "#181208",
  cardBorder:  "#2a1e0c",
  gold:        "#c9a84c",
  goldBright:  "#e8c96a",
  goldDim:     "#7a5f28",
  text:        "#e8d4a8",
  textMuted:   "#8a7040",
  textDim:     "#3e2e14",
}

// ── STYLED COMPONENTS ─────────────────────────────────────────────────────────

const PageWrap = styled.div`
  min-height: 100vh;
  background: ${C.bg};
  background-image:
    radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 20% 100%, rgba(122,24,24,0.04) 0%, transparent 50%);
  color: ${C.text};
  padding-bottom: 4rem;
`

/* Header */

const Header = styled.header`
  text-align: center;
  padding: 3rem 2rem 1.5rem;
`

const HeaderEyebrow = styled.p`
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.45em;
  color: ${C.textDim};
  text-transform: uppercase;
  margin-bottom: 1.1rem;
`

const GameTitle = styled.h1`
  font-family: 'Cinzel', serif;
  font-size: clamp(2.2rem, 6vw, 4.2rem);
  font-weight: 900;
  color: ${C.gold};
  letter-spacing: 0.14em;
  line-height: 1;
  text-shadow: 0 0 60px rgba(201,168,76,0.22);
  margin: 0;
`

const TitleOrnament = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  color: ${C.goldDim};
  letter-spacing: 0.5em;
  display: block;
  margin: 0.45rem 0;
`

const Subtitle = styled.h2`
  font-family: 'Cinzel', serif;
  font-size: clamp(0.7rem, 1.8vw, 0.9rem);
  font-weight: 400;
  color: ${C.textMuted};
  letter-spacing: 0.55em;
  text-transform: uppercase;
  margin: 0 0 1.4rem;
`

const HeaderRule = styled.div`
  width: 340px;
  max-width: 90%;
  height: 1px;
  background: linear-gradient(to right, transparent, ${C.goldDim}, transparent);
  margin: 0 auto;
`

/* Mode tabs */

const ModeSection = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 1rem;
`

const ModeTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`

const ModeTab = styled.button`
  background: ${C.card};
  border: 1px solid ${({ $active }) => $active ? C.gold : C.cardBorder};
  color: ${({ $active }) => $active ? C.gold : C.textDim};
  background: ${({ $active }) => $active ? "rgba(201,168,76,0.06)" : C.card};
  font-family: 'Cinzel', serif;
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  padding: 0.65rem 1.4rem;
  cursor: pointer;
  text-transform: uppercase;
  margin-left: -1px;
  position: relative;
  z-index: ${({ $active }) => $active ? 2 : 1};
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  &:first-child { margin-left: 0; }
  &:hover { color: ${C.textMuted}; border-color: ${C.goldDim}; z-index: 1; }
`

const ModePanel = styled.div`
  margin-bottom: 0.5rem;
`

const PanelLabel = styled.p`
  font-family: 'Cinzel', serif;
  font-size: 0.52rem;
  letter-spacing: 0.4em;
  color: ${C.goldDim};
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0.7rem;
`

/* Rivalries */

const ScenarioList = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
  scrollbar-width: thin;
  scrollbar-color: ${C.goldDim} transparent;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${C.goldDim}; }
`

const ScenarioPill = styled.button`
  flex-shrink: 0;
  background: ${C.card};
  border: 1px solid ${({ $active }) => $active ? C.gold : C.cardBorder};
  color: ${({ $active }) => $active ? C.gold : C.textDim};
  background: ${({ $active }) => $active ? "rgba(201,168,76,0.07)" : C.card};
  font-family: 'Cinzel', serif;
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  &:hover { border-color: ${C.goldDim}; color: ${C.textMuted}; }
`

const ScenarioDesc = styled.p`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.85rem;
  color: ${C.textMuted};
  text-align: center;
  margin-top: 0.8rem;
  min-height: 1.2em;
`

/* Continents */

const RegionList = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`

const RegionBtn = styled.button`
  background: ${({ $active }) => $active ? "rgba(201,168,76,0.07)" : C.card};
  border: 1px solid ${({ $active }) => $active ? C.gold : C.cardBorder};
  color: ${({ $active }) => $active ? C.gold : C.textDim};
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  &:hover { border-color: ${C.goldDim}; color: ${C.textMuted}; }
`

const RegionCount = styled.span`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.7rem;
  color: ${C.textDim};
  margin-left: 0.35em;
`

/* Playstyle */

const PlaystyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
  gap: 0.5rem;
`

const PlaystyleBtn = styled.button`
  background: ${({ $active }) => $active ? "rgba(201,168,76,0.07)" : C.card};
  border: 1px solid ${({ $active }) => $active ? C.gold : C.cardBorder};
  color: ${({ $active }) => $active ? C.gold : C.textDim};
  font-family: 'Cinzel', serif;
  padding: 0.7rem 0.5rem 0.6rem;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  &:hover { border-color: ${C.goldDim}; color: ${C.textMuted}; }
`

const PlaystyleIcon = styled.span`
  font-size: 1.1rem;
  line-height: 1;
`

const PlaystyleName = styled.span`
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  line-height: 1.2;
`

const PlaystyleCount = styled.span`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.72rem;
  color: ${C.textDim};
`

const PlaystyleHint = styled.p`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.82rem;
  color: ${C.textDim};
  text-align: center;
  margin-top: 0.8rem;
`

/* Pool info */

const PoolInfo = styled.p`
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 0.52rem;
  letter-spacing: 0.28em;
  color: ${({ $warn }) => $warn ? "#8b3a1a" : C.textDim};
  margin-top: 1rem;
  text-transform: uppercase;
`

/* Controls */

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.2rem 1.5rem 1.5rem;
  flex-wrap: wrap;
`

const PlayerCountWrap = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid ${C.cardBorder};
  background: ${C.card};
  overflow: hidden;
`

const CountBtn = styled.button`
  background: none;
  border: none;
  color: ${C.gold};
  font-size: 1.5rem;
  width: 46px;
  cursor: pointer;
  font-family: 'EB Garamond', serif;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: rgba(201,168,76,0.1); }
  &:disabled { color: ${C.textDim}; cursor: not-allowed; }
`

const CountDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.4rem;
  border-left: 1px solid ${C.cardBorder};
  border-right: 1px solid ${C.cardBorder};
  min-width: 90px;
`

const CountNumber = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: ${C.gold};
  line-height: 1;
`

const CountLabel = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 0.5rem;
  letter-spacing: 0.35em;
  color: ${C.textMuted};
  margin-top: 3px;
  text-transform: uppercase;
`

const shimmer = keyframes`
  from { transform: translateX(-120%); }
  to   { transform: translateX(120%); }
`

const RollBtn = styled.button`
  position: relative;
  background: ${C.gold};
  color: #0a0702;
  border: none;
  font-family: 'Cinzel', serif;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  padding: 0 2.8rem;
  height: 60px;
  cursor: pointer;
  text-transform: uppercase;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.1s;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
    transform: translateX(-120%);
    transition: transform 0.5s;
  }
  &:hover:not(:disabled)::before { transform: translateX(120%); }
  &:hover:not(:disabled) { box-shadow: 0 0 30px rgba(201,168,76,0.4); }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

/* Banner */

const ContextBanner = styled.div`
  max-width: 700px;
  margin: 0 auto 1.5rem;
  padding: 0 1.5rem;
  text-align: center;
  animation: ${bannerIn} 0.4s ease-out;
`

const BannerRule = styled.div`
  height: 1px;
  background: linear-gradient(to right, transparent, ${C.goldDim}, transparent);
  margin: 0.5rem 0;
`

const BannerLabel = styled.p`
  font-family: 'Cinzel', serif;
  font-size: 0.5rem;
  letter-spacing: 0.45em;
  color: ${C.goldDim};
  text-transform: uppercase;
  margin: 0;
`

const BannerTitle = styled.p`
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${C.gold};
  letter-spacing: 0.08em;
  margin: 0.3rem 0 0.2rem;
`

const BannerDesc = styled.p`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.88rem;
  color: ${C.textMuted};
  margin: 0;
`

/* Cards grid */

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1.25rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

const PlayerCard = styled.div`
  border: 1px solid ${({ $revealed }) => $revealed ? C.goldDim : C.cardBorder};
  background: ${C.card};
  display: flex;
  flex-direction: column;
  min-height: 320px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.4s, box-shadow 0.4s;
  box-shadow: ${({ $revealed }) => $revealed ? "0 0 25px rgba(201,168,76,0.07)" : "none"};
  animation: ${({ $rolling }) => $rolling ? css`${cardRollAnim} 0.12s infinite` : "none"};
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(201,168,76,0.03) 0%, transparent 50%);
    pointer-events: none;
  }
`

const RevealPulse = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: ${revealGlow} 0.7s ease-out forwards;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid ${C.cardBorder};
`

const CardPlayerLabel = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  letter-spacing: 0.35em;
  color: ${C.textMuted};
  text-transform: uppercase;
`

const RerollBtn = styled.button`
  background: none;
  border: 1px solid transparent;
  color: ${C.goldDim};
  cursor: pointer;
  font-size: 1rem;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
  transition: color 0.15s, border-color 0.15s;
  &:hover { color: ${C.gold}; border-color: ${C.goldDim}; }
`

const CardBody = styled.div`
  flex: 1;
  padding: 1.4rem 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const EmptyState = styled.div`
  text-align: center;
`

const EmptyGlyph = styled.span`
  display: block;
  font-size: 1.6rem;
  color: ${C.textDim};
  margin-bottom: 0.6rem;
  line-height: 1;
`

const EmptyLabel = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 0.3em;
  color: ${C.textDim};
  text-transform: uppercase;
`

const CyclingDisplay = styled.div`
  text-align: center;
`

const CyclingCivText = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${C.goldDim};
  letter-spacing: 0.05em;
  line-height: 1.2;
  min-height: 1.3em;
  animation: ${textFlicker} 0.09s infinite;
`

const CyclingLeaderText = styled.div`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.85rem;
  color: ${C.textDim};
  margin-top: 0.3rem;
  min-height: 1.1em;
  animation: ${textFlicker} 0.09s infinite;
`

/* Civ info */

const CivInfoWrap = styled.div`
  width: 100%;
  text-align: center;
  animation: ${civFadeIn} 0.4s 0.1s ease-out both;
`

const CivName = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${C.goldBright};
  letter-spacing: 0.04em;
  line-height: 1.2;
`

const CivRule = styled.div`
  width: 50px;
  height: 1px;
  background: linear-gradient(to right, transparent, ${C.goldDim}, transparent);
  margin: 0.65rem auto;
`

const LeaderName = styled.div`
  font-family: 'EB Garamond', serif;
  font-style: italic;
  font-size: 0.95rem;
  color: ${C.text};
  line-height: 1.3;
`

const SectionTag = styled.div`
  font-family: 'Cinzel', serif;
  font-size: 0.48rem;
  letter-spacing: 0.38em;
  color: ${C.goldDim};
  text-transform: uppercase;
  margin: 0.9rem 0 0.35rem;
`

const AbilityName = styled.div`
  font-family: 'EB Garamond', serif;
  font-size: 0.88rem;
  color: ${C.text};
  line-height: 1.35;
`

const UniqueList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.2rem 0 0;
`

const UniqueItem = styled.li`
  font-family: 'EB Garamond', serif;
  font-size: 0.83rem;
  color: ${C.textMuted};
  line-height: 1.6;
  &::before { content: '·  '; color: ${C.goldDim}; }
`

const sourceColors = {
  base: { border: "#2e1e0a", color: "#5a3e18" },
  gk:   { border: "#1a2e1a", color: "#3a5a3a" },
  bnw:  { border: "#1a1e38", color: "#3a3a6a" },
  dlc:  { border: "#2e1e2e", color: "#5a3a5a" },
}

const SourceTag = styled.span`
  display: inline-block;
  margin-top: 1.1rem;
  font-family: 'Cinzel', serif;
  font-size: 0.46rem;
  letter-spacing: 0.22em;
  padding: 0.22rem 0.6rem;
  border: 1px solid ${({ $source }) => sourceColors[$source]?.border ?? C.cardBorder};
  color: ${({ $source }) => sourceColors[$source]?.color ?? C.textDim};
  text-transform: uppercase;
`

const PageFooter = styled.footer`
  text-align: center;
  margin-top: 3.5rem;
  font-family: 'Cinzel', serif;
  font-size: 0.5rem;
  letter-spacing: 0.35em;
  color: ${C.textDim};
  text-transform: uppercase;
`

// ── CIV INFO SUB-COMPONENT ────────────────────────────────────────────────────

const CivInfoCard = ({ civ }) => (
  <CivInfoWrap>
    <CivName>{civ.name}</CivName>
    <CivRule />
    <LeaderName>{civ.leader}</LeaderName>
    <SectionTag>Unique Ability</SectionTag>
    <AbilityName>{civ.ability}</AbilityName>
    <SectionTag>Unique Units &amp; Buildings</SectionTag>
    <UniqueList>
      {civ.uniques.map(u => <UniqueItem key={u}>{u}</UniqueItem>)}
    </UniqueList>
    <SourceTag $source={civ.source}>{SOURCE_LABELS[civ.source]}</SourceTag>
  </CivInfoWrap>
)

// ── PAGE ──────────────────────────────────────────────────────────────────────

const CivPage = () => {
  const [mode, setMode] = useState("all")
  const [selectedScenario, setSelectedScenario] = useState(-1)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedPlaystyles, setSelectedPlaystyles] = useState(new Set())
  const [playerCount, setPlayerCount] = useState(4)
  const [assignments, setAssignments] = useState({})
  const [cardPhases, setCardPhases] = useState({})
  const [cyclingTexts, setCyclingTexts] = useState({})
  const [revealKeys, setRevealKeys] = useState({})
  const [banner, setBanner] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const isRollingRef = useRef(false)
  const intervalsRef = useRef({})
  const activePoolRef = useRef([])

  const computePool = useCallback((resolveRandom = false) => {
    if (mode === "all") return { indices: CIVS.map((_, i) => i) }
    if (mode === "rivalries") {
      let idx = selectedScenario
      if (idx < 0) {
        if (!resolveRandom) return null
        idx = Math.floor(Math.random() * RIVALRIES.length)
      }
      return {
        scenario: RIVALRIES[idx],
        indices: RIVALRIES[idx].civs.map(n => NAME_TO_IDX[n]).filter(i => i !== undefined),
      }
    }
    if (mode === "continents") {
      if (!selectedRegion) return null
      return { indices: REGIONS[selectedRegion].map(n => NAME_TO_IDX[n]).filter(i => i !== undefined) }
    }
    if (mode === "playstyle") {
      if (selectedPlaystyles.size === 0) return null
      return { indices: resolvePlaystylePool(selectedPlaystyles) }
    }
    return null
  }, [mode, selectedScenario, selectedRegion, selectedPlaystyles])

  const animateCard = useCallback((playerIdx, civ, delay) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setCardPhases(prev => ({ ...prev, [playerIdx]: "cycling" }))
        let ticks = 0
        const totalTicks = 20
        intervalsRef.current[playerIdx] = setInterval(() => {
          const r = CIVS[Math.floor(Math.random() * CIVS.length)]
          setCyclingTexts(prev => ({ ...prev, [playerIdx]: { civ: r.name, leader: r.leader } }))
          ticks++
          if (ticks >= totalTicks) {
            clearInterval(intervalsRef.current[playerIdx])
            setCardPhases(prev => ({ ...prev, [playerIdx]: "revealed" }))
            setAssignments(prev => ({ ...prev, [playerIdx]: civ }))
            setRevealKeys(prev => ({ ...prev, [playerIdx]: (prev[playerIdx] ?? 0) + 1 }))
            resolve()
          }
        }, 55)
      }, delay)
    })
  }, [])

  const rollAll = useCallback(async () => {
    if (isRollingRef.current) return
    const result = computePool(true)
    if (!result || result.indices.length < playerCount) return

    isRollingRef.current = true
    setIsRolling(true)
    setBanner(null)
    Object.values(intervalsRef.current).forEach(clearInterval)
    intervalsRef.current = {}
    setAssignments({})
    activePoolRef.current = result.indices

    const emptyPhases = {}
    for (let i = 0; i < playerCount; i++) emptyPhases[i] = "empty"
    setCardPhases(emptyPhases)

    const picks = shuffle(result.indices).slice(0, playerCount)
    await Promise.all(picks.map((civIdx, i) => animateCard(i, CIVS[civIdx], i * 280)))

    if (result.scenario) {
      setBanner({ label: "Rivalry Scenario", title: result.scenario.name, desc: result.scenario.desc })
    } else if (mode === "continents" && selectedRegion) {
      setBanner({ label: "Region", title: selectedRegion, desc: `Civs drawn from ${selectedRegion}` })
    } else if (mode === "playstyle" && selectedPlaystyles.size > 0) {
      setBanner({ label: "Playstyle", title: [...selectedPlaystyles].join(" · "), desc: `${result.indices.length} civs in pool` })
    }

    isRollingRef.current = false
    setIsRolling(false)
  }, [computePool, playerCount, mode, selectedRegion, selectedPlaystyles, animateCard])

  const rerollOne = useCallback(async (idx) => {
    if (isRollingRef.current) return
    const pool = activePoolRef.current.length > 0
      ? activePoolRef.current
      : computePool(false)?.indices
    if (!pool) return

    const usedCivs = new Set(
      Object.entries(assignments).filter(([k]) => +k !== idx).map(([, v]) => v)
    )
    const available = pool.filter(i => !usedCivs.has(CIVS[i]))
    if (available.length === 0) return

    isRollingRef.current = true
    setIsRolling(true)
    if (intervalsRef.current[idx]) clearInterval(intervalsRef.current[idx])
    setAssignments(prev => { const n = { ...prev }; delete n[idx]; return n })
    setCardPhases(prev => ({ ...prev, [idx]: "empty" }))

    const newCiv = CIVS[available[Math.floor(Math.random() * available.length)]]
    await animateCard(idx, newCiv, 0)

    isRollingRef.current = false
    setIsRolling(false)
  }, [computePool, assignments, animateCard])

  const handleModeChange = newMode => {
    if (isRollingRef.current) return
    setMode(newMode)
    setAssignments({})
    setCardPhases({})
    setBanner(null)
    activePoolRef.current = []
  }

  const adjustPlayers = delta => {
    if (isRollingRef.current) return
    const next = playerCount + delta
    if (next < 1 || next > 8) return
    setPlayerCount(next)
    setAssignments({})
    setCardPhases({})
    setBanner(null)
  }

  const togglePlaystyle = style => {
    setSelectedPlaystyles(prev => {
      const next = new Set(prev)
      if (next.has(style)) next.delete(style)
      else next.add(style)
      return next
    })
  }

  const poolResult = computePool(false)
  const poolCount = poolResult?.indices?.length ?? 0
  const isRollDisabled =
    isRolling ||
    (mode === "continents" && !selectedRegion) ||
    (mode === "playstyle" && selectedPlaystyles.size === 0) ||
    (poolResult != null && poolResult.indices.length < playerCount)

  const poolWarn =
    (mode === "continents" && !selectedRegion) ||
    (mode === "playstyle" && selectedPlaystyles.size === 0) ||
    (poolResult != null && poolResult.indices.length < playerCount)

  const poolText = (() => {
    if (mode === "all") return `Rolling from ${CIVS.length} civs · No duplicates`
    if (mode === "rivalries" && selectedScenario < 0) return `${RIVALRIES.length} scenarios available · No duplicates`
    if (mode === "continents" && !selectedRegion) return "Select a region above"
    if (mode === "playstyle" && selectedPlaystyles.size === 0) return "Select a playstyle above"
    return `Rolling from ${poolCount} civs · Max ${poolCount} players`
  })()

  return (
    <Layout>
      <CivGlobal />
      <PageWrap>

        <Header>
          <HeaderEyebrow>Firaxis Games · All DLC &amp; Expansions</HeaderEyebrow>
          <GameTitle>CIVILIZATION V</GameTitle>
          <TitleOrnament>— ✦ —</TitleOrnament>
          <Subtitle>Civilization Randomizer</Subtitle>
          <HeaderRule />
        </Header>

        <ModeSection>
          <ModeTabs>
            {[
              { id: "all",        label: "All Civs"     },
              { id: "rivalries",  label: "⚔ Rivalries"  },
              { id: "continents", label: "◈ Continents" },
              { id: "playstyle",  label: "♟ Playstyle"  },
            ].map(({ id, label }) => (
              <ModeTab key={id} $active={mode === id} onClick={() => handleModeChange(id)}>
                {label}
              </ModeTab>
            ))}
          </ModeTabs>

          {mode === "rivalries" && (
            <ModePanel>
              <PanelLabel>Choose a Scenario</PanelLabel>
              <ScenarioList>
                <ScenarioPill $active={selectedScenario === -1} onClick={() => setSelectedScenario(-1)}>
                  Random Scenario
                </ScenarioPill>
                {RIVALRIES.map((r, i) => (
                  <ScenarioPill key={i} $active={selectedScenario === i} onClick={() => setSelectedScenario(i)}>
                    {r.name}
                  </ScenarioPill>
                ))}
              </ScenarioList>
              <ScenarioDesc>
                {selectedScenario >= 0
                  ? RIVALRIES[selectedScenario].desc
                  : "A random historical rivalry will be chosen when you roll."}
              </ScenarioDesc>
            </ModePanel>
          )}

          {mode === "continents" && (
            <ModePanel>
              <RegionList>
                {Object.entries(REGIONS).map(([name, civs]) => (
                  <RegionBtn
                    key={name}
                    $active={selectedRegion === name}
                    onClick={() => setSelectedRegion(prev => prev === name ? null : name)}
                  >
                    {name} <RegionCount>{civs.length}</RegionCount>
                  </RegionBtn>
                ))}
              </RegionList>
            </ModePanel>
          )}

          {mode === "playstyle" && (
            <ModePanel>
              <PanelLabel>Select One or More Playstyles</PanelLabel>
              <PlaystyleGrid>
                {Object.entries(PLAYSTYLES).map(([name, data]) => (
                  <PlaystyleBtn key={name} $active={selectedPlaystyles.has(name)} onClick={() => togglePlaystyle(name)}>
                    <PlaystyleIcon>{data.icon}</PlaystyleIcon>
                    <PlaystyleName>{name}</PlaystyleName>
                    <PlaystyleCount>{data.civs.length} civs</PlaystyleCount>
                  </PlaystyleBtn>
                ))}
              </PlaystyleGrid>
              <PlaystyleHint>
                {selectedPlaystyles.size === 0
                  ? "Select at least one playstyle to enable rolling"
                  : `${[...selectedPlaystyles].join(" · ")} — ${poolCount} civs available`}
              </PlaystyleHint>
            </ModePanel>
          )}

          <PoolInfo $warn={poolWarn}>{poolText}</PoolInfo>
        </ModeSection>

        <Controls>
          <PlayerCountWrap>
            <CountBtn onClick={() => adjustPlayers(-1)} disabled={playerCount <= 1 || isRolling}>−</CountBtn>
            <CountDisplay>
              <CountNumber>{playerCount}</CountNumber>
              <CountLabel>Players</CountLabel>
            </CountDisplay>
            <CountBtn onClick={() => adjustPlayers(1)} disabled={playerCount >= 8 || isRolling}>+</CountBtn>
          </PlayerCountWrap>
          <RollBtn onClick={rollAll} disabled={!!isRollDisabled}>Roll Civilizations</RollBtn>
        </Controls>

        {banner && (
          <ContextBanner>
            <BannerRule />
            <BannerLabel>{banner.label}</BannerLabel>
            <BannerTitle>{banner.title}</BannerTitle>
            <BannerDesc>{banner.desc}</BannerDesc>
            <BannerRule />
          </ContextBanner>
        )}

        <CardsGrid>
          {Array.from({ length: playerCount }).map((_, i) => {
            const phase = cardPhases[i] ?? "empty"
            const civ = assignments[i]
            const cycling = cyclingTexts[i]
            return (
              <PlayerCard key={i} $revealed={phase === "revealed"} $rolling={phase === "cycling"}>
                {phase === "revealed" && <RevealPulse key={revealKeys[i]} />}
                <CardHeader>
                  <CardPlayerLabel>Player {i + 1}</CardPlayerLabel>
                  {phase === "revealed" && (
                    <RerollBtn onClick={() => rerollOne(i)} title="Re-roll">↺</RerollBtn>
                  )}
                </CardHeader>
                <CardBody>
                  {phase === "empty" && (
                    <EmptyState>
                      <EmptyGlyph>◆</EmptyGlyph>
                      <EmptyLabel>Unassigned</EmptyLabel>
                    </EmptyState>
                  )}
                  {phase === "cycling" && (
                    <CyclingDisplay>
                      <CyclingCivText>{cycling?.civ ?? ""}</CyclingCivText>
                      <CyclingLeaderText>{cycling?.leader ?? ""}</CyclingLeaderText>
                    </CyclingDisplay>
                  )}
                  {phase === "revealed" && civ && <CivInfoCard civ={civ} />}
                </CardBody>
              </PlayerCard>
            )
          })}
        </CardsGrid>

        <PageFooter>{CIVS.length} civilizations · All packs included · No duplicates</PageFooter>

      </PageWrap>
    </Layout>
  )
}

export const Head = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Civ V Randomizer · Emily Pillay</title>
  </>
)

export default CivPage
