// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useState, Children } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { AccordionProps } from './types';

// Accordion Context
const AccordionContext = createContext({
  isActive: false,
  index: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onChangeIndex: (i: number) => {},
});

export const useAccordion = () => useContext(AccordionContext);

export function Accordion({
  children,
  multiple,
  defaultIndex,
  setExternalIndices,
}: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | number[]>(
    defaultIndex
  );

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

      // Set external indices state.
      if (setExternalIndices !== undefined) {
        setExternalIndices(activeIndices);
      }

      // Update internal indices state.
      return activeIndices;
    });
  }

  return Children.map(children, (child, index) => {
    const isActive =
      multiple && Array.isArray(activeIndex)
        ? activeIndex.includes(index)
        : activeIndex === index;

    return (
      <AccordionContext.Provider value={{ isActive, index, onChangeIndex }}>
        {child}
      </AccordionContext.Provider>
    );
  });
}

export function AccordionItem({ children }: { children: ReactNode }) {
  return <div style={{ overflow: 'hidden' }}>{children}</div>;
}

export function AccordionHeader({ children }: { children: ReactNode }) {
  const { index, onChangeIndex } = useAccordion();

  return (
    <motion.div onClick={() => onChangeIndex(index)}>{children}</motion.div>
  );
}

export function AccordionPanel({ children }: { children: ReactNode }) {
  const { isActive } = useAccordion();

  return (
    <AnimatePresence initial={false}>
      {isActive && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
