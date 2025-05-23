// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { TooltipRx } from '../TooltipRx';
import { FlexRow } from '../../styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { BaseLinksFooter } from '../Footers';
import type { AnyData } from '@polkadot-live/types/misc';
import type { HelpItemKey } from '@polkadot-live/types/help';

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
 * @name OfflineWarning
 * @summary Render an offline message.
 */
export const OfflineWarning = ({
  style,
  text,
}: {
  style?: React.CSSProperties;
  text?: string;
}) => (
  <FlexRow $gap={'0.5rem'} style={{ ...style, color: 'var(--accent-warning)' }}>
    <FontAwesomeIcon icon={faTriangleExclamation} transform={'shrink-2'} />
    <p style={{ margin: 0, color: 'inherit' }}>{text || 'Currently offline'}</p>
  </FlexRow>
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
