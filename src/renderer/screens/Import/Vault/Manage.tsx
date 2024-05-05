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
import { getSortedLocalAddresses } from '@/renderer/utils/ImportUtils';
import { HeaderWrapper } from '../../Wrappers';
import { HardwareStatusBar } from '@app/library/Hardware/HardwareStatusBar';
import type { ManageVaultProps } from '../types';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { HeadingWrapper } from '../../Home/Manage/Wrappers';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';

export const Manage = ({
  setSection,
  section,
  addresses,
  setAddresses,
}: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();

  // Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      {
        length:
          Array.from(getSortedLocalAddresses(addresses).keys()).length + 1,
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
            Vault Accounts
          </h4>
        </div>
      </HeaderWrapper>

      <DragClose windowName="import" />
      <BodyInterfaceWrapper $maxHeight>
        {addresses.length ? (
          <AddressWrapper>
            <div className="items-wrapper">
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

              <Accordion
                multiple
                defaultIndex={accordionActiveIndices}
                setExternalIndices={setAccordionActiveIndices}
              >
                {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                  ([chainId, chainAddresses]) => (
                    <div key={`${chainId}_vault_addresses`}>
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
                          <div className="items">
                            {chainAddresses.map(
                              ({ address, index, isImported, name }) => (
                                <Address
                                  key={address}
                                  accountName={name}
                                  source={'vault'}
                                  setAddresses={setAddresses}
                                  address={address}
                                  index={index}
                                  isImported={isImported || false}
                                  isLast={index === addresses.length - 1}
                                  setSection={setSection}
                                />
                              )
                            )}
                          </div>
                        </AccordionPanel>
                      </AccordionItem>
                    </div>
                  )
                )}
              </Accordion>
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
