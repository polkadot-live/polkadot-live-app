// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import {
  ControlsWrapper,
  Identicon,
  HardwareAddressWrapper,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import { Address } from './Address';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { checkAddress } from '@polkadot/util-crypto';
import { ellipsisFn, unescape } from '@w3ux/utils';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';

/// Context imports.
import { useAccountStatuses } from '@app/contexts/import/AccountStatuses';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useImportHandler } from '@app/contexts/import/ImportHandler';

/// Util imports.
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { getSortedLocalAddresses, renderToast } from '@app/utils/ImportUtils';
import { getAddressChainId } from '@ren/renderer/Utils';
import { getInitialChainAccordionValue } from '@ren/utils/AccountUtils';

/// Type imports.
import type { FormEvent } from 'react';
import type { ManageReadOnlyProps } from '../types';
import type { ChainID } from '@polkadot-live/types/chains';

export const Manage = ({ setSection }: ManageReadOnlyProps) => {
  const { readOnlyAddresses: addresses, isAlreadyImported } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<ChainID>(
    getInitialChainAccordionValue([
      ...new Set(addresses.map(({ address }) => getAddressChainId(address))),
    ])
  );

  /// Component state.
  const [editName, setEditName] = useState<string>('');

  /// Verify that the address is compatible with the supported networks.
  const validateAddress = (address: string) => {
    for (const prefix of [0, 2, 42]) {
      const result = checkAddress(address, prefix);

      if (result !== null) {
        const [isValid] = result;

        if (isValid) {
          return true;
        }
      }
    }

    return false;
  };

  /// Cancel button clicked for address field.
  const onCancel = () => {
    setEditName('');
  };

  // Input change handler.
  const onChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

  /// Handle import button click.
  const onImport = async () => {
    const trimmed = editName.trim();

    if (isAlreadyImported(trimmed)) {
      renderToast('Address is already imported.', 'error', `toast-${trimmed}`);
      return;
    } else if (!validateAddress(trimmed)) {
      renderToast('Invalid Address.', 'error', `toast-${trimmed}`);
      return;
    }

    // The default account name.
    const accountName = ellipsisFn(trimmed);

    // Reset read-only address input state.
    setEditName('');

    // Add account status entry.
    insertAccountStatus(trimmed, 'read-only');

    // Set processing flag to true if online and import via main renderer.
    await handleImportAddress(trimmed, 'read-only', accountName, true);
  };

  return (
    <>
      <div style={{ padding: '0.5rem 1.5rem 0rem' }}>
        <UI.ActionItem showIcon={false} text={'Read-Only Accounts'} />
      </div>

      {/* Top Controls */}
      <ControlsWrapper
        $padWrapper={true}
        $padBottom={false}
        style={{ paddingTop: '1rem', marginBottom: 0 }}
      >
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => setSection(0)}
        />
        <SortControlLabel label="Read Only Accounts" />
      </ControlsWrapper>

      {/* Add Read Only Address */}
      <HardwareAddressWrapper
        style={{
          backgroundColor: 'inherit',
          padding: '1.5rem 1.5rem 0rem',
        }}
      >
        <FlexRow style={{ width: '100%' }}>
          <div className="identicon">
            <Identicon value={editName} fontSize={'2.5rem'} />
          </div>
          <FlexRow style={{ flex: 1 }}>
            <input
              className="add-input"
              type="text"
              placeholder="Input Address"
              value={editName}
              onChange={(e) => onChange(e)}
            />
            <button
              style={{
                color: 'var(--background-primary)',
                fontSize: '0.95rem',
              }}
              className="btn-mono lg"
              onPointerDown={async () => await onImport()}
            >
              Add
            </button>
            <button
              style={{ fontSize: '0.95rem' }}
              className="btn-mono-invert lg"
              onPointerDown={() => onCancel()}
            >
              Clear
            </button>
          </FlexRow>
        </FlexRow>
      </HardwareAddressWrapper>

      {/* Address List */}
      <div style={{ padding: '1.5rem 1.25rem 2rem', marginTop: '1rem' }}>
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
                    key={`${chainId}_read_only_addresses`}
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
                        {addresses.length ? (
                          <>
                            {chainAddresses.map((localAddress) => (
                              <Address
                                key={`address_${localAddress.name}`}
                                localAddress={localAddress}
                                setSection={setSection}
                              />
                            ))}
                          </>
                        ) : (
                          <p>No read only addresses imported.</p>
                        )}
                      </ItemsColumn>
                    </UI.AccordionContent>
                  </Accordion.Item>
                )
              )}
            </FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </div>
    </>
  );
};
