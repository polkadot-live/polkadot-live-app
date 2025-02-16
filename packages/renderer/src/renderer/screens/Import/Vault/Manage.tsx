// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import {
  ControlsWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import { faQrcode, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { ErrorBoundary } from 'react-error-boundary';
import { Address } from './Address';
import { Reader } from './Reader';
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import { getSortedLocalAddresses } from '@app/utils/ImportUtils';
import { useState } from 'react';
import { FlexColumn, Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { useAddresses } from '@app/contexts/import/Addresses';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { getAddressChainId } from '@ren/renderer/Utils';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { TriggerHeader } from '../../Action/Wrappers';
import type { ManageVaultProps } from '../types';
import type { ChainID } from '@polkadot-live/types/chains';

export const Manage = ({ setSection }: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();
  const { vaultAddresses: addresses } = useAddresses();

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<ChainID[]>([
    ...new Set(addresses.map(({ address }) => getAddressChainId(address))),
  ]);

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
        <div style={{ padding: '1.5rem 1.25rem 2rem', marginTop: '1rem' }}>
          {addresses.length && (
            <UI.AccordionWrapper $onePart={true}>
              <Accordion.Root
                className="AccordionRoot"
                type="multiple"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as ChainID[])}
              >
                <FlexColumn>
                  {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                    ([chainId, chainAddresses]) => (
                      <Accordion.Item
                        key={`${chainId}_vault_addresses`}
                        className="AccordionItem"
                        value={chainId}
                      >
                        <UI.AccordionTrigger narrow={true}>
                          <ChevronDownIcon
                            className="AccordionChevron"
                            aria-hidden
                          />
                          <TriggerHeader>{chainId}</TriggerHeader>
                        </UI.AccordionTrigger>
                        <UI.AccordionContent transparent={true}>
                          <ItemsColumn>
                            {chainAddresses.map((localAddress) => (
                              <Address
                                key={`address_${localAddress.name}`}
                                localAddress={localAddress}
                                setSection={setSection}
                              />
                            ))}
                          </ItemsColumn>
                        </UI.AccordionContent>
                      </Accordion.Item>
                    )
                  )}
                </FlexColumn>
              </Accordion.Root>
            </UI.AccordionWrapper>
          )}
        </div>
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
