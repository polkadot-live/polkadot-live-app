// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import AppSVG from '@/config/svg/ledger/polkadot.svg?react';
import { useOverlay } from '@app/contexts/Overlay';
import { DragClose } from '@app/library/DragClose';
import { ErrorBoundary } from 'react-error-boundary';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import { AddressWrapper } from '../Addresses/Wrappers';
import { Address } from './Address';
import { Reader } from './Reader';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { HardwareStatusBar } from '@app/library/Hardware/HardwareStatusBar';
import type { LocalAddress } from '@/types/accounts';
import type { ManageVaultProps } from '../types';

export const Manage = ({
  setSection,
  section,
  addresses,
  setAddresses,
}: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();

  return (
    <>
      <DragClose windowName="import" />
      <BodyInterfaceWrapper $maxHeight>
        {addresses.length ? (
          <AddressWrapper>
            <div className="heading">
              <h4>
                <AppSVG />
                <span>Accounts</span>
              </h4>
            </div>
            <div className="items">
              {addresses.map(
                ({ address, index, isImported, name }: LocalAddress) => (
                  <Address
                    key={address}
                    accountName={name}
                    setAddresses={setAddresses}
                    address={address}
                    index={index}
                    isImported={isImported || false}
                    setSection={setSection}
                  />
                )
              )}
            </div>
            <div className="more">
              <ButtonText
                iconLeft={faQrcode}
                text={'Import Another Account'}
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
                    'small',
                    true
                  );
                }}
              />
            </div>
          </AddressWrapper>
        ) : null}

        <HardwareStatusBar
          show={section === 1}
          Icon={PolkadotVaultSVG}
          text={`${addresses.length} Account${
            addresses.length == 1 ? '' : 's'
          } Imported`}
          inProgress={false}
          handleDone={() => setSection(0)}
        />
      </BodyInterfaceWrapper>
    </>
  );
};
