// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { DragClose } from '@app/library/DragClose';
import { ErrorBoundary } from 'react-error-boundary';
import { Address } from './Address';
import { Reader } from './Reader';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { getSortedLocalAddresses } from '@/renderer/utils/ImportUtils';
import { HeaderWrapper, ContentWrapper } from '@app/screens/Wrappers';
import { useState } from 'react';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import {
  ControlsWrapper,
  StatsFooter,
  Scrollable,
  SortControlLabel,
} from '@/renderer/utils/common';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { faCaretLeft } from '@fortawesome/pro-solid-svg-icons';
import type { ManageVaultProps } from '../types';

export const Manage = ({
  setSection,
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
          <h4>Manage Accounts</h4>
        </div>
      </HeaderWrapper>

      <Scrollable style={{ paddingTop: 0 }}>
        {/* Top Controls */}
        <ControlsWrapper
          $padWrapper={true}
          $padBottom={false}
          style={{ marginBottom: 0 }}
        >
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => setSection(0)}
          />
          <SortControlLabel label="Vault Accounts" />
          <ButtonText
            iconLeft={faQrcode}
            text={'Import Another Account'}
            onClick={() => {
              openOverlayWith(
                <ErrorBoundary fallback={<h2>Could not load QR Scanner</h2>}>
                  <Reader addresses={addresses} setAddresses={setAddresses} />
                </ErrorBoundary>,
                'small',
                true
              );
            }}
          />
        </ControlsWrapper>

        {/* Address List */}
        <ContentWrapper style={{ padding: '1rem 2rem 0' }}>
          {addresses.length ? (
            <Accordion
              multiple
              defaultIndex={accordionActiveIndices}
              setExternalIndices={setAccordionActiveIndices}
            >
              {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                ([chainId, chainAddresses], i) => (
                  <div
                    key={`${chainId}_vault_addresses`}
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <AccordionItem>
                      <AccordionCaretHeader
                        title={`${chainId} Accounts`}
                        itemIndex={i}
                        wide={true}
                      />
                      <AccordionPanel>
                        <div className="items-wrapper">
                          <div className="items round-primary-border">
                            {chainAddresses.map(
                              ({ address, index, isImported, name }, j) => (
                                <Address
                                  key={`address_${name}`}
                                  accountName={name}
                                  source={'vault'}
                                  address={address}
                                  index={index}
                                  isImported={isImported || false}
                                  setSection={setSection}
                                  orderData={{
                                    curIndex: j,
                                    lastIndex: chainAddresses.length - 1,
                                  }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </AccordionPanel>
                    </AccordionItem>
                  </div>
                )
              )}
            </Accordion>
          ) : null}
        </ContentWrapper>
      </Scrollable>

      <StatsFooter $chainId={'Polkadot'}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Imported Vault Accounts:</h2>
              <span>{addresses.length}</span>
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
