// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ButtonMonoInvert,
  ButtonPrimary,
} from '@polkadot-live/ui/kits/buttons';
import { ErrorBoundary } from 'react-error-boundary';
import { faAngleLeft, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useOverlay } from '@polkadot-live/ui/contexts';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import { Reader } from './Reader';
import { SplashWrapper } from '../Wrappers';
import { FlexRow } from '@polkadot-live/ui/styles';
import type { VaultSplashProps } from '../types';

export const Splash = ({ setSection }: VaultSplashProps) => {
  const { openOverlayWith } = useOverlay();

  return (
    <FlexRow style={{ height: '100%' }}>
      <SplashWrapper>
        <div className="icon">
          <PolkadotVaultSVG
            style={{ transform: 'scale(0.7)' }}
            opacity={0.25}
          />
        </div>

        <div className="content">
          <h1>No Polkadot Vault Accounts Imported</h1>
          <h4>Click Import button to scan an account from Vault.</h4>

          <div className="btns">
            <ButtonMonoInvert
              marginRight
              text="Back"
              iconLeft={faAngleLeft}
              onClick={() => setSection(0)}
            />
            <ButtonPrimary
              marginRight
              iconLeft={faQrcode}
              iconTransform="shrink-2"
              text="Import Polkadot Vault Account"
              onClick={() => {
                openOverlayWith(
                  <ErrorBoundary fallback={<h2>Could not load QR Scanner</h2>}>
                    <Reader />
                  </ErrorBoundary>,
                  'small'
                );
              }}
            />
          </div>
        </div>
      </SplashWrapper>
    </FlexRow>
  );
};
