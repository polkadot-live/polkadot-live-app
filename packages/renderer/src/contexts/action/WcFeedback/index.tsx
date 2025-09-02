// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, use, useState } from 'react';
import type { WalletConnectMeta } from '@polkadot-live/types/walletConnect';
import type { WcFeedbackContextInterface } from './types';

export const WcFeedbackContext = createContext<WcFeedbackContextInterface>(
  defaults.defaultWcFeedbackContext
);

export const useWcFeedback = () => use(WcFeedbackContext);

export const WcFeedbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState<WalletConnectMeta | null>(null);

  /**
   * Clear feedback state.
   */
  const clearFeedback = () => setMessage(null);

  /**
   * Set feedback message state based on received status code.
   */
  const resolveMessage = (errorMeta: WalletConnectMeta) => {
    setMessage(errorMeta);
  };

  return (
    <WcFeedbackContext
      value={{
        message,
        clearFeedback,
        resolveMessage,
      }}
    >
      {children}
    </WcFeedbackContext>
  );
};
