// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useState } from 'react';
import { defaultOverlayContext } from './defaults';
import type { OverlayContextInterface } from './types';
import type { AnyJson } from '@polkadot-live/types/misc';

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
    onCloseOverlay: null,
    disableClose: false,
  });

  const setDisableClose = (disableClose: boolean) => {
    const newState = {
      ...state,
      disableClose,
    };
    setState(newState);
  };

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
      disableClose: false,
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
    if (state.onCloseOverlay) {
      state.onCloeOverlay();
    }

    setState({
      ...state,
      status: 0,
      Overlay: null,
      onCloseOverlay: null,
    });
  };

  const setOnCloseOverlay = (onCloseOverlay: (() => void) | null) => {
    setState({
      ...state,
      onCloseOverlay,
    });
  };

  return (
    <OverlayContext.Provider
      value={{
        setOnCloseOverlay,
        openOverlayWith,
        closeOverlay,
        setStatus,
        setOverlay,
        setDisableClose,
        size: state.size,
        status: state.status,
        transparent: state.transparent,
        Overlay: state.Overlay,
        disableClose: state.disableClose,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};
