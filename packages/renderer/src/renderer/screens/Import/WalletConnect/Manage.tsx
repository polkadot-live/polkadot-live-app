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
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import { useAddresses } from '@app/contexts/import/Addresses';
import { getSortedLocalAddresses } from '@app/utils/ImportUtils';
import { useState } from 'react';
import { Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { ContentWrapper } from '../../Wrappers';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { Address } from './Address';

interface ImportWcManageProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Manage = ({
  setSection,
  setShowImportUi,
}: ImportWcManageProps) => {
  const { wcAddresses: addresses } = useAddresses();

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

        <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
          {/* Address List */}
          {addresses.length ? (
            <Accordion
              multiple
              defaultIndex={accordionActiveIndices}
              setExternalIndices={setAccordionActiveIndices}
              gap={'0.5rem'}
              panelPadding={'0.5rem 0.25rem'}
            >
              {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                ([chainId, chainAddresses], i) => (
                  <div key={`${chainId}_wc_addresses`}>
                    <AccordionItem>
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
              <h2>Imported WalletConnect Accounts:</h2>
              <span>{addresses.length}</span>
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
