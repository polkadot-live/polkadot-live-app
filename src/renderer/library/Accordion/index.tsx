import React, { createContext, useContext, useState, Children } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AnyData } from '@/types/misc';
import type { ReactNode } from 'react';

// Accordion Context
const AccordionContext = createContext({
  isActive: false,
  index: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onChangeIndex: (i: number) => {},
});

export const useAccordion = () => useContext(AccordionContext);

export function Accordion({ children, multiple, defaultIndex }: AnyData) {
  const [activeIndex, setActiveIndex] = useState<number | number[]>(
    defaultIndex
  );

  // Accordion gets re-rendered when index is changed.
  function onChangeIndex(index: number) {
    setActiveIndex((currentActiveIndex: number | number[]) => {
      if (!multiple) {
        return index === (activeIndex as number) ? -1 : index;
      }

      const activeIndices = currentActiveIndex as number[];

      // Remove index if it's in the active array.
      if (activeIndices.includes(index)) {
        return activeIndices.filter((i) => i !== index);
      }

      // Otherwise, add index to active array.
      return activeIndices.concat(index);
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
