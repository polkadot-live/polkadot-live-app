// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useRef, useState } from 'react';
import { useConnections, useOverlay } from '@polkadot-live/contexts';
import { useTxMeta } from '../../../contexts';
import { QRViewerWrapper } from '@polkadot-live/styles/wrappers';
import {
  ButtonPrimary,
  ButtonSecondary,
  Html5QrCodePlugin,
  QrDisplayPayload,
  ScanWrapper,
  createImgSize,
  renderToast,
} from '@polkadot-live/ui';
import type { Html5Qrcode } from 'html5-qrcode';
import type { SignVaultOverlayProps } from './types';

export const SignVaultOverlay = ({ info }: SignVaultOverlayProps) => {
  const { grantCameraPermission } = useConnections();
  const { getTxPayload, setTxSignature, getGenesisHash, submitTx } =
    useTxMeta();
  const { setStatus: setOverlayStatus } = useOverlay();

  // Whether user is on sign or submit stage.
  const [stage, setStage] = useState(1);

  // This component needs access to the Html5Qrcode object because
  // it needs to stop the scanning process when the cancel button
  // is clicked or when a valid address is imported.
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // The success callback for the QR code scan plugin.
  const onScan = (data: string | null) => {
    if (data) {
      setOverlayStatus(0);
      const signature = `0x${data}`;
      setTxSignature(info.txId, signature);
      submitTx(info.txId);
    }
  };

  // Do not use any console logging functions for handling the error. The plugin
  // checks for a scan every frame and calls the error handler if no valid QR
  // code was found.
  const onError = (error: string) => {
    if (error) {
      return;
    }
  };

  const containerStyle = useMemo(() => createImgSize(300), []);

  return (
    <QRViewerWrapper>
      <div className="progress">
        <span className={stage === 1 ? 'active' : undefined}>Scan</span>
        <FontAwesomeIcon
          icon={faChevronRight}
          transform="shrink-4"
          className="arrow"
        />
        <span className={stage === 2 ? 'active' : undefined}>Sign</span>
      </div>
      {stage === 1 && (
        <div className="viewer withBorder payload-wrapper">
          <QrDisplayPayload
            address={info.actionMeta.from}
            cmd={2}
            genesisHash={getGenesisHash(info.txId)!}
            payload={getTxPayload(info.txId)!}
            style={{ width: '100%', maxWidth: 250 }}
          />
        </div>
      )}
      {stage === 2 && (
        <div className="viewer">
          <ScanWrapper style={containerStyle}>
            <Html5QrCodePlugin
              fps={10}
              qrCodeSuccessCallback={onScan}
              qrCodeErrorCallback={onError}
              html5QrCode={html5QrCodeRef.current}
            />
          </ScanWrapper>
        </div>
      )}
      <div className="foot">
        <div>
          {stage === 2 && (
            <ButtonSecondary
              text={'Back to Scan'}
              onClick={() => setStage(1)}
              iconLeft={faChevronLeft}
              iconTransform="shrink-3"
            />
          )}
          {stage === 1 && (
            <ButtonPrimary
              text="I Have Scanned"
              onClick={() => {
                grantCameraPermission().then((res) => {
                  if (res) {
                    setStage(2);
                    return;
                  }
                  const msg = 'Camera Permission Denied';
                  renderToast(msg, 'toast-error', 'error', 'top-center');
                });
              }}
              iconRight={faChevronRight}
              iconTransform="shrink-3"
            />
          )}
          <ButtonSecondary
            text="Cancel"
            marginLeft
            onClick={() => setOverlayStatus(0)}
          />
        </div>
      </div>
    </QRViewerWrapper>
  );
};
