// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipContent } from './TooltipRx.styles';
import type { RadixTooltipProps } from './types';

/** Tooltip component */
export const TooltipRx = ({
  open,
  text,
  style,
  theme,
  onOpenChange,
  children,
  side,
}: RadixTooltipProps) => (
  <Tooltip.Provider>
    <Tooltip.Root open={open} onOpenChange={onOpenChange} delayDuration={0}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <TooltipContent
          $theme={theme}
          className="TooltipContent"
          style={style}
          sideOffset={5}
          side={side ? side : 'top'}
        >
          {text}
          <Tooltip.Arrow className="TooltipArrow" />
        </TooltipContent>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);
