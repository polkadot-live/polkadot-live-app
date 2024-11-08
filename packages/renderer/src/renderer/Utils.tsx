// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import PolkadotIcon from '@app/svg/polkadotIcon.svg?react';
import WestendIcon from '@app/svg/westendIcon.svg?react';
import KusamaIcon from '@app/svg/kusamaIcon.svg?react';
import { checkAddress } from '@polkadot/util-crypto';
import { ChainList } from '@/config/chains';
import type { ChainID } from '@/types/chains';

// Return an address' chain ID.
export const getAddressChainId = (address: string): ChainID => {
  for (const [chainId, { prefix }] of ChainList.entries()) {
    const result = checkAddress(address, prefix);

    if (result !== null) {
      const [isValid] = result;

      if (isValid) {
        return chainId;
      }
    }
  }

  throw new Error('Imported address not recognized.');
};

// Verify that an address is encoded to one of the supported networks.
export const checkValidAddress = (address: string): boolean => {
  for (const { prefix } of ChainList.values()) {
    const result = checkAddress(address, prefix);

    if (result !== null) {
      const [isValid] = result;

      if (isValid) {
        return true;
      }
    }
  }

  return false;
};

// Return the correct network icon based on chain ID.
export const getIcon = (chainId: ChainID, iconClass: string) => {
  switch (chainId) {
    case 'Polkadot':
      return <PolkadotIcon className={iconClass} />;
    case 'Westend':
      return <WestendIcon className={iconClass} />;
    case 'Kusama':
      return <KusamaIcon className={iconClass} />;
  }
};
