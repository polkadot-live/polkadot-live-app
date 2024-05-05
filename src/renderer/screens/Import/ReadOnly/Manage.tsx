// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Address } from './Address';
import { AddressWrapper } from '../Addresses/Wrappers';
import AppSVG from '@/config/svg/ledger/polkadot.svg?react';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { checkAddress } from '@polkadot/util-crypto';
import { Config as ConfigImport } from '@/config/processes/import';
import { DragClose } from '@/renderer/library/DragClose';
import { ellipsisFn, unescape } from '@w3ux/utils';
import { Flip, toast } from 'react-toastify';
import { getSortedLocalAddresses } from '@/renderer/utils/ImportUtils';
import { HeaderWrapper } from '../../Wrappers';
import { HardwareStatusBar } from '@/renderer/library/Hardware/HardwareStatusBar';
import { Identicon } from '@/renderer/library/Identicon';
import ReadmeSVG from '@/config/svg/readonly.svg?react';
import { Wrapper } from '@/renderer/library/Hardware/HardwareAddress/Wrapper';
import { useState } from 'react';
import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import type { FormEvent } from 'react';
import type { LocalAddress } from '@/types/accounts';
import type { ManageReadOnlyProps } from '../types';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { HeadingWrapper } from '../../Home/Manage/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';

export const Manage = ({
  setSection,
  section,
  addresses,
  setAddresses,
}: ManageReadOnlyProps) => {
  const [editName, setEditName] = useState<string>('');
  const { insertAccountStatus } = useAccountStatuses();

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
  // Cancel button clicked for address field.
  const onCancel = () => {
    setEditName('');
  };

  // Verify that the address is compatible with the supported networks.
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

  // Verify that the address is not already imported.
  const isAlreadyImported = (address: string): boolean => {
    for (const next of addresses) {
      if (next.address === address) {
        return true;
      }
    }

    return false;
  };

  // Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index + 1;

  // Validate input and add address to local storage.
  const onImport = () => {
    const trimmed = editName.trim();

    if (isAlreadyImported(trimmed)) {
      // Render error alert.
      toast.error('Address is already imported.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId: `toast-${trimmed}`, // prevent duplicate alerts
      });

      return;
    } else if (!validateAddress(trimmed)) {
      // Render error alert.
      toast.error('Bad account name.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId: `toast-${trimmed}`, // prevent duplicate alerts
      });

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
      });

    const storageKey = ConfigImport.getStorageKey('read-only');
    localStorage.setItem(storageKey, JSON.stringify(newAddresses));
    setAddresses(newAddresses);
    setEditName('');

    // Add account status entry.
    insertAccountStatus(trimmed, 'read-only');

    // Render success alert.
    toast.success('Address addred successfully.', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'dark',
      transition: Flip,
      toastId: `toast-${trimmed}`, // prevent duplicate alerts
    });
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
          <h4>
            <AppSVG />
            Read Only Accounts
          </h4>
        </div>
      </HeaderWrapper>

      <BodyInterfaceWrapper $maxHeight>
        <Wrapper
          style={{
            backgroundColor: 'var(--background-primary)',
            padding: '2.0rem 3rem 1.5rem',
          }}
        >
          <div className="content">
            <div className="inner">
              <div className="identicon">
                <Identicon value={editName} size={35} />
              </div>
              <div>
                <section className="row">
                  <input
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

        <AddressWrapper>
          <div className="items-wrapper" style={{ paddingTop: '1rem' }}>
            <Accordion
              multiple
              defaultIndex={accordionActiveIndices}
              setExternalIndices={setAccordionActiveIndices}
            >
              {Array.from(getSortedLocalAddresses(addresses).entries()).map(
                ([chainId, chainAddresses]) => (
                  <div key={`${chainId}_read_only_addresses`}>
                    <AccordionItem>
                      <HeadingWrapper>
                        <AccordionHeader>
                          <div className="flex">
                            <div className="left">
                              <div className="icon-wrapper">
                                {accordionActiveIndices.includes(0) ? (
                                  <FontAwesomeIcon
                                    icon={faCaretDown}
                                    transform={'shrink-1'}
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faCaretRight}
                                    transform={'shrink-1'}
                                  />
                                )}
                              </div>
                              <h5>{chainId} Accounts</h5>
                            </div>
                          </div>
                        </AccordionHeader>
                      </HeadingWrapper>
                      <AccordionPanel>
                        <div className="items">
                          {addresses.length ? (
                            <>
                              {chainAddresses.map(
                                ({
                                  address,
                                  index,
                                  isImported,
                                  name,
                                }: LocalAddress) => (
                                  <Address
                                    key={address}
                                    accountName={name}
                                    source={'read-only'}
                                    setAddresses={setAddresses}
                                    address={address}
                                    index={index}
                                    isImported={isImported || false}
                                    isLast={index === addresses.length - 1}
                                    setSection={setSection}
                                  />
                                )
                              )}
                            </>
                          ) : (
                            <p>No read only addresses imported.</p>
                          )}
                        </div>
                      </AccordionPanel>
                    </AccordionItem>
                  </div>
                )
              )}
            </Accordion>
          </div>
        </AddressWrapper>

        <HardwareStatusBar
          show={section === 1}
          Icon={ReadmeSVG}
          text={`${addresses.length} Account${
            addresses.length == 1 ? '' : 's'
          } Imported`}
          inProgress={false}
          handleDone={() => setSection(0)}
        />
      </BodyInterfaceWrapper>
    </>
  );
};
