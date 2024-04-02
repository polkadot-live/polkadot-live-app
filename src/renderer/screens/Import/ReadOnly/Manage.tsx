// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Address } from './Address';
import { AddressWrapper } from '../Addresses/Wrappers';
import AppSVG from '@/config/svg/ledger/polkadot.svg?react';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { DragClose } from '@/renderer/library/DragClose';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { HardwareStatusBar } from '@/renderer/library/Hardware/HardwareStatusBar';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import { useOverlay } from '@app/contexts/Overlay';
import type { LocalAddress } from '@/types/accounts';
import type { ManageReadOnlyProps } from '../types';

export const Manage = ({
  setSection,
  section,
  addresses,
  setAddresses,
}: ManageReadOnlyProps) => {
  const { openOverlayWith } = useOverlay();

  return (
    <>
      <DragClose windowName="import" />
      <BodyInterfaceWrapper $maxHeight>
        <AddressWrapper>
          <div className="heading">
            <h4>
              <AppSVG />
              <span>Read Only Accounts</span>
            </h4>
          </div>
          <div className="items">
            {addresses.length ? (
              <>
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
              </>
            ) : (
              <p>No read only addresses imported</p>
            )}
          </div>
          <div className="more">
            <ButtonText
              iconLeft={faQrcode}
              text={'Import Another Account'}
              onClick={() => {
                openOverlayWith(
                  <p>TODO: Imput address and chain ID</p>,
                  'small',
                  true
                );
              }}
            />
          </div>
        </AddressWrapper>

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
