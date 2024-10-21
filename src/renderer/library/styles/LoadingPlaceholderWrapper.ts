// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

/**
 * @name LoadingPlaceholderWrapper
 * @summary Wrapper styles for the placeholder loader.
 */
export const LoadingPlaceholderWrapper = styled.div<{
  $height: string;
  $borderRadius: string;
}>`
  width: 100%;

  // Renderer container.
  .placeholder-content-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;

    .placeholder-content {
      height: ${(props) => (props.$height ? props.$height : '3rem')};
      background: #000;
      border-radius: ${(props) =>
        props.$borderRadius ? props.$borderRadius : '1.25rem'};

      // Animation
      animation-duration: 5s;
      animation-fill-mode: forwards;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-name: placeholderAnimate;
      background: #101010; // Fallback
      background: linear-gradient(
        to right,
        #101010 20%,
        #202020 36%,
        #101010 51%
      );
      background-size: 200%; // Animation Area
    }
  }

  // Keyframes.
  @keyframes placeholderAnimate {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;
