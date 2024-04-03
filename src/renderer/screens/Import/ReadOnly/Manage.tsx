// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Address } from './Address';
import { AddressWrapper } from '../Addresses/Wrappers';
import AppSVG from '@/config/svg/ledger/polkadot.svg?react';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { checkAddress } from '@polkadot/util-crypto';
import { Config as ConfigImport } from '@/config/processes/import';
import { DragClose } from '@/renderer/library/DragClose';
import { Flip, toast } from 'react-toastify';
import { HardwareStatusBar } from '@/renderer/library/Hardware/HardwareStatusBar';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import { Wrapper } from '@/renderer/library/Hardware/HardwareAddress/Wrapper';
import { Identicon } from '@/renderer/library/Identicon';
import { useState } from 'react';
import { ellipsisFn, unescape } from '@w3ux/utils';
import type { FormEvent } from 'react';
import type { LocalAddress } from '@/types/accounts';
import type { ManageReadOnlyProps } from '../types';

export const Manage = ({
  setSection,
  section,
  addresses,
  setAddresses,
}: ManageReadOnlyProps) => {
  const [editName, setEditName] = useState<string>('');

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

  // Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index + 1;

  // Validate input and add address to local storage.
  const onImport = () => {
    const trimmed = editName.trim();

    if (!validateAddress(trimmed)) {
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
      <DragClose windowName="import" />
      <BodyInterfaceWrapper $maxHeight>
        <AddressWrapper>
          <div className="heading">
            <h4>
              <AppSVG />
              <span>Read Only Accounts</span>
            </h4>
          </div>
          <Wrapper>
            <div className="content" style={{ padding: '4px' }}>
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
                    &nbsp;
                    <button
                      className="btn-mono lg"
                      onPointerDown={() => onImport()}
                    >
                      Import
                    </button>
                    &nbsp;
                    <button
                      className="btn-mono-invert lg"
                      onPointerDown={() => onCancel()}
                    >
                      Clear
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </Wrapper>
          <div className="items">
            {addresses.length ? (
              <>
                {addresses.map(
                  ({ address, index, isImported, name }: LocalAddress) => (
                    <Address
                      key={address}
                      accountName={name}
                      setAddresses={setAddresses}
                      address={address}
                      index={index}
                      isImported={isImported || false}
                      setSection={setSection}
                    />
                  )
                )}
              </>
            ) : (
              <p>No read only addresses imported.</p>
            )}
          </div>
        </AddressWrapper>

        <HardwareStatusBar
          show={section === 1}
          Icon={PolkadotVaultSVG}
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
