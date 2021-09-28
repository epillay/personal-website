import styled from "styled-components"

const SlideContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  margin: 0;
  padding: 0 2em 0 2em;

  @media (min-width: 800px) {
    padding: 0 5em 0 5em;
  }
`

export default SlideContainer
