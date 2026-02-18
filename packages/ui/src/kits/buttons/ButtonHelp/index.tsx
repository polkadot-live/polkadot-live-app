// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { appendOrEmpty } from '@w3ux/utils';
import { ReactSVG } from 'react-svg';
import { onMouseHandlers } from '../Utils';
import type { ComponentBaseWithClassName } from '../../../types';
import type { ButtonCommonProps } from '../types';

type ButtonHelpProps = ComponentBaseWithClassName &
  ButtonCommonProps & {
    // background style.
    background?: 'primary' | 'secondary' | 'none';
    // optional border
    outline?: boolean;
  };

/**
 * @name ButtonHelp
 * @description Help button used throughout dashboard apps.
 */
export const ButtonHelp = ({
  disabled,
  marginLeft,
  marginRight,
  marginX,
  className,
  style,
  onClick,
  onMouseOver,
  onMouseMove,
  onMouseOut,
  outline = false,
  background = 'primary',
}: ButtonHelpProps) => (
  <button
    className={`btn-help${appendOrEmpty(
      background === 'secondary',
      'background-secondary',
    )}${appendOrEmpty(background === 'none', 'background-none')}${appendOrEmpty(
      outline,
      'outline',
    )}${appendOrEmpty(marginRight, 'm-right')}${appendOrEmpty(
      marginLeft,
      'm-left',
    )}${appendOrEmpty(marginX, 'm-x')}${className ? ` ${className}` : ''}`}
    style={style}
    type="button"
    disabled={disabled}
    {...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
  >
    <ReactSVG src="../svg/help.svg" />
  </button>
);
