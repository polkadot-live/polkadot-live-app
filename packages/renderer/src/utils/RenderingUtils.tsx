// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import PolkadotIcon from '@polkadot-live/consts/svg/polkadotIcon.svg?react';
import KusamaIcon from '@polkadot-live/consts/svg/kusamaIcon.svg?react';
import WestendIcon from '@polkadot-live/consts/svg/westendIcon.svg?react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useHelp } from '@app/contexts/common/Help';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  SubscriptionTask,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';

/**
 * @name LinksFooter
 * @summary Render shared footer in views.
 */
export const LinksFooter = () => {
  const { openHelp } = useHelp();
  return (
    <UI.LinksFooter
      handleDisclaimerClick={() => openHelp('help:docs:disclaimer')}
      handlePrivacyClick={() => openHelp('help:docs:privacy')}
    />
  );
};

/**
 * @name OfflineWarning
 * @summary Render an offline message.
 */
// Offline warning markup.
export const OfflineWarning = ({
  style,
  text,
}: {
  style?: React.CSSProperties;
  text?: string;
}) => (
  <Styles.FlexRow
    $gap={'0.5rem'}
    style={{ ...style, color: 'var(--accent-warning)' }}
  >
    <FontAwesomeIcon icon={faTriangleExclamation} transform={'shrink-2'} />
    <p style={{ margin: 0, color: 'inherit' }}>{text || 'Currently offline'}</p>
  </Styles.FlexRow>
);

/**
 * @name TooltipWrapper
 * @summary Utility to render a tooltip over some generic JSX.
 */
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

/**
 * @name getIcon
 * @summary Return the correct network icon based on chain ID.
 */
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

/**
 * @name getTooltipClassForGroup
 * @summary Utility to determine if a tooltip should be rendered over a subscription switch.
 * For subscription tasks associated with an account.
 */
export const showGroupTooltip = (task: SubscriptionTask) => {
  const { account, category } = task;
  if (!account) {
    return false;
  }

  switch (category) {
    case 'Nomination Pools': {
      return account.nominationPoolData ? false : true;
    }
    case 'Nominating': {
      return account.nominatingData ? false : true;
    }
    default: {
      return false;
    }
  }
};

/**
 * @name toolTipTextFor
 * @summary Utility for fetching tooltip text for a subscription switch.
 * For subscrption tasks associated with an account.
 */
export const toolTipTextFor = (category: TaskCategory) => {
  switch (category) {
    case 'Nominating': {
      return 'Not Nominating';
    }
    case 'Nomination Pools': {
      return 'Not In Nomination Pool';
    }
    default: {
      return '';
    }
  }
};

/**
 * @name getShortIntervalLabel
 * @summary Utility for getting shortened text for an interval setting.
 */
export const getShortIntervalLabel = (ticksToWait: number) => {
  switch (ticksToWait) {
    case 1:
      return '15 mins';
    case 2:
      return '30 mins';
    case 4:
      return '60 mins';
    case 8:
      return '2 hrs';
    case 16:
      return '4 hrs';
    case 24:
      return '6 hrs';
    case 48:
      return '12 hrs';
    case 96:
      return '24 hrs';
    default:
      return '';
  }
};
