// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import AppSVG from '@/config/svg/ledger/polkadot.svg?react';
import LedgerLogoSVG from '@w3ux/extension-assets/LedgerSquare.svg?react';
import { DragClose } from '../../../library/DragClose';
import { AddressWrapper } from '../Addresses/Wrappers';
import { Address } from './Address';
import { determineStatusFromCodes } from './Utils';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { HardwareStatusBar } from '@app/library/Hardware/HardwareStatusBar';
import type { ImportLedgerManageProps } from '../types';
import type { LedgerLocalAddress } from '@/types/accounts';

export const Manage = ({
  addresses,
  setAddresses,
  isImporting,
  statusCodes,
  toggleImport,
  cancelImport,
  setSection,
  section,
}: ImportLedgerManageProps) => (
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
            {addresses.map(
              ({ address, index, isImported, name }: LedgerLocalAddress) => (
                <Address
                  key={address}
                  address={address}
                  accountName={name}
                  setAddresses={setAddresses}
                  index={index}
                  isImported={isImported}
                  setSection={setSection}
                />
              )
            )}
          </div>
          <div className="more">
            <ButtonText
              iconLeft={faArrowDown}
              text={
                isImporting
                  ? ' Getting Account'
                  : 'Get Another Account (Coming Soon)'
              }
              disabled={isImporting || true}
              onClick={() => toggleImport(true)}
            />
          </div>
        </AddressWrapper>
      ) : null}

      <HardwareStatusBar
        show={section === 1}
        Icon={LedgerLogoSVG}
        text={
          !isImporting
            ? `Displaying ${addresses.length} Ledger Account${
                addresses.length === 1 ? '' : 's'
              }`
            : !statusCodes.length
              ? 'Connecting...'
              : determineStatusFromCodes(statusCodes, true).title
        }
        inProgress={false}
        handleCancel={() => cancelImport()}
        handleDone={() => setSection(0)}
      />
    </BodyInterfaceWrapper>
  </>
);
