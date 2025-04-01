// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect } from 'react';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import WalletConnectSVG from '@w3ux/extension-assets/WalletConnect.svg?react';
import { ButtonPrimary, ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { WcOverlayWrapper } from './Wrappers';
import { PuffLoader } from 'react-spinners';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { FlexRow } from '@polkadot-live/ui/styles';

interface WcSignOverlayProps {
  info: ExtrinsicInfo;
}

export const WcSignOverlay = ({ info }: WcSignOverlayProps) => {
  const {
    isBuildingExtrinsic,
    wcSyncFlags: { wcSessionRestored, wcAccountApproved, wcVerifyingAccount },
  } = useConnections();

  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();

  /**
   * Check signing account is approved in the WalletConnect session.
   */
  useEffect(() => {
    // Disable closing the overlay.
    setDisableClose(true);

    if (wcSessionRestored) {
      const { chainId, from } = info.actionMeta;

      ConfigAction.portAction.postMessage({
        task: 'renderer:wc:verify:account',
        data: { chainId, target: from },
      });
    }

    return () => {
      // Reset relay flags.
      window.myAPI.relaySharedState('wc:account:approved', false);
      window.myAPI.relaySharedState('wc:account:verifying', false);
    };
  }, []);

  /**
   * Establish a WalletConnect session before signing.
   */
  const handleConnect = () => {
    window.myAPI.relaySharedState('isBuildingExtrinsic', true);
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
    window.myAPI.relaySharedState('isBuildingExtrinsic', true);

    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:sign',
      data: { info: JSON.stringify(info) },
    });
  };

  /**
   * Cancel a transaction waiting for a signature.
   */
  const handleCancelSign = () => {
    ConfigAction.portAction.postMessage({
      task: 'renderer:wc:sign:cancel',
      data: { txId: info.txId },
    });

    setDisableClose(false);
    setOverlayStatus(0);
    window.myAPI.relaySharedState('isBuildingExtrinsic', false);
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

          <FlexRow $gap={'1rem'} style={{ marginTop: '0.5rem' }}>
            <ButtonSecondary
              text="Cancel"
              marginLeft
              onClick={() => handleCancelSign()}
            />
            <ButtonPrimary
              style={{ width: '100px' }}
              text="Sign"
              disabled={isBuildingExtrinsic}
              onClick={() => handleSign()}
              iconRight={faChevronRight}
              iconTransform="shrink-3"
            />
          </FlexRow>
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
              <FlexRow $gap={'1rem'} style={{ marginTop: '0.5rem' }}>
                <ButtonSecondary
                  text="Cancel"
                  marginLeft
                  disabled={isBuildingExtrinsic}
                  onClick={() => {
                    setDisableClose(false);
                    setOverlayStatus(0);
                  }}
                />
                <ButtonPrimary
                  style={{ width: '100px' }}
                  text="Connect"
                  disabled={isBuildingExtrinsic}
                  onClick={() => handleConnect()}
                  iconRight={faChevronRight}
                  iconTransform="shrink-3"
                />
              </FlexRow>
            </>
          )}
        </div>
      )}
    </WcOverlayWrapper>
  );
};
