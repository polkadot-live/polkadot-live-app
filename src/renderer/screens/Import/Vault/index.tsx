// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { localStorageOrDefault, setStateWithRef } from '@polkadot-cloud/utils';
import { AnyFunction, AnyJson } from '@polkadot-live/types';
import { useRef, useState } from 'react';
import { Manage } from './Manage';
import { Splash } from './Splash';

export const ImportVault = ({
  section,
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => {
  // Store addresses retreived from Polkadot Vault. Defaults to addresses saved in local storage.
  const [addresses, setAddressesState] = useState<AnyJson>(
    localStorageOrDefault('vault_addresses', [], true)
  );
  const addressesRef = useRef(addresses);

  const setAddresses = (value: AnyJson) => {
    setStateWithRef(value, setAddressesState, addressesRef);
  };

  return (
    <>
      {!addressesRef.current.length ? (
        <Splash
          addresses={addressesRef.current}
          setAddresses={setAddresses}
          setSection={setSection}
        />
      ) : (
        <Manage
          section={section}
          setSection={setSection}
          addresses={addresses}
          setAddresses={setAddresses}
        />
      )}
    </>
  );
};
