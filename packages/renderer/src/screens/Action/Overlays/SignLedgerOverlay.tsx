// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import { ConfigAction } from '@polkadot-live/core';
import { useConnections } from '@ren/contexts/common';
import { useEffect } from 'react';
import { useLedgerFeedback } from '@ren/contexts/action';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { ButtonPrimary, ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { LedgerOverlayWrapper } from '../Wrappers';
import { PuffLoader } from 'react-spinners';
import {
  faChevronRight,
  faExclamationTriangle,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ExtrinsicInfo } from '@polkadot-live/types';

interface LedgerSignOverlayProps {
  info: ExtrinsicInfo;
}

export const SignLedgerOverlay = ({ info }: LedgerSignOverlayProps) => {
  const { cacheGet } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');
  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();
  const {
    isSigning,
    message: ledgerFeedback,
    clearFeedback,
    setIsSigning,
  } = useLedgerFeedback();

  useEffect(() => {
    setDisableClose(true);

    // Clear generic app cache in main process when overlay closed.
    return () => {
      window.myAPI
        .doLedgerTask('close_polkadot', '')
        .then((response) => console.log(response));
    };
  }, []);

  /**
   * Handle sign click.
   */
  const handleSign = () => {
    setIsSigning(true);

    // TMP: Provide Ledger index.
    info.actionMeta.ledgerMeta = { index: 0 };

    ConfigAction.portAction.postMessage({
      task: 'renderer:ledger:sign',
      data: { info: JSON.stringify(info) },
    });
  };

  return (
    <LedgerOverlayWrapper>
      {ledgerFeedback && (
        <UI.InfoCard
          kind={'warning'}
          icon={faExclamationTriangle}
          style={{ width: '100%' }}
        >
          <span>{ledgerFeedback.text}</span>
          <button className="dismiss" onClick={() => clearFeedback()}>
            <FontAwesomeIcon icon={faX} />
          </button>
        </UI.InfoCard>
      )}

      <LedgerLogoSVG className="LedgerIcon" />
      <FlexColumn $rowGap="0.25rem" className="LedgerColumn">
        <h1>Sign with Ledger</h1>
        <p>
          Connect and unlock your Ledger, open the Polkadot app, and click{' '}
          <b>Sign</b> to continue.
        </p>
      </FlexColumn>

      <FlexRow $gap={'1rem'}>
        <ButtonSecondary
          text="Cancel"
          marginLeft
          disabled={isBuildingExtrinsic || isSigning}
          onClick={() => {
            setDisableClose(false);
            setOverlayStatus(0);
          }}
        />

        <ButtonPrimary
          text="Sign"
          disabled={isBuildingExtrinsic || isSigning}
          onClick={() => handleSign()}
          iconRight={faChevronRight}
          iconTransform="shrink-3"
        />

        {isSigning && (
          <PuffLoader size={24} color={'var(--text-color-secondary)'} />
        )}
      </FlexRow>
    </LedgerOverlayWrapper>
  );
};
