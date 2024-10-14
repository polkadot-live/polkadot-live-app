// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@app/contexts/common/Connections';
import { useEffect } from 'react';

/**
 * Hook automatically listens for and sets mode flag state when they are
 * updated in other processes.
 *
 * Hook also immediately sets this renderer's mode flag state which is
 * consistent with the app.
 */

export const useAppModesSyncing = () => {
  const { setIsImporting } = useConnections();

  useEffect(() => {
    const syncModeFlags = async () => {
      setIsImporting(await window.myAPI.getModeFlag('isImporting'));
    };

    // Listen for setting events.
    window.myAPI.syncModeFlags((_, modeId, flag) => {
      switch (modeId) {
        case 'isImporting': {
          setIsImporting(flag);
          break;
        }
        default: {
          break;
        }
      }
    });

    syncModeFlags();
  }, []);
};
