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
import { HeaderWrapper } from '../../Wrappers';
import { getSortedLocalLedgerAddresses } from '@/renderer/utils/ImportUtils';
import type { ImportLedgerManageProps } from '../types';
import type { LedgerLocalAddress } from '@/types/accounts';
import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { HeadingWrapper } from '../Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';

export const Manage = ({
  addresses,
  setAddresses,
  isImporting,
  statusCodes,
  toggleImport,
  cancelImport,
  setSection,
  section,
}: ImportLedgerManageProps) => {
  // Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      {
        length:
          Array.from(getSortedLocalLedgerAddresses(addresses).keys()).length +
          1,
      },
      (_, index) => index
    )
  );

  return (
    <>
      {/* Header */}
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="import" />
          <h4>
            <AppSVG />
            Ledger Accounts
          </h4>
        </div>
      </HeaderWrapper>

      <DragClose windowName="import" />
      <BodyInterfaceWrapper $maxHeight>
        {addresses.length ? (
          <AddressWrapper>
            <div className="outer-wrapper">
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

              <Accordion
                multiple
                defaultIndex={accordionActiveIndices}
                setExternalIndices={setAccordionActiveIndices}
              >
                {Array.from(
                  getSortedLocalLedgerAddresses(addresses).entries()
                ).map(([chainId, chainAddresses]) => (
                  <div key={`${chainId}_ledger_addresses`}>
                    <AccordionItem>
                      <HeadingWrapper>
                        <AccordionHeader>
                          <div className="flex">
                            <div className="left">
                              <div className="icon-wrapper">
                                {accordionActiveIndices.includes(0) ? (
                                  <FontAwesomeIcon
                                    icon={faCaretDown}
                                    transform={'shrink-1'}
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faCaretRight}
                                    transform={'shrink-1'}
                                  />
                                )}
                              </div>
                              <h5>{chainId} Accounts</h5>
                            </div>
                          </div>
                        </AccordionHeader>
                      </HeadingWrapper>
                      <AccordionPanel>
                        <div className="items-wrapper">
                          <div className="items">
                            {chainAddresses.map(
                              (
                                {
                                  address,
                                  index,
                                  isImported,
                                  name,
                                }: LedgerLocalAddress,
                                i
                              ) => (
                                <Address
                                  key={address}
                                  address={address}
                                  source={'ledger'}
                                  accountName={name}
                                  setAddresses={setAddresses}
                                  index={index}
                                  isImported={isImported}
                                  orderData={{
                                    curIndex: i,
                                    lastIndex: chainAddresses.length - 1,
                                  }}
                                  setSection={setSection}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </AccordionPanel>
                    </AccordionItem>
                  </div>
                ))}
              </Accordion>
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
};
