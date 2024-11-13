// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
  ControlsWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import { faQrcode, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { useOverlay } from '@ren/renderer/contexts/common/Overlay';
import { ErrorBoundary } from 'react-error-boundary';
import { Address } from './Address';
import { Reader } from './Reader';
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import { getSortedLocalAddresses } from '@ren/renderer/utils/ImportUtils';
import { ContentWrapper } from '@app/screens/Wrappers';
import { useState } from 'react';
import { Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { useAddresses } from '@ren/renderer/contexts/import/Addresses';
import type { ManageVaultProps } from '../types';
import { ItemsColumn } from '../../Home/Manage/Wrappers';

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
        <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
          {addresses.length && (
            <Accordion
              multiple
              defaultIndex={accordionActiveIndices}
              setExternalIndices={setAccordionActiveIndices}
              gap={'0.5rem'}
              panelPadding={'0.5rem 0.25rem'}
            >
              {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                ([chainId, chainAddresses], i) => (
                  <AccordionItem key={`${chainId}_vault_addresses`}>
                    <AccordionCaretHeader
                      title={`${chainId}`}
                      itemIndex={i}
                      wide={true}
                    />
                    <AccordionPanel>
                      <ItemsColumn>
                        {chainAddresses.map((localAddress) => (
                          <Address
                            key={`address_${localAddress.name}`}
                            localAddress={localAddress}
                            setSection={setSection}
                          />
                        ))}
                      </ItemsColumn>
                    </AccordionPanel>
                  </AccordionItem>
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
