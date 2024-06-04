// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AnyFunction } from '@w3ux/utils/types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * @name createArrayWithLength
 * @summary Utility for creating an array of `n` length.
 */
export const createArrayWithLength = (n: number): number[] =>
  [...Array(n + 1)].map((_, i) => i);

/**
 * @name renderPlaceholders
 * @summary Render placeholder loaders.
 */
export const renderPlaceholders = (
  length: number,
  height = '3rem',
  borderRadius = '1.25rem'
) => (
  <LoadingPlaceholderWrapper $height={height} $borderRadius={borderRadius}>
    <div className="placeholder-content-wrapper">
      {createArrayWithLength(length).map((_, i) => (
        <div key={i} className="placeholder-content"></div>
      ))}
    </div>
  </LoadingPlaceholderWrapper>
);

/**
 * @name LoadingPlaceholderWrapper
 * @summary Wrapper styles for the placeholder loader.
 */
const LoadingPlaceholderWrapper = styled.div<{
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

/**
 * @name SortControlButton
 * @summary Component that renders a sorting control button.
 */
interface SortControlsButtonProps {
  isActive: boolean;
  isDisabled: boolean;
  onLabel: string;
  offLabel: string;
  onClick?: AnyFunction;
  faIcon?: IconDefinition;
}

export const SortControlButton: React.FC<SortControlsButtonProps> = ({
  isActive,
  isDisabled,
  onClick,
  faIcon,
  onLabel,
  offLabel,
}: SortControlsButtonProps) => {
  /// Utility to calculate button classes.
  const getButtonClass = () => {
    const classes = ['icon-wrapper'];
    isActive && classes.push('active');
    isDisabled && classes.push('disable');
    return classes.join(' ');
  };

  /// Click handler that executes if the button is not disabled.
  const handleClick = () => {
    if (onClick && !isDisabled) {
      onClick();
    }
  };

  return (
    <div className={getButtonClass()} onClick={() => handleClick()}>
      {faIcon && (
        <div className="icon">
          <FontAwesomeIcon icon={faIcon} />
        </div>
      )}
      <span style={{ width: '100%', textAlign: faIcon ? 'left' : 'center' }}>
        {isActive ? onLabel : offLabel}
      </span>
    </div>
  );
};

interface SortControlLabelProps {
  label: string;
  faIcon?: IconDefinition;
}

export const SortControlLabel: React.FC<SortControlLabelProps> = ({
  faIcon,
  label,
}: SortControlLabelProps) => (
  <div className="breadcrumb-wrapper">
    {faIcon && (
      <div>
        <FontAwesomeIcon icon={faIcon} />
      </div>
    )}
    <span>{label}</span>
  </div>
);

/**
 * @name ControlsWrapper
 * @summary Wrapper styles for sorting control components.
 */

export const ControlsWrapper = styled.div<{
  $padWrapper?: boolean;
  $padBottom?: boolean;
}>`
  width: 100%;
  padding: ${(props) => (props.$padWrapper ? '2rem 1.5rem 0' : '0')};
  padding-bottom: ${(props) => (props.$padBottom ? '1rem' : '0')};

  display: flex;
  column-gap: 1rem;
  margin-bottom: 0.75rem;

  .back-btn {
    align-self: center;
    font-size: 0.9rem;
    border-color: #a94a75;
    color: #a94a75;
  }

  .breadcrumb-wrapper {
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem;
    border: 1px solid #454545;
    border-radius: 1.25rem;

    span {
      display: inline-block;
      text-align: center;
      display: inline-block;
      color: #666666;
      font-size: 0.9rem;
    }
    .icon {
      margin-left: 0.7rem;
      color: #ededed;
    }
  }

  .icon-wrapper {
    opacity: 0.75;
    display: flex;
    column-gap: 0.75rem;
    align-items: center;
    min-width: 120px;

    position: relative;
    border: 1px solid #535353;
    border-radius: 1.25rem;

    margin: 0;
    padding: 0.3rem 0.5rem;
    transition: border 0.1s ease-out;
    user-select: none;
    transition: opacity 0.1s ease-out;
    cursor: pointer;

    span {
      display: inline-block;
      padding-right: 0.7rem;
      color: #666666;
      font-size: 0.9rem;
    }
    .icon {
      color: #5f5f5f;
      margin-left: 0.7rem;
    }
    &:hover {
      opacity: 0.9;
    }
    // Button is active.
    &.active {
      border-color: #454545;
      background-color: #3a3a3a;
      transition: opacity 0.1s ease-out;
      .icon,
      span {
        color: #ededed;
      }
      &:hover {
        background-color: #3a3a3a;
      }
    }
    &.disable {
      opacity: 0.25;
    }
  }
`;

/**
 * @name Scrollable
 * @summary A scrollable container with which takes into account header and footer heights.
 */

export const Scrollable = styled.div<{
  $footerHeight?: number;
  $headerHeight?: number;
}>`
  --footer-height: ${(props) => {
    const height = props.$footerHeight;
    return height ? `${height}px` : '42.06px';
  }};

  --header-height: ${(props) => {
    const height = props.$headerHeight;
    return height ? `${height}px` : '38.6px';
  }};

  // height = window height - (header height + footer height)
  height: calc(100vh - var(--footer-height) - var(--header-height));
  width: 100%;
  padding: 1.5rem 0 1rem;
  overflow-y: auto;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #212121;
  }

  // Placeholder loader.
  @keyframes placeholderAnimate {
    0% {
      background-position: -650px 0;
    }
    100% {
      background-position: 650px 0;
    }
  }

  .placeholder-content-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    margin-top: 2rem;

    .placeholder-content {
      height: 3rem;
      background: #000;
      border-radius: 1.25rem;

      // Animation
      animation-duration: 3s;
      animation-fill-mode: forwards;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-name: placeholderAnimate;
      background: #101010; // Fallback
      background: linear-gradient(
        to right,
        #101010 2%,
        #202020 18%,
        #101010 33%
      );
      background-size: 1200px; // Animation Area
    }
  }
`;
