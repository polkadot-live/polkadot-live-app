// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnyJson } from '@polkadot-live/types';
import React, { createContext, useContext, useState } from 'react';
import { defaultOverlayContext } from './defaults';
import { OverlayContextInterface } from './types';

export const OverlayContext = createContext<OverlayContextInterface>(
  defaultOverlayContext
);

export const useOverlay = () => useContext(OverlayContext);

export const OverlayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<AnyJson>({
    size: 'large',
    status: 0,
    Overlay: null,
    transparent: false,
  });

  const setOverlay = (Overlay: React.ReactNode) => {
    const newState = {
      ...state,
      Overlay,
    };
    setState(newState);
  };

  const setStatus = (newStatus: number) => {
    const newState = {
      ...state,
      status: newStatus,
      dismissOpen: newStatus !== 0,
    };
    setState(newState);
  };

  const openOverlayWith = (
    Overlay: React.ReactNode,
    size = 'small',
    transparent = false
  ) => {
    setState({
      ...state,
      size,
      Overlay,
      transparent,
      status: 1,
    });
  };

  const closeOverlay = () => {
    setState({
      ...state,
      status: 0,
      Overlay: null,
    });
  };

  return (
    <OverlayContext.Provider
      value={{
        openOverlayWith,
        closeOverlay,
        setStatus,
        setOverlay,
        size: state.size,
        status: state.status,
        transparent: state.transparent,
        Overlay: state.Overlay,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};
