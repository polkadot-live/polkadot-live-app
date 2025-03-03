// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { DimensionsIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { ToggleGroupRoot } from './ResizeToggles.styles';

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
