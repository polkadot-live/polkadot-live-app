// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Tooltip from '@radix-ui/react-tooltip';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const TooltipContent = styled(Tooltip.Content).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  --tooltip-background: ${(props) => props.$theme.tooltipBackground};
  --text-bright: ${(props) => props.$theme.textBright};

  background-color: var(--tooltip-background);
  color: var(--text-bright);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  user-select: none;
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;

  &[data-state='delayed-open'][data-side='top'] {
    animation-name: slideDownAndFade;
  }
  &[data-state='delayed-open'][data-side='right'] {
    animation-name: slideLeftAndFade;
  }
  &[data-state='delayed-open'][data-side='bottom'] {
    animation-name: slideUpAndFade;
  }
  &[data-state='delayed-open'][data-side='left'] {
    animation-name: slideRightAndFade;
  }

  .TooltipArrow {
    fill: var(--tooltip-background);
  }

  @keyframes slideUpAndFade {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideRightAndFade {
    from {
      opacity: 0;
      transform: translateX(-2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideDownAndFade {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideLeftAndFade {
    from {
      opacity: 0;
      transform: translateX(2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
