// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect } from 'react';
import { FlexRow } from '@polkadot-live/ui/styles';
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
      window.myAPI.relayModeFlag('wc:account:verifying', false);
    };
  }, []);

  /**
   * Establish a WalletConnect session before signing.
   */
  const handleConnect = () => {
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);
    const { chainId, from } = info.actionMeta;

    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:connect:action',
      data: { chainId, target: from },
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
          <FlexRow $gap={'1.0rem'}>
            <button onClick={() => handleSign()}>Sign</button>
          </FlexRow>
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
