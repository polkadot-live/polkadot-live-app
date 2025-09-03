// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContextHook } from '@polkadot-live/ui/utils';
import { ConfigAction } from '@polkadot-live/core';
import { createContext, useState } from 'react';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { WcVerifierContextInterface } from './types';

export const WcVerifierContext = createContext<
  WcVerifierContextInterface | undefined
>(undefined);

export const useWcVerifier = createSafeContextHook(
  WcVerifierContext,
  'WcVerifierContext'
);

export const WcVerifierProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wcAccountApproved, setWcAccountApproved] = useState(false);
  const [wcAccountVerifying, setWcAccountVerifying] = useState(true);

  /**
   * Send port message to main renderer to verify a session.
   */
  const checkVerifiedSession = (info: ExtrinsicInfo) => {
    const { chainId, from } = info.actionMeta;
    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:verify:account',
      data: { chainId, target: from },
    });
  };

  /**
   * Clear signing network state when WcSignOverlay closed.
   */
  const clearSigningNetwork = () =>
    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:clear:signing-network',
      data: null,
    });

  /**
   * Send port message to main renderer to establish a verified session.
   */
  const initVerifiedSession = (info: ExtrinsicInfo) => {
    setWcAccountVerifying(true);
    const { chainId, from } = info.actionMeta;

    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:connect:action',
      data: { chainId, target: from },
    });
  };

  /**
   * Reset verification state when WcSignOverlay closed.
   */
  const resetVerification = () => {
    clearSigningNetwork();
    setWcAccountApproved(false);
    setWcAccountVerifying(true);
  };

  return (
    <WcVerifierContext
      value={{
        wcAccountApproved,
        wcAccountVerifying,
        checkVerifiedSession,
        initVerifiedSession,
        resetVerification,
        setWcAccountApproved,
        setWcAccountVerifying,
      }}
    >
      {children}
    </WcVerifierContext>
  );
};
