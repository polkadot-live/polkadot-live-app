// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

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
import { useState } from 'react';
import { useAddresses } from '@ren/contexts/import';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { ManageVaultProps } from '../types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';

export const Manage = ({ setSection }: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();
  const { vaultAddresses: genericAccounts } = useAddresses();

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<ChainID>('Polkadot');

  return (
    <Styles.PadWrapper>
      <Styles.FlexColumn $rowGap={'2.5rem'}>
        <section>
          <UI.ActionItem showIcon={false} text={'Vault Accounts'} />

          {/* Top Controls */}
          <ControlsWrapper
            $padWrapper={true}
            $padBottom={false}
            style={{ padding: '1rem 0 0 0', marginBottom: 0 }}
          >
            <Styles.ResponsiveRow $smWidth="450px">
              <Styles.FlexRow>
                <ButtonPrimaryInvert
                  className="back-btn"
                  text="Back"
                  iconLeft={faCaretLeft}
                  onClick={() => setSection(0)}
                />
                <SortControlLabel label="Vault Accounts" />
              </Styles.FlexRow>
              <Styles.FlexRow>
                <ButtonText
                  iconLeft={faQrcode}
                  text={'Import Another Account'}
                  onClick={() => {
                    openOverlayWith(
                      <ErrorBoundary
                        fallback={<h2>Could not load QR Scanner</h2>}
                      >
                        <Reader />
                      </ErrorBoundary>,
                      'small',
                      true
                    );
                  }}
                />
              </Styles.FlexRow>
            </Styles.ResponsiveRow>
          </ControlsWrapper>
        </section>

        {/* Address List */}
        <section>
          {genericAccounts.length && (
            <UI.AccordionWrapper $onePart={true}>
              <Accordion.Root
                className="AccordionRoot"
                type="single"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as ChainID)}
              >
                <Styles.FlexColumn>
                  {Array.from(
                    new Map<ChainID, ImportedGenericAccount[]>([
                      ['Polkadot', genericAccounts],
                    ]).entries()
                  ).map(([chainId, accounts]) => (
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
                        <UI.TriggerHeader>{chainId}</UI.TriggerHeader>
                      </UI.AccordionTrigger>
                      <UI.AccordionContent transparent={true}>
                        <ItemsColumn>
                          {accounts.map((genericAccount) => (
                            <Address
                              key={`address_${genericAccount.accountName}`}
                              genericAccount={genericAccount}
                              setSection={setSection}
                            />
                          ))}
                        </ItemsColumn>
                      </UI.AccordionContent>
                    </Accordion.Item>
                  ))}
                </Styles.FlexColumn>
              </Accordion.Root>
            </UI.AccordionWrapper>
          )}
        </section>
      </Styles.FlexColumn>
    </Styles.PadWrapper>
  );
};
