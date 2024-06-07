// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBaseWithClassName } from '@app/types';
import { useState, useEffect } from 'react';
import { Wrapper } from './Wrapper';

export type SwitchPrimaryProps = ComponentBaseWithClassName & {
  type?: 'primary' | 'secondary' | 'mono' | 'monoInvert';
  size?: 'sm' | 'lg' | 'xl';
  onColor?: string;
  isOn?: boolean;
  disabled?: boolean;
  handleToggle?: () => void;
};

export const Switch = ({
  type = 'primary',
  size,
  isOn = true,
  disabled,
  handleToggle,
  onColor,
  className,
}: SwitchPrimaryProps) => {
  // const [switchOn, setSwitchOn] = useState<boolean>(isOn);
  const [bgColor, setBgColor] = useState<string>('');
  const [buttonColor, setButtonColor] = useState<string>('');
  const [borderColor, setBorderColor] = useState<string>('');

  useEffect(() => {
    switch (type) {
      case 'secondary': {
        if (disabled) {
          setBgColor('grey');
          setBorderColor('#393939');
          setButtonColor('#393939');
          break;
        }
        setBorderColor('var(--border-secondary-color)');
        if (!isOn) {
          setButtonColor('var(--accent-color-secondary)');
          setBgColor('var(--background-color-primary)');
        } else {
          setButtonColor('var(--text-color-primary)');
          setBgColor('var(--accent-color-secondary)');
        }
        break;
      }
      case 'monoInvert': {
        setBorderColor('#CCCCCC');
        if (disabled) {
          setBgColor('grey');
          setButtonColor('#CCCCCC');
          break;
        }
        if (!isOn) {
          setButtonColor('#000000');
          setBgColor('var(--text-color-invert)');
        } else {
          setButtonColor('#000000');
          setBgColor('var(--text-color-tertiary)');
        }
        break;
      }
      case 'mono': {
        if (disabled) {
          setBgColor('#CCCCCC');
          setBorderColor('#CCCCCC');
          setButtonColor('grey');
          break;
        }
        setBorderColor('var(--border-primary-color)');
        if (!isOn) {
          setButtonColor('#FFFFFF');
          setBgColor('var(--text-color-tertiary)');
        } else {
          setButtonColor('#FFFFFF');
          setBgColor('var(--text-color-primary)');
        }
        break;
      }
      case 'primary':
      default: {
        if (disabled) {
          setBgColor('var(--text-color-invert)');
          setBorderColor('#2e2e2e');
          setButtonColor('#2e2e2e');
          break;
        }
        setBorderColor('var(--border-primary-color)');
        if (!isOn) {
          setButtonColor('var(--accent-color-primary)');
          setBgColor('inherit');
          setBorderColor('var(--border-secondary-color)');
        } else {
          setButtonColor('#FFFFFF');
          setBgColor('var(--accent-color-primary)');
        }
      }
    }
  }, [disabled, type, isOn, onColor]);

  return (
    <Wrapper>
      <label
        style={{ background: bgColor, border: `1px solid ${borderColor}` }}
        className={`base-inputs-switch-label ${size || ''} ${className || ''}${disabled ? `is-disabled` : `is-enabled`}`}
      >
        <input
          disabled={disabled}
          onChange={() => {
            if (!disabled) {
              //setSwitchOn(!switchOn);
              if (handleToggle) {
                handleToggle();
              }
            }
          }}
          checked={isOn}
          className="base-inputs-switch-checkbox"
          type="checkbox"
        />
        <span
          style={{ backgroundColor: buttonColor }}
          className={`base-inputs-switch-button ${size || ''} ${
            disabled ? `is-disabled` : ``
          } is-clicked${isOn ? `` : `-not`}`}
        />
      </label>
    </Wrapper>
  );
};
