import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
   width: 60px;
   height: 60px;
  }

  .loader::before {
   content: "";
   box-sizing: border-box;
   position: absolute;
   width: 60px;
   height: 60px;
   border-radius: 50%;
   border-top: 2px solid #8900FF;
   border-right: 2px solid transparent;
   animation: spinner8217 0.8s linear infinite;
  }

  @keyframes spinner8217 {
   to {
    transform: rotate(360deg);
   }
  }`;

export default Loader;
