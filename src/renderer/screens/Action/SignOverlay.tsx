// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useOverlay } from '@app/contexts/Overlay';
import { useTxMeta } from '@app/contexts/TxMeta';
import { useState } from 'react';
import { QRViewerWrapper } from './Wrappers';
import type { AnyJson } from '@/types/misc';
import { QrDisplayPayload } from '@app/library/QRCode/DisplayPayload';
import { QrScanSignature } from '@app/library/QRCode/ScanSignature';
import { ButtonPrimary } from '@/renderer/kits/Buttons/ButtonPrimary';
import { ButtonSecondary } from '@/renderer/kits/Buttons/ButtonSecondary';

export const SignOverlay = ({ from }: { from: string }) => {
  const { getTxPayload, setTxSignature, getGenesisHash } = useTxMeta();
  const payload = getTxPayload();
  const { setStatus: setOverlayStatus } = useOverlay();

  // Whether user is on sign or submit stage.
  const [stage, setStage] = useState(1);

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
        <div className="viewer withBorder">
          <QrDisplayPayload
            address={from || ''}
            cmd={2}
            genesisHash={getGenesisHash()}
            payload={payload}
            style={{ width: '100%', maxWidth: 250 }}
          />
        </div>
      )}
      {stage === 2 && (
        <div className="viewer">
          <QrScanSignature
            size={75}
            onScan={({ signature }: AnyJson) => {
              setOverlayStatus(0);
              setTxSignature(signature);
            }}
          />
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
                setStage(2);
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
