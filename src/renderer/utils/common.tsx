// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { styled } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { chainCurrency, chainUnits } from '@/config/chains';
import type { AnyFunction } from '@w3ux/utils/types';
import type { ChainID } from '@/types/chains';
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
  onLabel?: string;
  offLabel?: string;
  fixedWidth?: boolean;
  onClick?: AnyFunction;
  faIcon?: IconDefinition;
}

export const SortControlButton: React.FC<SortControlsButtonProps> = ({
  isActive,
  isDisabled,
  onClick,
  faIcon,
  onLabel = '',
  offLabel = '',
  fixedWidth = true,
}: SortControlsButtonProps) => {
  /// Utility to calculate button classes.
  const getButtonClass = () => {
    const classes = ['icon-wrapper'];
    fixedWidth && classes.push('fixed');
    isActive && classes.push('active');
    isDisabled && classes.push('disable');
    onLabel === '' && offLabel === '' && classes.push('icon-only');
    return classes.join(' ');
  };

  /// Click handler that executes if the button is not disabled.
  const handleClick = () => {
    if (onClick && !isDisabled) {
      onClick();
    }
  };

  const iconOnly = !onLabel && !offLabel;

  return (
    <div className={getButtonClass()} onClick={() => handleClick()}>
      {faIcon && (
        <div className="icon">
          <FontAwesomeIcon
            icon={faIcon}
            style={iconOnly ? { marginRight: '1rem' } : {}}
          />
        </div>
      )}
      {!iconOnly && (
        <span style={{ width: '100%', textAlign: faIcon ? 'left' : 'center' }}>
          {isActive ? onLabel : offLabel}
        </span>
      )}
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
    max-height: 23.52px;
    align-self: center;
    font-size: 0.9rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
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
    min-width: auto;

    position: relative;
    border: 1px solid #535353;
    border-radius: 1.25rem;

    margin: 0;
    padding: 0.3rem 0.5rem;
    transition: border 0.1s ease-out;
    user-select: none;
    transition: opacity 0.1s ease-out;
    cursor: pointer;

    &.fixed {
      min-width: 120px !important;
    }
    &.icon-only {
      .icon {
        margin-left: 1rem !important;
      }
    }
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
      opacity: 0.4;
    }
  }

  /* Select */
  .select-wrapper {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;

    border: 1px solid var(--border-secondary-color);
    border-radius: 1.25rem;
    padding: 0.35rem 1.5rem;
    cursor: pointer;

    select {
      font-size: 1rem;
      background-color: inherit;
      color: #929292;
      opacity: 0.8;
      border: none;
      cursor: pointer;
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

/**
 * @name StatsFooter
 * @summary Footer layout for child window.
 */
export const StatsFooter = styled.section<{ $chainId: ChainID }>`
  position: fixed;
  bottom: 0;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border-top: 1px solid var(--border-primary-color);
  background-color: var(--background-primary);

  > div:first-of-type {
    display: flex;
    column-gap: 1rem;
    align-items: center;
  }

  // Left and right.
  .right,
  .left {
    display: flex;
    align-items: center;
    column-gap: 1rem;
  }
  .left {
    flex: 1;
  }

  .stat-wrapper {
    display: flex;
    column-gap: 1rem;
    display: flex;
    align-items: center;

    // Help icon.
    .icon-wrapper {
      font-size: 0.8rem;
      padding-right: 0.75rem;
      padding-left: 0.4rem;
      cursor: pointer;
      opacity: 0.4;
      &:hover {
        color: #953254;
        opacity: 1;
      }
    }

    // Stat label.
    span {
      display: flex;
      align-items: baseline;
      padding: 0.5rem;
      padding-right: 1rem;
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.5rem;
      font-size: 0.8rem;
    }

    &.badge-btn {
      cursor: pointer;
      &:hover {
        .icon-wrapper {
          color: #953254;
          opacity: 1;
        }
      }
    }
  }

  .footer-stat {
    display: flex;
    column-gap: 0.75rem;
    align-items: center;

    h2 {
      font-size: 0.95rem;
      opacity: 0.5;
    }
    span {
      color: ${(props) =>
        props.$chainId === 'Polkadot' ? 'rgb(169, 74, 117)' : '#8571b1'};
      font-weight: 400;
      font-size: 0.95rem;
    }
  }
`;

/**
 * @name formatChainUnits
 * @summary Get readable chain units for rendering.
 */
export const formatChainUnits = (units: string, chainId: ChainID) => {
  // Include regex to remove trailing zeros after decimal point.
  const formatted: string = planckToUnit(
    new BigNumber(rmCommas(units)),
    chainUnits(chainId)
  )
    .toFixed(2)
    .replace(/(\.\d*?[1-9])0+|\.0*$/, '$1');

  return `${formatted} ${chainCurrency(chainId)}`;
};
