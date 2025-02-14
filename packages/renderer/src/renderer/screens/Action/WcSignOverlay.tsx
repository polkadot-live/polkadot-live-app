// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect } from 'react';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import WalletConnectSVG from '@w3ux/extension-assets/WalletConnect.svg?react';
import { ButtonPrimary } from '@polkadot-live/ui/kits/buttons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { WcOverlayWrapper } from './Wrappers';
import { PuffLoader } from 'react-spinners';

interface WcSignOverlayProps {
  info: ExtrinsicInfo;
}

export const WcSignOverlay = ({ info }: WcSignOverlayProps) => {
  const {
    isBuildingExtrinsic,
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
    <WcOverlayWrapper>
      <WalletConnectSVG style={{ height: '3rem' }} />
      {wcAccountApproved ? (
        <div className="ContentColumn">
          <h4>WalletConnect Session Verified</h4>
          <p>
            Click the sign button below and approve the signature request in
            your connected wallet.
          </p>

          <ButtonPrimary
            style={{ width: '100px' }}
            text="Sign"
            disabled={isBuildingExtrinsic}
            onClick={() => handleSign()}
            iconRight={faChevronRight}
            iconTransform="shrink-3"
          />
        </div>
      ) : (
        <div className="ContentColumn">
          <h4>Establish Session</h4>
          {wcVerifyingAccount ? (
            <div className="VerifyingColumn">
              <p>Verifying WalletConnect sessions.</p>
              <PuffLoader size={30} color={'var(--text-color-primary)'} />
            </div>
          ) : (
            <>
              <p>
                Click the connect button and scan the QR code with your wallet
                to establish a new WalletConnect session.
              </p>
              <ButtonPrimary
                style={{ width: '100px' }}
                text="Connect"
                disabled={isBuildingExtrinsic}
                onClick={() => handleConnect()}
                iconRight={faChevronRight}
                iconTransform="shrink-3"
              />
            </>
          )}
        </div>
      )}
    </WcOverlayWrapper>
  );
};
