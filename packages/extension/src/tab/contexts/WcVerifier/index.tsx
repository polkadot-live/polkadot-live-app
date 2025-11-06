// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContextHook, useWcFeedback } from '@polkadot-live/contexts';
import { createContext, useState } from 'react';
import { useWalletConnect } from '../WalletConnect';
import { WcError } from '@polkadot-live/core';
import { handleWcError } from '../utils';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { WcVerifierContextInterface } from '@polkadot-live/contexts/types/action';

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
  const {
    setSigningChain,
    tryCacheSession,
    verifySigningAccount,
    wcEstablishSessionForExtrinsic,
  } = useWalletConnect();

  const { clearFeedback, resolveMessage } = useWcFeedback();
  const [wcAccountApproved, setWcAccountApproved] = useState(false);
  const [wcAccountVerifying, setWcAccountVerifying] = useState(true);

  /**
   * Check if the signing account is in the session.
   */
  const checkVerifiedSession = (info: ExtrinsicInfo) => {
    handleVerificationCheck(info).then(({ approved, errorThrown }) => {
      try {
        setWcAccountVerifying(false);
        if (approved) {
          setWcAccountApproved(approved);
          clearFeedback();
        } else if (!approved && !errorThrown) {
          throw new WcError('WcAccountNotApproved');
        }
      } catch (error) {
        const feedback = handleWcError(error, 'extrinsics');
        resolveMessage(feedback);
      }
    });
  };

  const handleVerificationCheck = async (
    info: ExtrinsicInfo
  ): Promise<{ approved: boolean; errorThrown: boolean }> => {
    const { chainId, from } = info.actionMeta;
    setSigningChain(chainId);
    await tryCacheSession('extrinsics');
    return await verifySigningAccount(from, chainId);
  };

  /**
   * Clear signing network state when WcSignOverlay closed.
   */
  const clearSigningNetwork = () => {
    setSigningChain(null);
  };

  /**
   * Establish a verified session.
   */
  const initVerifiedSession = (info: ExtrinsicInfo) => {
    setWcAccountVerifying(true);
    setupVerifiedSession(info);
  };

  const setupVerifiedSession = async (info: ExtrinsicInfo) => {
    try {
      const { chainId, from } = info.actionMeta;
      await wcEstablishSessionForExtrinsic(from, chainId);
      const { approved, errorThrown } = await verifySigningAccount(
        from,
        chainId
      );
      if (approved) {
        setWcAccountApproved(approved);
        setWcAccountVerifying(false);
        clearFeedback();
      } else if (!approved && !errorThrown) {
        throw new WcError('WcAccountNotApproved');
      }
    } catch (error) {
      const feedback = handleWcError(error, 'extrinsics');
      resolveMessage(feedback);
    }
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
