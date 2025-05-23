// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  createContext,
  useContext,
  useState,
  Children,
  useEffect,
} from 'react';
import { motion } from 'framer-motion';
import { AccordionColumns } from './AccordionHeaders.styles';
import type { ReactNode } from 'react';
import type { AccordionProps } from './types';

// Accordion Context
const AccordionContext = createContext({
  isActive: false,
  index: 0,
  activeIndex: [] as number[],
  panelPad: '1rem 0.25rem',
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onChangeIndex: (i: number) => {},
});

export const useAccordion = () => useContext(AccordionContext);

export function Accordion({
  children,
  multiple,
  defaultIndex,
  indicesRef,
  gap = '1rem',
  panelPadding = '1rem 0.25rem',
}: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | number[]>(
    defaultIndex
  );
  const [panelPad] = useState<string>(panelPadding);

  // Accordion gets re-rendered when index is changed.
  function onChangeIndex(index: number) {
    setActiveIndex((currentActiveIndex: number | number[]) => {
      if (!multiple) {
        return index === (activeIndex as number) ? -1 : index;
      }

      let activeIndices = currentActiveIndex as number[];

      if (activeIndices.includes(index)) {
        // Remove index if it's in the active array.
        activeIndices = activeIndices.filter((i) => i !== index);
      } else {
        // Otherwise, add index to active array.
        activeIndices = activeIndices.concat(index);
      }

      // Update external indices ref.
      if (indicesRef) {
        indicesRef.current = [...activeIndices];
      }

      // Update internal indices state.
      return activeIndices;
    });
  }

  /// When the outer state of indices updates inner state.
  /// NOTE: EXPERIMENTAL
  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  return (
    <AccordionColumns $gap={gap}>
      {Children.map(children, (child, index) => {
        const isActive =
          multiple && Array.isArray(activeIndex)
            ? activeIndex.includes(index)
            : activeIndex === index;

        const indices = Array.isArray(activeIndex)
          ? activeIndex
          : [activeIndex];

        return (
          <AccordionContext.Provider
            value={{
              isActive,
              index,
              onChangeIndex,
              activeIndex: indices,
              panelPad,
            }}
          >
            {child}
          </AccordionContext.Provider>
        );
      })}
    </AccordionColumns>
  );
}

export function AccordionItem({ children }: { children: ReactNode }) {
  return <div style={{ overflow: 'hidden', width: '100%' }}>{children}</div>;
}

export function AccordionHeader({ children }: { children: ReactNode }) {
  const { index, onChangeIndex } = useAccordion();

  return (
    <motion.div
      style={{ userSelect: 'none' }}
      onClick={(e) => {
        // Don't animate accordion if the clicked element is a switch.
        for (const className of (e.target as HTMLElement).classList) {
          if (className.includes('switch')) {
            return;
          }
        }
        onChangeIndex(index);
      }}
    >
      {children}
    </motion.div>
  );
}

export function AccordionPanel({ children }: { children: ReactNode }) {
  const { isActive, panelPad } = useAccordion();
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive]);

  const variants = {
    open: { height: 'auto' },
    closed: { height: 0 },
  };

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
      transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
    >
      <div style={{ padding: panelPad }}>{children}</div>
    </motion.div>
  );
}
