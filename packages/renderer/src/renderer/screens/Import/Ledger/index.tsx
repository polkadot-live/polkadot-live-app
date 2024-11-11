// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef, ellipsisFn } from '@w3ux/utils';
import { useEffect, useRef, useState } from 'react';
import { useAccountStatuses } from '@ren/renderer/contexts/import/AccountStatuses';
import { useAddresses } from '@ren/renderer/contexts/import/Addresses';
import { useImportHandler } from '@ren/renderer/contexts/import/ImportHandler';
import { Manage } from './Manage';
import { Splash } from './Splash';
import { renderToast } from '@ren/renderer/utils/ImportUtils';
import type {
  GetAddressMessage,
  LedgerResponse,
  LedgerTask,
} from '@polkadot-live/types/ledger';
import type { ImportLedgerProps } from '../types';
import type { IpcRendererEvent } from 'electron';
import type { AnyData } from '@polkadot-live/types/misc';

const TOTAL_ALLOWED_STATUS_CODES = 50;

export const ImportLedger = ({ setSection, curSource }: ImportLedgerProps) => {
  /// Status entry is added for a newly imported account.
  const { insertAccountStatus } = useAccountStatuses();
  const { ledgerAddresses: addresses, isAlreadyImported } = useAddresses();

  /// Import handler.
  const { handleImportAddress } = useImportHandler();

  /// Store whether import is in process
  const [isImporting, setIsImporting] = useState(false);
  const isImportingRef = useRef(isImporting);

  /// Used in effect for processing an import.
  const [processImport, setProcessImport] = useState(false);
  const bodyRef = useRef<{
    address: string;
    pubKey: string;
    device: { id: string; productName: string };
    options: AnyData;
  } | null>(null);

  /// Store status codes received from Ledger device.
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  /// Reference to ledger loop interval id.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /// Gets the next non-imported address index.
  const getNextAddressIndex = () =>
    !addresses.length ? 0 : addresses[addresses.length - 1].index || 0 + 1;

  /// Handle an incoming new status code and persist to state.
  const handleNewStatusCode = (ack: string, statusCode: string) => {
    const newStatusCodes = [{ ack, statusCode }, ...statusCodesRef.current];

    // Remove last status code if there are more than allowed number of status codes.
    if (newStatusCodes.length > TOTAL_ALLOWED_STATUS_CODES) {
      newStatusCodes.pop();
    }
    setStateWithRef(newStatusCodes, setStatusCodes, statusCodesRef);
  };

  /// Start interval to poll Ledger device and perform necessary tasks.
  const handleLedgerLoop = () => {
    intervalRef.current = setInterval(() => {
      const tasks: LedgerTask[] = [];

      if (isImportingRef.current) {
        tasks.push('get_address');
      }

      // TODO: Make dynamic
      const chainName = 'Polkadot';

      window.myAPI.doLedgerLoop(getNextAddressIndex(), chainName, tasks);
    }, 2000);
  };

  /// Handle a received Ledger address.
  const handleLedgerStatusResponse = (parsed: GetAddressMessage) => {
    const { ack, device, statusCode, body, options } = parsed;
    handleNewStatusCode(ack, statusCode);

    if (statusCode === 'ReceivedAddress') {
      // Stop polling ledger device.
      intervalRef.current && clearInterval(intervalRef.current);

      const { pubKey, address } = body[0];
      bodyRef.current = { address, pubKey, device, options };
      setProcessImport(true);
    }
  };

  /// Toggle import
  const toggleImport = (value: boolean) => {
    setStateWithRef(value, setIsImporting, isImportingRef);

    if (value) {
      handleLedgerLoop();
    } else {
      intervalRef.current && clearInterval(intervalRef.current);
      cancelImport();
    }
  };

  /// Cancel ongoing import.
  const cancelImport = () => {
    setStateWithRef(false, setIsImporting, isImportingRef);
    setStateWithRef([], setStatusCodes, statusCodesRef);
  };

  /// Initialise listeners for Ledger IO.
  useEffect(() => {
    // Start the loop if no ledger accounts have been imported and splash page is shown.
    if (curSource && curSource === 'ledger' && !addresses.length) {
      // Listen for messages from main process.
      window.myAPI.reportLedgerStatus((_: IpcRendererEvent, result: string) => {
        const parsed: GetAddressMessage | undefined = JSON.parse(result);

        if (!parsed) {
          throw new Error('Unable to parse GetAddressMessage');
        }

        handleLedgerStatusResponse(parsed);
      });

      setStateWithRef(true, setIsImporting, isImportingRef);
      handleLedgerLoop();
    } else {
      intervalRef.current && clearInterval(intervalRef.current);
    }

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [curSource]);

  /// Effect to trigger a ledger account import process.
  useEffect(() => {
    const handleImportProcess = async () => {
      if (processImport && bodyRef.current) {
        const { address, pubKey, device /*, options*/ } = bodyRef.current;

        // Check if address is already imported.
        if (isAlreadyImported(address)) {
          renderToast(
            'Address is already imported.',
            'error',
            `toast-${address}`
          );
          setSection(0);
        } else {
          await handleImportAddress(
            address,
            'ledger',
            ellipsisFn(address),
            pubKey,
            device
          );

          // Insert account status entry.
          insertAccountStatus(address, 'ledger');
        }

        setStateWithRef(false, setIsImporting, isImportingRef);
        setStateWithRef([], setStatusCodes, statusCodesRef);
        setProcessImport(false);
        bodyRef.current = null;
      }
    };

    handleImportProcess();
  }, [processImport]);

  return !addresses.length ? (
    <Splash setSection={setSection} statusCodes={statusCodesRef.current} />
  ) : (
    <Manage
      isImporting={isImporting}
      toggleImport={toggleImport}
      statusCodes={statusCodes}
      cancelImport={cancelImport}
      setSection={setSection}
    />
  );
};
