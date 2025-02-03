// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipContent } from './TooltipRx.styles';
import type { RadixTooltipProps } from './types';

/** Tooltip component */
export const TooltipRx = ({ text, theme, children }: RadixTooltipProps) => (
  <Tooltip.Provider>
    <Tooltip.Root delayDuration={0}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <TooltipContent
          $theme={theme}
          className="TooltipContent"
          sideOffset={5}
        >
          {text}
          <Tooltip.Arrow className="TooltipArrow" />
        </TooltipContent>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);
