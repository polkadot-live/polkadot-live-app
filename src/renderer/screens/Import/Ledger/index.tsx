// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef, ellipsisFn } from '@w3ux/utils';
import { useEffect, useRef, useState } from 'react';
import { useAccountStatuses } from '@/renderer/contexts/import/AccountStatuses';
import { Config as ConfigImport } from '@/config/processes/import';
import { Manage } from './Manage';
import { Splash } from './Splash';
import type { AnyFunction } from '@/types/misc';
import type {
  GetAddressMessage,
  LedgerResponse,
  LedgerTask,
} from '@/types/ledger';
import type { LedgerLocalAddress } from '@/types/accounts';
import type { IpcRendererEvent } from 'electron';
import { useAddresses } from '@/renderer/contexts/import/Addresses';

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

  // Status entry is added for a newly imported account.
  const { insertAccountStatus } = useAccountStatuses();
  const { ledgerAddresses: addresses, setLedgerAddresses: setAddresses } =
    useAddresses();

  // Store status codes received from Ledger device.
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  // Reference to ledger loop interval id.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index + 1;

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
  const handleLedgerLoop = () => {
    intervalRef.current = setInterval(() => {
      const tasks: LedgerTask[] = [];

      if (isImportingRef.current) {
        tasks.push('get_address');
      }

      // TODO: Make dynamic
      const appName = 'Polkadot';

      window.myAPI.doLedgerLoop(getNextAddressIndex(), appName, tasks);
    }, 2000);
  };

  // Handle new Ledger status report.
  const handleLedgerStatusResponse = (parsed: GetAddressMessage) => {
    const { ack, device, statusCode, body, options } = parsed;
    handleNewStatusCode(ack, statusCode);

    if (statusCode === 'ReceivedAddress') {
      const { pubKey, address } = body[0];

      const addressFormatted: LedgerLocalAddress = {
        address,
        device: { ...device },
        index: options.accountIndex,
        isImported: false,
        name: ellipsisFn(address),
        pubKey,
      };

      const newAddresses = addresses
        .filter(
          (a: LedgerLocalAddress) => a.address !== addressFormatted.address
        )
        .concat(addressFormatted);

      const storageKey = ConfigImport.getStorageKey('ledger');
      localStorage.setItem(storageKey, JSON.stringify(newAddresses));
      setStateWithRef(false, setIsImporting, isImportingRef);
      setAddresses(newAddresses);
      setStateWithRef([], setStatusCodes, statusCodesRef);

      // Insert account status entry.
      insertAccountStatus(address, 'ledger');

      // Stop polling ledger device.
      intervalRef.current && clearInterval(intervalRef.current);
    }
  };

  // Toggle import
  const toggleImport = (value: boolean) => {
    setStateWithRef(value, setIsImporting, isImportingRef);

    // Start the ledger loop and poll for device.
    handleLedgerLoop();
  };

  // Cancel ongoing import.
  const cancelImport = () => {
    setStateWithRef(false, setIsImporting, isImportingRef);
    setStateWithRef([], setStatusCodes, statusCodesRef);
  };

  // Initialise listeners for Ledger IO.
  useEffect(() => {
    window.myAPI.reportLedgerStatus((_: IpcRendererEvent, result: string) => {
      const parsed: GetAddressMessage | undefined = JSON.parse(result);

      if (!parsed) {
        throw new Error('Unable to parse GetAddressMessage');
      }

      handleLedgerStatusResponse(parsed);
    });

    // Initialise fetch interval
    if (!addresses.length) {
      setStateWithRef(true, setIsImporting, isImportingRef);
    }

    // Start the loop if no ledger accounts have been imported and splash page is shown.
    if (addresses.length === 0) {
      handleLedgerLoop();
    }

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, []);

  return !addresses.length ? (
    <Splash setSection={setSection} statusCodes={statusCodesRef.current} />
  ) : (
    <Manage
      addresses={addresses}
      isImporting={isImporting}
      toggleImport={toggleImport}
      statusCodes={statusCodes}
      cancelImport={cancelImport}
      section={section}
      setSection={setSection}
    />
  );
};
