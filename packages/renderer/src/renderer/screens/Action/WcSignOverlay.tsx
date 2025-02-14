// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect } from 'react';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

interface WcSignOverlayProps {
  info: ExtrinsicInfo;
}

export const WcSignOverlay = ({ info }: WcSignOverlayProps) => {
  const {
    wcSyncFlags: { wcSessionRestored, wcAccountApproved, wcVerifyingAccount },
  } = useConnections();

  /**
   * Check signing account is approved in the WalletConnect session.
   */
  useEffect(() => {
    if (wcSessionRestored) {
      const { chainId, from } = info.actionMeta;

      ConfigAction.portAction.postMessage({
        task: 'renderer:wc:verify:account',
        data: { chainId, target: from },
      });
    }

    return () => {
      // Reset relay flags.
      window.myAPI.relayModeFlag('wc:account:approved', false);
      window.myAPI.relayModeFlag('wc:account:verifying', true);
    };
  }, []);

  /**
   * Establish a WalletConnect session before signing.
   *
   * @todo Handle the case where the signing account is not included in the new session.
   */
  const handleConnect = () => {
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);

    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:connect:action',
      data: null,
    });
  };

  /**
   * Sign an extrinsic via WalletConnect (requires a session)
   */
  const handleSign = () => {
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);

    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:sign',
      data: { info: JSON.stringify(info) },
    });
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '2rem 1rem',
        backgroundColor: 'rgba(32,32,32,0.4)',
        textAlign: 'center',
        borderRadius: '0.375rem',
      }}
    >
      <h2>WalletConnect Signer</h2>
      {wcAccountApproved ? (
        <div>
          <h4>Session Found</h4>
          <button onClick={() => handleSign()}>Sign</button>
        </div>
      ) : (
        <div>
          <h4>Establish Session</h4>
          {wcVerifyingAccount ? (
            <span>Loading...</span>
          ) : (
            <button onClick={() => handleConnect()}>Connect</button>
          )}
        </div>
      )}
    </div>
  );
};
