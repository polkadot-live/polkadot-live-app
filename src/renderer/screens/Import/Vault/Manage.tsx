// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { ButtonText, HardwareStatusBar } from '@polkadot-cloud/react';
import { AnyJson } from '@polkadot-live/types';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { ReactComponent as AppSVG } from '@/config/svg/ledger/polkadot.svg';
import { useOverlay } from '@app/contexts/Overlay';
import { DragClose } from '@app/library/DragClose';
import { ErrorBoundary } from 'react-error-boundary';
import { ReactComponent as IconSVG } from '@app/svg/polkadotVault.svg';
import { AddressWrapper } from '../Addresses/Wrappers';
import { Address } from './Address';
import { Reader } from './Reader';

export const Manage = ({
  setSection,
  section,
  addresses,
  setAddresses,
}: AnyJson) => {
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
                <span>Polkadot</span>
              </h4>
            </div>
            <div className="items">
              {addresses.map(({ address, index }: AnyJson, i: number) => (
                <Address key={i} address={address} index={index} />
              ))}
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
          Icon={IconSVG}
          text={`${addresses.length} Account${
            addresses.length == 1 ? '' : 's'
          } Imported`}
          inProgress={false}
          handleDone={() => setSection(0)}
          t={{
            tDone: 'Done',
            tCancel: 'Cancel',
          }}
        />
      </BodyInterfaceWrapper>
    </>
  );
};
