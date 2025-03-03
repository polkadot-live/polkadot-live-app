// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { DimensionsIcon } from '@radix-ui/react-icons';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

export const ToggleGroupRoot = styled(ToggleGroup.Root)`
  --border-radius: 0.375rem;

  height: 100%;
  display: inline-flex;
  align-items: center;
  padding-left: 1rem;

  .ToggleGroupItem {
    background-color: var(--button-background-primary);
    color: var(--text-color-secondary);
    margin-top: -4px;
    display: flex;
    align-items: center;
    min-width: 34px;
    height: 30px;
    justify-content: center;
    margin-left: 1px;
    user-select: none;
  }
  .ToggleGroupItem:first-child {
    margin-left: 0;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }
  .ToggleGroupItem:last-child {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
  .ToggleGroupItem:hover {
    background-color: var(--button-background-primary-hover);
  }
  .ToggleGroupItem[data-state='on'] {
    background-color: var(--button-background-primary-hover);
    color: var(--text-bright);
  }
  .ToggleGroupItem:focus {
    position: relative;
  }
`;

type ToggleValue = 'small' | 'medium' | 'large' | '';

export const ResizeToggles = () => {
  const [toggleValue, setToggleValue] = useState<ToggleValue>('');

  /**
   * Reset the toggle value when base window is manually resized.
   */
  useEffect(() => {
    window.myAPI.onBaseWindowResized(() => {
      setToggleValue('');
    });
  }, []);

  /**
   * Handle toggle value change.
   */
  const handleValueChanged = (val: ToggleValue) => {
    setToggleValue((pv) => (val === '' ? pv : val));
    if (val !== '') {
      window.myAPI.resizeBaseWindow(val);
    }
  };

  return (
    <ToggleGroupRoot
      className="ToggleGroup"
      type="single"
      value={toggleValue}
      onValueChange={(val) => handleValueChanged(val as ToggleValue)}
      aria-label="Window Size"
    >
      <ToggleGroup.Item
        className="ToggleGroupItem"
        value="small"
        aria-label="Small window size"
      >
        <DimensionsIcon width={'10px'} />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className="ToggleGroupItem"
        value="medium"
        aria-label="Medium window size"
      >
        <DimensionsIcon width={'12px'} />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className="ToggleGroupItem"
        value="large"
        aria-label="Large window size"
      >
        <DimensionsIcon width={'14px'} />
      </ToggleGroup.Item>
    </ToggleGroupRoot>
  );
};
