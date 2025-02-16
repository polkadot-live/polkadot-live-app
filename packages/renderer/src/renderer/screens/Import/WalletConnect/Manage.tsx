// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import {
  ControlsWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import { useAddresses } from '@app/contexts/import/Addresses';
import { getSortedLocalAddresses } from '@app/utils/ImportUtils';
import { useState } from 'react';
import { FlexColumn, Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { Address } from './Address';
import { getAddressChainId } from '@ren/renderer/Utils';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { getInitialChainAccordionValue } from '@ren/utils/AccountUtils';
import type { ChainID } from '@polkadot-live/types/chains';

interface ImportWcManageProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Manage = ({
  setSection,
  setShowImportUi,
}: ImportWcManageProps) => {
  const { wcAddresses: addresses } = useAddresses();

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<ChainID>(
    getInitialChainAccordionValue([
      ...new Set(addresses.map(({ address }) => getAddressChainId(address))),
    ])
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
            onClick={() => {
              setSection(0);
            }}
          />
          <SortControlLabel label="WalletConnect Accounts" />

          <ButtonText
            iconLeft={faCaretRight}
            text={'Import WalletConnect Accounts'}
            onClick={() => setShowImportUi(true)}
          />
        </ControlsWrapper>

        {/* Address List */}
        <div style={{ padding: '1.5rem 1.25rem 2rem', marginTop: '1rem' }}>
          {addresses.length && (
            <UI.AccordionWrapper $onePart={true}>
              <Accordion.Root
                className="AccordionRoot"
                type="single"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as ChainID)}
              >
                <FlexColumn>
                  {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                    ([chainId, chainAddresses]) => (
                      <Accordion.Item
                        key={`${chainId}_wc_addresses`}
                        className="AccordionItem"
                        value={chainId}
                      >
                        <UI.AccordionTrigger narrow={true}>
                          <ChevronDownIcon
                            className="AccordionChevron"
                            aria-hidden
                          />
                          <UI.TriggerHeader>{chainId}</UI.TriggerHeader>
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
              <h2>Imported WalletConnect Accounts:</h2>
              <span>{addresses.length}</span>
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
