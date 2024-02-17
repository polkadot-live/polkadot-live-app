import PolkadotIcon from '@app/svg/polkadotIcon.svg?react';
import WestendIcon from '@app/svg/westendIcon.svg?react';
import KusamaIcon from '@app/svg/kusamaIcon.svg?react';
import type { ChainID } from '@/types/chains';

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
