// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ellipsisFn,
  localStorageOrDefault,
  setStateWithRef,
} from '@w3ux/utils';
import { useEffect, useRef, useState } from 'react';
import { Manage } from './Manage';
import { Splash } from './Splash';
import type { AnyFunction, AnyJson } from '@/types/misc';
import type { LedgerResponse, LedgerTask } from '@/types/ledger';

const TOTAL_ALLOWED_STATUS_CODES = 50;

export const ImportLedger = ({
  section,
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => {
  // Store whether import is in process
  const [isImporting, setIsImporting] = useState(false);
  const isImportingRef = useRef(isImporting);

  // Store addresses retreived from Ledger device. Defaults to addresses saved in local storage.
  const [addresses, setAddresses] = useState<AnyJson>(
    localStorageOrDefault('ledger_addresses', [], true)
  );
  const addressesRef = useRef(addresses);

  // Store status codes received from Ledger device.
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  // Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addressesRef.current.length
      ? 0
      : addressesRef.current[addressesRef.current.length - 1].index + 1;

  // Handle an incoming new status code and persists to state.
  //
  // The most recent status code is stored at the start of the array at index 0. If total status
  // codes are larger than the maximum allowed, the status code array is popped.
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    const newStatusCodes = [{ ack, statusCode }, ...statusCodesRef.current];

    // Remove last status code if there are more than allowed number of status codes.
    if (newStatusCodes.length > TOTAL_ALLOWED_STATUS_CODES) {
      newStatusCodes.pop();
    }
    setStateWithRef(newStatusCodes, setStatusCodes, statusCodesRef);
  };

  // Connect to Ledger device and perform necessary tasks.
  //
  // The tasks sent to the device depend on the current state of the import process. The interval is
  // cleared once the address has been successfully fetched.
  let interval: ReturnType<typeof setInterval>;
  const handleLedgerLoop = () => {
    interval = setInterval(() => {
      const tasks: LedgerTask[] = [];
      if (isImportingRef.current) {
        tasks.push('get_address');
      }
      window.myAPI.doLedgerLoop(getNextAddressIndex(), tasks);
    }, 2000);
  };

  // Handle new Ledger status report.
  const handleLedgerStatusResponse = (result: string) => {
    const { ack, device, statusCode, body, options } = JSON.parse(result);
    handleNewStatusCode(ack, statusCode);

    if (statusCode === 'ReceivedAddress') {
      const addressFormatted = body.map(({ pubKey, address }: AnyJson) => ({
        index: options.accountIndex,
        ...device,
        pubKey,
        address,
        name: ellipsisFn(address),
      }));

      const newAddresses = addressesRef.current
        .filter((a: AnyJson) => a.address !== addressFormatted.address)
        .concat(addressFormatted);

      localStorage.setItem('ledger_addresses', JSON.stringify(newAddresses));
      setStateWithRef(false, setIsImporting, isImportingRef);
      setStateWithRef(newAddresses, setAddresses, addressesRef);
      setStateWithRef([], setStatusCodes, statusCodesRef);
    }
  };

  // Toggle import
  const toggleImport = (value: boolean) => {
    setStateWithRef(value, setIsImporting, isImportingRef);
  };

  // Cancel ongoing import.
  const cancelImport = () => {
    setStateWithRef(false, setIsImporting, isImportingRef);
    setStateWithRef([], setStatusCodes, statusCodesRef);
  };

  // Initialise listeners for Ledger IO.
  useEffect(() => {
    window.myAPI.reportLedgerStatus((_: Event, result: AnyJson) => {
      handleLedgerStatusResponse(result);
    });

    // Initialise fetch interval
    if (!addressesRef.current.length) {
      setStateWithRef(true, setIsImporting, isImportingRef);
    }

    handleLedgerLoop();

    return () => {
      clearInterval(interval);
    };
  }, []);

  return !addressesRef.current.length ? (
    <Splash setSection={setSection} statusCodes={statusCodesRef.current} />
  ) : (
    <Manage
      addresses={addressesRef.current}
      isImporting={isImportingRef.current}
      toggleImport={toggleImport}
      statusCodes={statusCodesRef.current}
      cancelImport={cancelImport}
      section={section}
      setSection={setSection}
    />
  );
};
