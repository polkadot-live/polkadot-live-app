// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { Address } from './Address';
import { checkAddress } from '@polkadot/util-crypto';
import { Config as ConfigImport } from '@/config/processes/import';
import { DragClose } from '@/renderer/library/DragClose';
import { ellipsisFn, unescape } from '@w3ux/utils';
import {
  getSortedLocalAddresses,
  renderToast,
} from '@/renderer/utils/ImportUtils';
import { HeaderWrapper, ContentWrapper } from '@app/screens/Wrappers';
import { Identicon } from '@/renderer/library/Identicon';
import { Wrapper } from '@/renderer/library/Hardware/HardwareAddress/Wrapper';
import { useState } from 'react';
import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import type { FormEvent } from 'react';
import type { LocalAddress } from '@/types/accounts';
import type { ManageReadOnlyProps } from '../types';
import {
  ControlsWrapper,
  StatsFooter,
  Scrollable,
  SortControlLabel,
} from '@/renderer/utils/common';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { faCaretLeft } from '@fortawesome/pro-solid-svg-icons';

export const Manage = ({
  setSection,
  //section,
  addresses,
  setAddresses,
}: ManageReadOnlyProps) => {
  const [editName, setEditName] = useState<string>('');
  const { insertAccountStatus } = useAccountStatuses();

  /// Active accordion indices for account subscription tasks categories.
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

  /// Cancel button clicked for address field.
  const onCancel = () => {
    setEditName('');
  };

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

  /// Verify that the address is not already imported.
  const isAlreadyImported = (address: string): boolean => {
    for (const next of addresses) {
      if (next.address === address) {
        return true;
      }
    }

    return false;
  };

  /// Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index + 1;

  // Validate input and add address to local storage.
  const onImport = () => {
    const trimmed = editName.trim();

    if (isAlreadyImported(trimmed)) {
      renderToast('Address is already imported.', 'error', `toast-${trimmed}`);
      return;
    } else if (!validateAddress(trimmed)) {
      renderToast('Bad account name.', 'error', `toast-${trimmed}`);
      return;
    }

    // Update local storage.
    const newAddresses = addresses
      .filter((a: LocalAddress) => a.address !== trimmed)
      .concat({
        index: getNextAddressIndex(),
        address: trimmed,
        isImported: false,
        name: ellipsisFn(trimmed),
        source: 'read-only',
      });

    const storageKey = ConfigImport.getStorageKey('read-only');
    localStorage.setItem(storageKey, JSON.stringify(newAddresses));
    setAddresses(newAddresses);
    setEditName('');

    // Add account status entry.
    insertAccountStatus(trimmed, 'read-only');

    // TODO: Set processing flag to true.

    // TODO: Send import data to main renderer.

    // TODO: Render success alert when account is imported.
    renderToast('Address added successfully', 'success', `toast-${trimmed}`);
  };

  // Input change handler.
  const onChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

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
          <SortControlLabel label="Read Only Accounts" />
        </ControlsWrapper>

        {/* Add Read Only Address */}
        <Wrapper
          style={{
            backgroundColor: 'inherit',
            padding: '1.5rem 1.5rem 0rem',
          }}
        >
          <div className="content">
            <div className="inner">
              <div className="identicon">
                <Identicon value={editName} size={28} />
              </div>
              <div>
                <section className="row" style={{ paddingLeft: '1.25rem' }}>
                  <input
                    className="add-input"
                    type="text"
                    placeholder="Input Address"
                    value={editName}
                    onChange={(e) => onChange(e)}
                  />
                  <div className="flex-inner-row">
                    <button
                      className="btn-mono lg"
                      onPointerDown={() => onImport()}
                    >
                      Add
                    </button>
                    <button
                      className="btn-mono-invert lg"
                      onPointerDown={() => onCancel()}
                    >
                      Clear
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </Wrapper>

        {/* Address List */}
        <ContentWrapper style={{ padding: '1.25rem 2rem 0' }}>
          <Accordion
            multiple
            defaultIndex={accordionActiveIndices}
            setExternalIndices={setAccordionActiveIndices}
          >
            {Array.from(getSortedLocalAddresses(addresses).entries()).map(
              ([chainId, chainAddresses], i) => (
                <div key={`${chainId}_read_only_addresses`}>
                  <AccordionItem>
                    <AccordionCaretHeader
                      title={`${chainId} Accounts`}
                      itemIndex={i}
                      wide={true}
                    />
                    <AccordionPanel>
                      <div className="items-wrapper">
                        <div className="items">
                          {addresses.length ? (
                            <>
                              {chainAddresses.map(
                                (
                                  {
                                    address,
                                    index,
                                    isImported,
                                    name,
                                  }: LocalAddress,
                                  j
                                ) => (
                                  <Address
                                    key={address}
                                    accountName={name}
                                    source={'read-only'}
                                    setAddresses={setAddresses}
                                    address={address}
                                    index={index}
                                    isImported={isImported || false}
                                    orderData={{
                                      curIndex: j,
                                      lastIndex: chainAddresses.length - 1,
                                    }}
                                    setSection={setSection}
                                  />
                                )
                              )}
                            </>
                          ) : (
                            <p>No read only addresses imported.</p>
                          )}
                        </div>
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                </div>
              )
            )}
          </Accordion>
        </ContentWrapper>
      </Scrollable>

      <StatsFooter $chainId={'Polkadot'}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Imported Read Only Accounts:</h2>
              <span>{addresses.length}</span>
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
