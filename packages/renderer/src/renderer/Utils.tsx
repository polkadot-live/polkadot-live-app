// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import PolkadotIcon from '@app/svg/polkadotIcon.svg?react';
import WestendIcon from '@app/svg/westendIcon.svg?react';
import KusamaIcon from '@app/svg/kusamaIcon.svg?react';
import { checkAddress } from '@polkadot/util-crypto';
import { ChainList } from '@ren/config/chains';
import { useHelp } from '@app/contexts/common/Help';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyData } from '@polkadot-live/types/misc';

// Render shared footer in views.
export const LinksFooter = () => {
  const { openHelp } = useHelp();
  return (
    <UI.LinksFooter
      handleDisclaimerClick={() => openHelp('help:docs:disclaimer')}
      handlePrivacyClick={() => openHelp('help:docs:privacy')}
    />
  );
};

/// Utility to render a tooltip over some generic JSX.
export const TooltipWrapper = ({
  theme,
  wrap,
  tooltipText = 'Currently Offline',
  children,
}: {
  theme: AnyData;
  wrap: boolean;
  tooltipText: string;
  children: React.ReactNode;
}) => {
  if (wrap) {
    return (
      <UI.TooltipRx theme={theme} text={tooltipText}>
        {children}
      </UI.TooltipRx>
    );
  } else {
    return children;
  }
};

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
