// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { onMouseHandlers } from '../Utils';
import { appendOr, appendOrEmpty } from '@w3ux/utils';
import type { ButtonCommonProps, ButtonIconProps } from '../types';
import type { ComponentBaseWithClassName } from '../../../types';

export type ButtonPrimaryInvertProps = ComponentBaseWithClassName &
  ButtonIconProps &
  ButtonCommonProps & {
    // use secondary network color.
    colorSecondary?: boolean;
    // large button, small otherwise.
    lg?: boolean;
    // button text.
    text: string;
  };

/**
 * @name ButtonPrimaryInvert
 * @description Invert primary button style.
 */
export const ButtonPrimaryInvert = ({
  colorSecondary,
  disabled,
  grow,
  iconLeft,
  iconRight,
  iconTransform,
  lg,
  marginLeft,
  marginRight,
  marginX,
  className,
  style,
  text,
  onClick,
  onMouseOver,
  onMouseMove,
  onMouseOut,
}: ButtonPrimaryInvertProps) => (
  <button
    className={`btn-primary-invert${appendOrEmpty(
      colorSecondary,
      'secondary-color'
    )}${appendOrEmpty(grow, 'grow')}${appendOr(lg, 'lg', 'sm')}${appendOrEmpty(
      marginRight,
      'm-right'
    )}${appendOrEmpty(marginLeft, 'm-left')}${appendOrEmpty(marginX, 'm-x')}${
      className ? ` ${className}` : ''
    }`}
    style={style}
    type="button"
    disabled={disabled}
    {...onMouseHandlers({ onClick, onMouseOver, onMouseMove, onMouseOut })}
  >
    {iconLeft ? (
      <FontAwesomeIcon
        icon={iconLeft}
        className={text ? 'icon-left' : undefined}
        transform={iconTransform ? iconTransform : undefined}
      />
    ) : null}
    {text ? text : null}
    {iconRight ? (
      <FontAwesomeIcon
        icon={iconRight}
        className={text ? 'icon-right' : undefined}
        transform={iconTransform ? iconTransform : undefined}
      />
    ) : null}
  </button>
);
