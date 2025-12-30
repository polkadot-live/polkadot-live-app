// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SortControlsButtonProps } from './types';

/**
 * @name SortControlButton
 * @summary Component that renders a sorting control button.
 */
export const SortControlButton: React.FC<SortControlsButtonProps> = ({
  isActive,
  isDisabled,
  onClick,
  faIcon,
  onLabel = '',
  offLabel = '',
  fixedWidth = true,
  respClass = '',
}: SortControlsButtonProps) => {
  /// Utility to calculate button classes.
  const getButtonClass = () => {
    const classes = ['icon-wrapper'];
    fixedWidth && classes.push('fixed');
    isActive && classes.push('active');
    isDisabled && classes.push('disable');
    respClass && classes.push(respClass);
    onLabel === '' && offLabel === ''
      ? classes.push('icon-only')
      : classes.push('icon-and-text');
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
            style={
              iconOnly
                ? { fontSize: '1.06rem', marginRight: '1rem' }
                : { fontSize: '1.06rem' }
            }
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
