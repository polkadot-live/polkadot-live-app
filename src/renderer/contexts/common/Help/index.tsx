// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { HelpConfig } from '@/config/help';
import * as defaults from './defaults';
import type {
  HelpContextInterface,
  HelpContextProps,
  HelpContextState,
  HelpItemKey,
  HelpStatus,
} from './types';

export const HelpContext = createContext<HelpContextInterface>(
  defaults.defaultHelpContext
);

export const useHelp = () => useContext(HelpContext);

export const HelpProvider = ({ children }: HelpContextProps) => {
  // Help module state.
  const [state, setState] = useState<HelpContextState>({
    status: 'closed',
    item: null,
  });

  // When fade out completes, reset active definition.
  const isInitial = useRef<boolean>(true);

  useEffect(() => {
    if (!isInitial.current) {
      if (state.status === 'closed') {
        setState({
          ...state,
          item: null,
        });
      }
    } else {
      isInitial.current = false;
    }
  }, [state.status]);

  const setDefinition = (key: HelpItemKey) => {
    const item = HelpConfig.find((h) => h.key === key) || null;

    setState({
      ...state,
      item,
    });
  };

  const setStatus = (newStatus: HelpStatus) => {
    setState({
      ...state,
      status: newStatus,
    });
  };

  const openHelp = (key: HelpItemKey) => {
    const item = HelpConfig.find((h) => h.key === key) || null;

    setState({
      status: 'open',
      item,
    });
  };

  const closeHelp = () => {
    setState({
      ...state,
      status: 'closing',
    });
  };

  return (
    <HelpContext.Provider
      value={{
        openHelp,
        closeHelp,
        setStatus,
        setDefinition,
        status: state.status,
        definition: state.item,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};
