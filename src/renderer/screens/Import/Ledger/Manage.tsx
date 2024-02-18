// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { HardwareStatusBar } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import AppSVG from '@/config/svg/ledger/polkadot.svg?react';
import LedgerLogoSVG from '@polkadot-cloud/assets/extensions/svg/ledgersquare.svg?react';
import { DragClose } from '../../../library/DragClose';
import { AddressWrapper } from '../Addresses/Wrappers';
import { Address } from './Address';
import { determineStatusFromCodes } from './Utils';
import { ButtonText } from '@/renderer/library/kits/Buttons/ButtonText';

export const Manage = ({
  addresses,
  isImporting,
  statusCodes,
  toggleImport,
  cancelImport,
  setSection,
  section,
}: AnyJson) => (
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
              iconLeft={faArrowDown}
              text={isImporting ? ' Getting Account' : 'Get Another Account'}
              disabled={isImporting}
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
        t={{
          tDone: 'Done',
          tCancel: 'Cancel',
        }}
      />
    </BodyInterfaceWrapper>
  </>
);
