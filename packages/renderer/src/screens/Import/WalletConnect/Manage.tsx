// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import {
  ControlsWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import {
  ButtonText,
  ButtonPrimaryInvert,
} from '@polkadot-live/ui/kits/buttons';
import { useAddresses } from '@ren/contexts/import';
import {
  getAddressChainId,
  getSortedLocalAddresses,
  getInitialChainAccordionValue,
} from '@polkadot-live/core';
import { useState } from 'react';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { ItemsColumn } from '@ren/screens/Home/Manage/Wrappers';
import { Address } from './Address';
import { ChevronDownIcon } from '@radix-ui/react-icons';
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
    <Styles.PadWrapper>
      <Styles.FlexColumn $rowGap={'2.5rem'}>
        <section>
          <UI.ActionItem showIcon={false} text={'WalletConnect Accounts'} />
          {/* Top Controls */}
          <ControlsWrapper
            $padWrapper={true}
            $padBottom={false}
            style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
          >
            <Styles.ResponsiveRow $smWidth="500px">
              <Styles.FlexRow>
                <ButtonPrimaryInvert
                  className="back-btn"
                  text="Back"
                  iconLeft={faCaretLeft}
                  onClick={() => {
                    setSection(0);
                  }}
                />
                <SortControlLabel label="WalletConnect Accounts" />
              </Styles.FlexRow>
              <Styles.FlexRow>
                <ButtonText
                  iconLeft={faCaretRight}
                  text={'Import WalletConnect Accounts'}
                  onClick={() => setShowImportUi(true)}
                />
              </Styles.FlexRow>
            </Styles.ResponsiveRow>
          </ControlsWrapper>
        </section>

        {/* Address List */}
        <section>
          {addresses.length && (
            <UI.AccordionWrapper $onePart={true}>
              <Accordion.Root
                className="AccordionRoot"
                type="single"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as ChainID)}
              >
                <Styles.FlexColumn>
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
                </Styles.FlexColumn>
              </Accordion.Root>
            </UI.AccordionWrapper>
          )}
        </section>
      </Styles.FlexColumn>
    </Styles.PadWrapper>
  );
};
