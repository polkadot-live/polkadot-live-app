// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@polkadot-cloud/utils';
import React, { createContext, useContext, useRef, useState } from 'react';
import { defaultTooltipContext } from './defaults';
import type { TooltipContextInterface } from './types';

export const TooltipProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(0);
  const [show, setShow] = useState(0);
  const showRef = useRef(show);

  const [text, setText] = useState<string>('');
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const openTooltip = () => {
    if (open === 1) return;
    setOpen(1);
  };

  const closeTooltip = () => {
    setStateWithRef(0, setShow, showRef);
    setOpen(0);
  };

  const setTooltipPosition = (x: number, y: number) => {
    setPosition([x, y]);
    openTooltip();
  };

  const showTooltip = () => {
    setStateWithRef(1, setShow, showRef);
  };

  const setTooltipTextAndOpen = (t: string) => {
    if (open) return;
    setText(t);
    openTooltip();
  };

  return (
    <TooltipContext.Provider
      value={{
        openTooltip,
        closeTooltip,
        setTooltipPosition,
        showTooltip,
        setTooltipTextAndOpen,
        open,
        show: showRef.current,
        position,
        text,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

export const TooltipContext = createContext<TooltipContextInterface>(
  defaultTooltipContext
);

export const useTooltip = () => useContext(TooltipContext);
