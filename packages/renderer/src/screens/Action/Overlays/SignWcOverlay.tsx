// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import WalletConnectSVG from '@w3ux/extension-assets/WalletConnect.svg?react';
import { ConfigTabs } from '@polkadot-live/core';
import {
  useConnections,
  useWcFeedback,
  useOverlay,
} from '@polkadot-live/contexts';
import { useEffect } from 'react';
import { useWcVerifier } from '../../../contexts/action';
import { ButtonPrimary, ButtonSecondary, InfoCard } from '@polkadot-live/ui';
import { FlexRow, WcOverlayWrapper } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PuffLoader } from 'react-spinners';
import type { SignWcOverlayProps } from './types';

export const SignWcOverlay = ({ info }: SignWcOverlayProps) => {
  const { cacheGet } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');
  const { message: wcFeedback, clearFeedback } = useWcFeedback();

  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();
  const {
    wcAccountApproved,
    wcAccountVerifying,
    checkVerifiedSession,
    initVerifiedSession,
    resetVerification,
  } = useWcVerifier();

  /**
   * Check signing account is approved in the WalletConnect session.
   */
  useEffect(() => {
    setDisableClose(true);
    checkVerifiedSession(info);

    return () => {
      clearFeedback();
      resetVerification();
    };
  }, []);

  /**
   * Sign an extrinsic via WalletConnect (requires a session)
   */
  const handleSign = () => {
    window.myAPI.relaySharedState('extrinsic:building', true);
    ConfigTabs.portToMain.postMessage({
      task: 'renderer:wc:sign',
      data: { info: JSON.stringify(info) },
    });
  };

  /**
   * Cancel a transaction waiting for a signature.
   */
  const handleCancelSign = () => {
    ConfigTabs.portToMain.postMessage({
      task: 'renderer:wc:sign:cancel',
      data: { txId: info.txId },
    });
    setDisableClose(false);
    setOverlayStatus(0);
    window.myAPI.relaySharedState('extrinsic:building', false);
  };

  return (
    <WcOverlayWrapper>
      {wcFeedback && (
        <InfoCard kind={'warning'} style={{ width: '100%' }}>
          <span className="Label">
            <span style={{ marginRight: '0.6rem' }}>
              <FontAwesomeIcon
                icon={FA.faExclamationTriangle}
                transform={'shrink-1'}
              />
            </span>
            {wcFeedback.body.msg}
          </span>
          <button className="dismiss" onClick={() => clearFeedback()}>
            <FontAwesomeIcon icon={FA.faX} />
          </button>
        </InfoCard>
      )}

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
              iconRight={FA.faChevronRight}
              iconTransform="shrink-3"
            />
          </FlexRow>
        </div>
      ) : (
        <div className="ContentColumn">
          <h4>Establish Session</h4>
          {wcAccountVerifying ? (
            <div className="VerifyingColumn">
              <p>Verifying WalletConnect sessions.</p>
              <div style={{ margin: '1rem 0 0.75rem' }}>
                <PuffLoader size={30} color={'var(--text-color-primary)'} />
              </div>

              <ButtonSecondary
                text="Cancel"
                disabled={isBuildingExtrinsic}
                onClick={() => {
                  setDisableClose(false);
                  setOverlayStatus(0);
                }}
              />
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
                  onClick={() => initVerifiedSession(info)}
                  iconRight={FA.faChevronRight}
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
