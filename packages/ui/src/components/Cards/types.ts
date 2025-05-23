// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HelpItemKey } from '@polkadot-live/types/help';

export interface NavCardBaseProps {
  // TItle of the card.
  title: string;
  // Handler when clicking the card.
  onClick: AnyFunction;
  // Markup rendered in logo container.
  childrenLogo: React.ReactNode;
  // Markup rendered in the card subtitle container.
  childrenSubtitle: React.ReactNode;
  // Help content to display on clicking the info button.
  helpKey?: HelpItemKey;
  // Styles to apply to the logo container.
  styleLogoCont?: React.CSSProperties;
}

export interface NavCardProps extends NavCardBaseProps {
  // Function to open help overlay.
  openHelp: (key: HelpItemKey) => void;
}

export interface TreasuryStatCardProps {
  chainId: ChainID;
  title: string;
  statText: string;
  helpKey: HelpItemKey;
  openHelp: (key: HelpItemKey) => void;
  disable?: boolean;
}
