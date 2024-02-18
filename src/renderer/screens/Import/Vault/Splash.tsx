// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faQrcode } from '@fortawesome/free-solid-svg-icons';
import type { AnyJson } from '@/types/misc';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useOverlay } from '@app/contexts/Overlay';
import { Header } from '@app/library/Header';
import { ErrorBoundary } from 'react-error-boundary';
import PolkadotVaultSVG from '@polkadot-cloud/assets/extensions/svg/polkadotvault.svg?react';
import { SplashWrapper } from '../Wrappers';
import { Reader } from './Reader';
import { ButtonMonoInvert } from '@/renderer/library/Buttons/ButtonMonoInvert';
import { ButtonPrimary } from '@/renderer/library/Buttons/ButtonPrimary';

export const Splash = ({ setSection, addresses, setAddresses }: AnyJson) => {
  const { openOverlayWith } = useOverlay();

  return (
    <>
      <Header />
      <BodyInterfaceWrapper $maxHeight>
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
                    <ErrorBoundary
                      fallback={<h2>Could not load QR Scanner</h2>}
                    >
                      <Reader
                        addresses={addresses}
                        setAddresses={setAddresses}
                      />
                    </ErrorBoundary>,
                    'small'
                  );
                }}
              />
            </div>
          </div>
        </SplashWrapper>
      </BodyInterfaceWrapper>
    </>
  );
};
