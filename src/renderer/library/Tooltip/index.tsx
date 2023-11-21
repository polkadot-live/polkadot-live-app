// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTooltip } from '@app/contexts/Tooltip';
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
    const { target, pageX, pageY } = e;

    if (tooltipRef?.current) {
      setTooltipPosition(pageX, pageY - (tooltipRef.current.offsetHeight || 0));
      if (!show) showTooltip();
    }

    const isTriggerElement = target?.classList.contains(
      'tooltip-trigger-element'
    );
    const dataAttribute = target?.getAttribute('data-tooltip-text') ?? false;
    if (!isTriggerElement) {
      closeTooltip();
    } else if (dataAttribute !== text) {
      closeTooltip();
    }
  };

  return (
    <>
      {!!open && (
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
      )}
    </>
  );
};
