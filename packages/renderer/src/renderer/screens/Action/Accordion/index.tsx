// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { forwardRef } from 'react';
import type { AnyData } from '@polkadot-live/types/misc';

/** Components */
export const AccordionTrigger = forwardRef(
  ({ children, className, ...props }: AnyData, forwardedRef) => (
    <Accordion.Header className="AccordionHeader">
      <Accordion.Trigger
        className={`AccordionTrigger ${className}`}
        {...props}
        ref={forwardedRef}
      >
        <ChevronDownIcon className="AccordionChevron" aria-hidden />
        <div className="HeaderContent">{children}</div>
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

export const AccordionContent = forwardRef(
  ({ children, className, ...props }: AnyData, forwardedRef) => (
    <Accordion.Content
      className={`AccordionContent ${className}`}
      {...props}
      ref={forwardedRef}
    >
      <div className="AccordionContentText">{children}</div>
    </Accordion.Content>
  )
);

AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';
