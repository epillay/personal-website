import PropTypes from "prop-types"
import React from "react"
import styled from "styled-components"
import "../../styles/fonts.js"
import { Link } from "gatsby"
import { monochromeBlue } from "../../styles/v1/colors"

const ProjectPreviewContainer = styled.div``

const ProjectTitle = styled(Link)`
  display: block;
  font-size: 16px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
  text-decoration: none;
  color: inherit;
  width: fit-content;
  text-align: center;
  font-style: italic;

  &:after {
    bottom: 0;
    content: "";
    display: block;
    height: 2px;
    left: 50%;
    background: black;
    transition: width 0.3s ease 0s, left 0.3s ease 0s;
    width: 0;
  }
  &:hover:after {
    width: 100%;
    left: 0;
  }
`

const Info = styled.span``
const Description = styled.span`
  display: block;
  font-style: italic;
  margin-bottom: 40px;
`

const FigCap = styled.span`
  opacity: 0;
  transition: 0.2s ease-in-out;
  color: white;
  font-weight: 500;
  font-size: 28px;
  left: 0;
  bottom: 30px;
  position: absolute;
  z-index: 2;
  padding-left: 15px;
  padding-right: 15px;
`
const Image = styled.img`
  width: 200px;
  opacity: 1;
  transition: 0.2s ease-in-out;

  @media (min-width: 1000px) {
    width: 250px;
  }
`

const Figure = styled.figure`
  width: 250px;
  transition: 0.3s ease-in-out;
  opacity: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 1000px) {
    flex-direction: initial;
    &:hover {
      background: ${monochromeBlue.primary};
    }
    &:hover ${Image} {
      opacity: 0.5;
    }

    &:hover ${FigCap} {
      opacity: 1;
    }
  }
`

const Title = styled.div`
  display: inline-block;
  margin-bottom: 20px;
  width: 166px;
  font-size: 28px;
  background-color: ${monochromeBlue.light2};
  color: ${monochromeBlue.dark1};
  font-weight: 600;
  padding: 17px;

  @media (min-width: 1000px) {
    display: none;
  }
`

const LinkToProject = styled(Link)`
  display: flex;
  flex-direction: row;
  text-decoration: none;
`

const ProjectPreview = ({ frontmatter, fields }) => {
  const hover = false
  return (
    <ProjectPreviewContainer>
      <Info>
        <LinkToProject to={fields.slug}>
          <Figure>
            <Image src={frontmatter.image.publicURL}></Image>
            <FigCap>{frontmatter.title}</FigCap>
            <Title>{frontmatter.title}</Title>
          </Figure>
        </LinkToProject>
      </Info>
    </ProjectPreviewContainer>
  )
}

export default ProjectPreview
