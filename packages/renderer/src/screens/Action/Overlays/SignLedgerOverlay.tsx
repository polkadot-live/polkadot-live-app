// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigAction } from '@polkadot-live/core';
import { useConnections } from '@ren/contexts/common';
import { useEffect } from 'react';
import { useLedgerFeedback } from '@ren/contexts/action';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { ButtonPrimary, ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import { FlexRow } from '@polkadot-live/ui/styles';
import { LedgerOverlayWrapper } from '../Wrappers';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { ExtrinsicInfo } from '@polkadot-live/types';

interface LedgerSignOverlayProps {
  info: ExtrinsicInfo;
}

export const SignLedgerOverlay = ({ info }: LedgerSignOverlayProps) => {
  const { cacheGet } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');
  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();
  const { message: ledgerFeedback } = useLedgerFeedback();

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
    // TMP: Provide Ledger index.
    info.actionMeta.ledgerMeta = { index: 0 };

    ConfigAction.portAction.postMessage({
      task: 'renderer:ledger:sign',
      data: { info: JSON.stringify(info) },
    });
  };

  return (
    <LedgerOverlayWrapper>
      <div className="ContentColumn">Sign with Ledger</div>
      <p>
        Connect and unlock your Ledger, open the Polkadot app, and click{' '}
        <b>Sign</b> to continue.
      </p>

      {ledgerFeedback && (
        <p style={{ color: 'orange' }}>{ledgerFeedback.text}</p>
      )}

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
          text="Sign"
          disabled={isBuildingExtrinsic}
          onClick={() => handleSign()}
          iconRight={faChevronRight}
          iconTransform="shrink-3"
        />
      </FlexRow>
    </LedgerOverlayWrapper>
  );
};
