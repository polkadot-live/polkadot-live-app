// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
  ControlsWrapper,
  SortControlLabel,
} from '@app/library/components';
import { faQrcode, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { ErrorBoundary } from 'react-error-boundary';
import { Address } from './Address';
import { Reader } from './Reader';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { getSortedLocalAddresses } from '@/renderer/utils/ImportUtils';
import { ContentWrapper } from '@app/screens/Wrappers';
import { useState } from 'react';
import { Scrollable, StatsFooter } from '@/renderer/library/styles';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import type { ManageVaultProps } from '../types';

export const Manage = ({ setSection }: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();
  const { vaultAddresses: addresses } = useAddresses();

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
                  <Reader />
                </ErrorBoundary>,
                'small',
                true
              );
            }}
          />
        </ControlsWrapper>

        {/* Address List */}
        <ContentWrapper style={{ padding: '1rem 2rem 0' }}>
          {addresses.length && (
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
                            {chainAddresses.map((localAddress, j) => (
                              <Address
                                key={`address_${localAddress.name}`}
                                localAddress={localAddress}
                                setSection={setSection}
                                orderData={{
                                  curIndex: j,
                                  lastIndex: chainAddresses.length - 1,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </AccordionPanel>
                    </AccordionItem>
                  </div>
                )
              )}
            </Accordion>
          )}
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
