// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@ren/contexts/common';
import { ButtonPrimary, ButtonSecondary } from '@polkadot-live/ui/kits/buttons';
import { FlexRow } from '@polkadot-live/ui/styles';
import { LedgerOverlayWrapper } from '../Wrappers';
import type { ExtrinsicInfo } from '@polkadot-live/types';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface LedgerSignOverlayProps {
  info: ExtrinsicInfo;
}

export const SignLedgerOverlay = ({ info }: LedgerSignOverlayProps) => {
  const { cacheGet } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');

  /**
   * TODO: Handle connect click.
   */
  const handleConnect = async () => {
    console.log(info);
  };

  /**
   * TODO: Handle sign click.
   */
  const handleSign = () => {
    console.log(info);
  };

  return (
    <LedgerOverlayWrapper>
      <div className="ContentColumn">Connect Ledger Device</div>
      <p>Connect your ledger device to continue.</p>

      <FlexRow $gap={'1rem'} style={{ marginTop: '0.5rem' }}>
        <ButtonSecondary
          text="Connect"
          onClick={async () => await handleConnect()}
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
