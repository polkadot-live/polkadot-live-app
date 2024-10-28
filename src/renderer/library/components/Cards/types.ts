// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@/types/misc';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';

export interface NavCardProps {
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
