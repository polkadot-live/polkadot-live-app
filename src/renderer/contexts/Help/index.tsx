// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as defaults from './defaults';
import type {
  HelpContextInterface,
  HelpContextProps,
  HelpContextState,
  HelpStatus,
  MaybeString,
} from './types';

export const HelpContext = createContext<HelpContextInterface>(
  defaults.defaultHelpContext
);

export const useHelp = () => useContext(HelpContext);

export const HelpProvider = ({ children }: HelpContextProps) => {
  // Help module state.
  const [state, setState] = useState<HelpContextState>({
    status: 'closed',
    definition: null,
  });

  // When fade out completes, reset active definition.
  const isInitial = useRef<boolean>(true);

  useEffect(() => {
    if (!isInitial.current) {
      if (state.status === 'closed') {
        setState({
          ...state,
          definition: null,
        });
      }
    } else {
      isInitial.current = false;
    }
  }, [state.status]);

  const setDefinition = (definition: MaybeString) => {
    setState({
      ...state,
      definition,
    });
  };

  const setStatus = (newStatus: HelpStatus) => {
    setState({
      ...state,
      status: newStatus,
    });
  };

  const openHelp = (definition: MaybeString) => {
    setState({
      ...state,
      definition,
      status: 'open',
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
        definition: state.definition,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};
