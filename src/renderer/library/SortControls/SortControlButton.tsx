// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AnyFunction } from '@/types/misc';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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
