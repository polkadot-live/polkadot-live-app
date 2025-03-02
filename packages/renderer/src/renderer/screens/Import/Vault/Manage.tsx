// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
import { getSortedLocalAddresses } from '@app/utils/ImportUtils';
import { useState } from 'react';
import { useAddresses } from '@app/contexts/import/Addresses';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { getAddressChainId } from '@ren/renderer/Utils';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { getInitialChainAccordionValue } from '@ren/utils/AccountUtils';
import type { ManageVaultProps } from '../types';
import type { ChainID } from '@polkadot-live/types/chains';

export const Manage = ({ setSection }: ManageVaultProps) => {
  const { openOverlayWith } = useOverlay();
  const { vaultAddresses: addresses } = useAddresses();

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<ChainID>(
    getInitialChainAccordionValue([
      ...new Set(addresses.map(({ address }) => getAddressChainId(address))),
    ])
  );

  return (
    <>
      <div style={{ padding: '0.5rem 1.5rem 0rem' }}>
        <UI.ActionItem showIcon={false} text={'Vault Accounts'} />
      </div>
      {/* Top Controls */}
      <ControlsWrapper
        $padWrapper={true}
        $padBottom={false}
        style={{ paddingTop: '1rem', marginBottom: 0 }}
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
                  <ErrorBoundary fallback={<h2>Could not load QR Scanner</h2>}>
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
              <Styles.FlexColumn>
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
      </div>
    </>
  );
};
