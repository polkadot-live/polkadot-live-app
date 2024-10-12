// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext } from 'react';
import { defaultDataBackupContext } from './default';
import type { DataBackupContextInterface } from './types';

export const DataBackupContext = createContext<DataBackupContextInterface>(
  defaultDataBackupContext
);

export const useDataBackup = () => useContext(DataBackupContext);

export const DataBackupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log('tmp');

  return (
    <DataBackupContext.Provider value={{}}>
      {children}
    </DataBackupContext.Provider>
  );
};
