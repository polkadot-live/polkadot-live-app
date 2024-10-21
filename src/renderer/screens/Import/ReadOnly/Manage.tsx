// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
  Identicon,
  ControlsWrapper,
  SortControlLabel,
} from '@app/library/components';
import { Address } from './Address';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { checkAddress } from '@polkadot/util-crypto';
import { ellipsisFn, unescape } from '@w3ux/utils';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { ContentWrapper } from '@app/screens/Wrappers';
import { useState } from 'react';
import { HardwareAddressWrapper } from '@/renderer/library/components/Hardware';

/// Context imports.
import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import { useImportHandler } from '@/renderer/contexts/import/ImportHandler';

/// Util imports.
import { Scrollable, StatsFooter } from '@/renderer/library/styles';
import {
  getSortedLocalAddresses,
  renderToast,
} from '@/renderer/utils/ImportUtils';

/// Type imports.
import type { FormEvent } from 'react';
import type { ManageReadOnlyProps } from '../types';

export const Manage = ({ setSection }: ManageReadOnlyProps) => {
  const { readOnlyAddresses: addresses, isAlreadyImported } = useAddresses();
  const { insertAccountStatus } = useAccountStatuses();
  const { handleImportAddress } = useImportHandler();

  /// Component state.
  const [editName, setEditName] = useState<string>('');

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
    await handleImportAddress(trimmed, 'read-only', accountName);
  };

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
          <SortControlLabel label="Read Only Accounts" />
        </ControlsWrapper>

        {/* Add Read Only Address */}
        <HardwareAddressWrapper
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
                      onPointerDown={async () => await onImport()}
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
        </HardwareAddressWrapper>

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
                        <div className="items round-primary-border">
                          {addresses.length ? (
                            <>
                              {chainAddresses.map((localAddress, j) => (
                                <Address
                                  key={`address_${localAddress.name}`}
                                  localAddress={localAddress}
                                  orderData={{
                                    curIndex: j,
                                    lastIndex: chainAddresses.length - 1,
                                  }}
                                  setSection={setSection}
                                />
                              ))}
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
