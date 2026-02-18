// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BaseLinksFooter } from '../Footers';
import { TooltipRx } from '../TooltipRx';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { AnyData } from '@polkadot-live/types/misc';

/**
 * @name LinksFooter
 * @summary Render shared footer in views.
 */
interface LinksFooterProps {
  openHelp: (key: HelpItemKey) => void;
}

export const LinksFooter = ({ openHelp }: LinksFooterProps) => (
  <BaseLinksFooter
    handleDisclaimerClick={() => openHelp('help:docs:disclaimer')}
    handlePrivacyClick={() => openHelp('help:docs:privacy')}
  />
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
      <TooltipRx theme={theme} text={tooltipText}>
        {children}
      </TooltipRx>
    );
  } else {
    return children;
  }
};
