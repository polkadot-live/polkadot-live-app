// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect } from 'react';

export const useDebug = (windowId: string) => {
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === 'D') {
      window.myAPI.openDevTools(windowId);
    }
  };

  useEffect(() => {
    window.onkeyup = handleKeyUp;

    return () => {
      window.removeEventListener('keyup', handleKeyUp, false);
    };
  }, []);
};
