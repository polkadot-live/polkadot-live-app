// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import {
  useConnections,
  useLedgerFeedback,
  useOverlay,
} from '@polkadot-live/contexts';
import { useEffect } from 'react';
import { ButtonPrimary, ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import {
  FlexColumn,
  FlexRow,
  LedgerOverlayWrapper,
} from '@polkadot-live/styles/wrappers';
import { PuffLoader } from 'react-spinners';
import {
  faChevronRight,
  faExclamationTriangle,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SignLedgerOverlayProps } from './types';

export const SignLedgerOverlay = ({ info }: SignLedgerOverlayProps) => {
  const { cacheGet } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');
  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();
  const {
    isSigning,
    message: ledgerFeedback,
    clearFeedback,
    handleLedgerTask,
    handleSign,
  } = useLedgerFeedback();

  useEffect(() => {
    setDisableClose(true);

    // Clear generic app cache in main process when overlay closed.
    return () => {
      clearFeedback();
      handleLedgerTask('close_polkadot', '');
    };
  }, []);

  return (
    <LedgerOverlayWrapper>
      {ledgerFeedback && (
        <UI.InfoCard kind={'warning'} style={{ width: '100%' }}>
          <span className="Label">
            <span style={{ marginRight: '0.6rem' }}>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                transform={'shrink-1'}
              />
            </span>
            {ledgerFeedback.text}
          </span>
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
          onClick={() => handleSign(info)}
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
