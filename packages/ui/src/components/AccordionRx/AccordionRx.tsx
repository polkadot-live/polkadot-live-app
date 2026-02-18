// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import { forwardRef } from 'react';
import type { AnyData } from '@polkadot-live/types/misc';

/** Components */
export const AccordionTrigger = forwardRef(
  (
    { children, className, narrow, height, ...props }: AnyData,
    forwardedRef,
  ) => (
    <Accordion.Header className="AccordionHeader">
      <Accordion.Trigger
        className={`AccordionTrigger ${className}`}
        {...props}
        ref={forwardedRef}
      >
        <div
          style={{ height: height || `${narrow ? '36px' : '45px'}` }}
          className="HeaderContent"
        >
          {children}
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
  ),
);

export const AccordionContent = forwardRef(
  (
    { children, className, narrow, transparent, topGap, ...props }: AnyData,
    forwardedRef,
  ) => (
    <Accordion.Content
      className={`AccordionContent ${className}`}
      {...props}
      ref={forwardedRef}
    >
      <div
        className={`${transparent ? 'AccordionContentTransparent' : narrow ? 'AccordionContentInnerAlternate' : 'AccordionContentInner'}`}
        style={{ marginTop: topGap ?? undefined }}
      >
        {children}
      </div>
    </Accordion.Content>
  ),
);

AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';
