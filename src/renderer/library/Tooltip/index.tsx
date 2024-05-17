// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { useEffect, useRef } from 'react';
import { Wrapper } from './Wrapper';
import type { AnyData } from '@/types/misc';

export const Tooltip = () => {
  const {
    open,
    text,
    show,
    position,
    showTooltip,
    closeTooltip,
    setTooltipPosition,
  } = useTooltip();

  // Ref for the tooltip element itself.
  const tooltipRef: AnyData = useRef(null);

  useEffect(() => {
    if (open === 1) {
      window.addEventListener('mousemove', mouseMoveCallback);
    } else {
      window.removeEventListener('mousemove', mouseMoveCallback);
    }
    return () => {
      window.removeEventListener('mousemove', mouseMoveCallback);
    };
  }, [open]);

  const mouseMoveCallback = (e: AnyData) => {
    // Get all trigger elements in the document.
    const elements = document.querySelectorAll('.tooltip-trigger-element');
    const { pageX, pageY } = e;

    // Iterate trigger elements and act if the mouse is hovered over one.
    for (const element of elements) {
      if (element.matches(':hover')) {
        const xPos: number =
          pageX - (tooltipRef.current?.clientWidth || 0) * 0.5;
        const offsetY = 45;
        const yPos: number = pageY - offsetY;
        setTooltipPosition(xPos, yPos);

        if (!show) {
          showTooltip();
        }

        // Return after processing the tooltip.
        return;
      }
    }

    // Close tooltip if cursor is not over a trigger element.
    closeTooltip();
  };

  return (
    !!open && (
      <Wrapper
        className="tooltip-trigger-element"
        ref={tooltipRef}
        style={{
          position: 'absolute',
          left: `${position[0]}px`,
          top: `${position[1]}px`,
          zIndex: 99,
          opacity: show ? 1 : 0,
        }}
      >
        <h3 className="tooltip-trigger-element">{text}</h3>
      </Wrapper>
    )
  );
};
