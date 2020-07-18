import PropTypes from "prop-types"
import React from "react"
import styled from "styled-components"
import Container from "./container"
import "../styles/fonts.js"
import { useStaticQuery, graphql } from "gatsby"
import { monochromeBlue } from "../styles/colors"

const Background = styled.div`
    display: block;
`

const ExperienceContainer = styled(Container)`
    min-height: 80vh;
    height: fit-content;
`

const Item = styled.div`
    margin-bottom: 20px;
`
const Title = styled.span`
    font-size: 18px;
    font-weight: 500;
`
const Company = styled.a`
    font-size: 22px;
    font-style: italic;
    font-weight: 500;
    margin-bottom: 25px;
    display: block;
    color: ${monochromeBlue.dark0};
    width: fit-content;
`

const Date = styled.span`
    display: none;

    @media (min-width: 800px) {
        display: inline-block;
    }
`
const Description = styled.span`
`
const LineOne = styled.span`
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    color: ${monochromeBlue.dark2};
`

const Role = styled.span`
    display: block;
    padding-left: 20px;
    border-left: 5px solid ${monochromeBlue.light2};
    padding-bottom: 50px;
    margin-left: 5px;
    &:last-child {
        margin-bottom: 0;
    }
`

const ResumeLink = styled.a`
    font-size: 20px;
    padding: 11px;
    margin-top: 50px;
    margin-bottom: 50px;
    border: solid 2px ${monochromeBlue.light3};
    background-color: ${monochromeBlue.light3};
    color: ${monochromeBlue.dark1};
    border-radius: 10px;
    text-decoration: none;
    display: block;
    width: fit-content;
    font-weight: 500;
    transition: .2s ease-in-out;

    &:hover {
        border: solid 2px ${monochromeBlue.light2};
        background-color: ${monochromeBlue.light2};
        color: ${monochromeBlue.dark2};
    }
`

const Experience = ({ professionalExperiences })=> {
    const data = useStaticQuery(graphql`
    {
      allFile(filter: { extension: { eq: "pdf" } }) {
        edges {
          node {
            publicURL
            name
          }
        }
      }
    }
  `)
    return (
        <Background>
            <ExperienceContainer>
                {professionalExperiences.map(e =>
                    <Item>
                        <Company href={e.companyLink} target="_blank" rel="noopener noreferrer">{e.company}</Company>
                        {e.roles.map(r =>
                            <Role>
                                <LineOne>
                                    <Title>{r.title}</Title>
                                    <Date>{r.date}</Date>
                                </LineOne>
                                <Description>{r.description}</Description>
                            </Role>
                            )}
                    </Item>
                    )
                }
                <ResumeLink href={data.allFile.edges[0].node.publicURL} target="_blank" rel="noopener noreferrer">view my resume</ResumeLink>
            </ExperienceContainer>
        </Background>
    )
}


export default Experience