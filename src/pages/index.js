import React, { useState } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Nav from "../components/nav"
import Image from "../components/image"
import SEO from "../components/seo"
import Landing from "../components/landing"
import Experience from "../components/experience"
import ProjectPreview from "../components/projectPreview"
import Footer from "../components/footer"

import styled from "styled-components"
import Container from "../components/container"
import { melon, floatie, bluebell, oak, bananaMilk } from "../styles/colors"
import { monochromeMelon, monochromeBlue } from "../styles/colors"



const ExperienceTitle = styled(Container)`
  padding-bottom: 50px;
  padding-top: 70px;
  font-weight: 500;
  font-family: Bungee Shade;
  font-size: 42px;
  color: ${monochromeBlue.dark1};

  @media (min-width: 1000px) {
    font-size: 48px;
  }
`

const ProjectsTitle = styled(ExperienceTitle)`
`

const ProjectsSection = styled(Container)`
    padding-bottom: 20vh;
    display: grid;
    grid-gap: 30px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

`

const Background1 = styled.div`
    background-color: white;
    display: block;
`

const Background2 = styled.div`
    background-color: ${monochromeBlue.light3};
    display: block;
`

const IndexPage = ({ data }) => {
  const [colorScheme, setColorScheme] = useState(monochromeMelon);
  const projects = data.projects.edges
  .filter(e => e.node.frontmatter.isVisible)
  .map(e => <ProjectPreview {...e.node}></ProjectPreview>)
  return (
    <Layout>
    <SEO title="Home" />
    <Landing {...data.landing.edges[0].node}></Landing>
    <Background1>
      <ExperienceTitle>Experience</ExperienceTitle>
      <Experience {...data.experience.edges[0].node}></Experience>
    </Background1>
    <Background2>
      <ProjectsTitle>Projects</ProjectsTitle>
      <ProjectsSection>{projects}</ProjectsSection>
    </Background2>
    <Footer {...data.footer.edges[0].node}></Footer>
    {/* <Link to="/page-2/">Go to page 2</Link> <br />
    <Link to="/using-typescript/">Go to "Using TypeScript"</Link> */}
    </Layout>
  )
}

export default IndexPage

export const pageQuery = graphql`
  query IndexPageQuery {
    landing: allLandingJson {
      edges {
        node {
          title
          subtitle
          about
        }
      }
    }
    experience: allExperienceJson {
      edges {
        node {
          professionalExperiences {
            company
            companyLink
            roles {
              title
              date
              description
            }
          }
        }
      }
    }
    footer: allFooterJson {
      edges {
        node {
          title
          socials {
            email
            linkedIn
            github
          }
        }
      }
    }
    projects: allMarkdownRemark(
      filter: {fileAbsolutePath: {regex: "/projects/"}}) {
      edges {
        node { 
          html
          fields {
            slug
          }
          frontmatter {
            date
            description
            isVisible
            mainImage
            title
            type
            image {
              publicURL
            }
          }
        }
      }
    }
  }`
