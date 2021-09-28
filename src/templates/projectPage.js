import React from "react"
import styled from "styled-components"
import "../styles/fonts.js"
import Container from "../components/v1/container"
import Layout from "../components/v1/layout"
import SEO from "../components/v1/seo"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { monochromeBlue } from "../styles/v1/colors"

const Background = styled.div`
  background-color: ${monochromeBlue.light3};
  display: block;
`

const ProjectContainer = styled(Container)`
  padding-top: 15vh;
  height: 85vh;
`

const Title = styled.span`
  font-style: italic;
  font-size: 32px;
  display: block;
  color: ${monochromeBlue.primary};
`

const Description = styled.p`
  color: ${monochromeBlue.dark2};
`

const Items = styled.div`
  color: ${monochromeBlue.dark2};
`
const Arrow = styled(FontAwesomeIcon)`
  padding-top: 5vh;
  padding-left: 5vw;
  display: block;
  color: ${monochromeBlue.dark2};
`

const ProjectPage = ({ data }) => {
  const project = data.markdownRemark
  return (
    <Layout>
      <SEO title={project.frontmatter.title} />
      <Background>
        <Link to="/">
          <Arrow icon={faArrowLeft} size="2x"></Arrow>
        </Link>
        <ProjectContainer>
          <Title>{project.frontmatter.title}</Title>
          <Description>{project.frontmatter.description}</Description>
          <Items
            dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }}
          ></Items>
        </ProjectContainer>
      </Background>
    </Layout>
  )
}

export default ProjectPage

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        description
      }
    }
  }
`
