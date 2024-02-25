// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { OnlineStatusInterface } from './types';
import { defaultOnlineStatusContext } from './default';

export const OnlineStatusContext = createContext<OnlineStatusInterface>(
  defaultOnlineStatusContext
);

export const useOnlineStatus = () => useContext(OnlineStatusContext);

export const OnlineStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [online, setOnline] = useState<boolean>(false);

  // Called when app becomes online.
  const handleOnline = () => {
    console.log('online');
  };

  // Called when app becomes offline.
  const handleOffline = () => {
    console.log('offline');
  };

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider
      value={{
        online,
        setOnline,
      }}
    >
      {children}
    </OnlineStatusContext.Provider>
  );
};
