// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import PolkadotIcon from '../../svg/polkadotIcon.svg?react';
import KusamaIcon from '../../svg/kusamaIcon.svg?react';
import PaseoIcon from '../../svg/paseoIcon.svg?react';
import WestendIcon from '../../svg/westendIcon.svg?react';
import type { ChainIconProps } from './types';

export const ChainIcon = ({
  chainId,
  className,
  fill,
  style,
  width,
}: ChainIconProps) => {
  switch (chainId) {
    case 'Polkadot Relay':
    case 'Polkadot Asset Hub':
    case 'Polkadot People':
      return (
        <PolkadotIcon
          className={className}
          fill={fill || 'rgb(160, 37, 90)'}
          style={style}
          width={width}
        />
      );
    case 'Kusama Relay':
    case 'Kusama Asset Hub':
    case 'Kusama People':
      return (
        <KusamaIcon
          className={className}
          fill={fill}
          style={style}
          width={width}
        />
      );
    case 'Paseo Relay':
    case 'Paseo Asset Hub':
    case 'Paseo People':
      return (
        <PaseoIcon
          className={className}
          fill={fill}
          style={style}
          width={width}
        />
      );
    case 'Westend Relay':
    case 'Westend Asset Hub':
    case 'Westend People':
      return (
        <WestendIcon
          className={className}
          fill={fill}
          style={style}
          width={width}
        />
      );
  }
};
