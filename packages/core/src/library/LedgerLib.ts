// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ledgerErrorMeta } from '@polkadot-live/consts/ledger';
import type {
  LedgerErrorMeta,
  LedgerTaskResponse,
  SerLedgerTaskResponse,
} from '@polkadot-live/types/ledger';

/**
 * @name serializeTaskResponse
 * @summary Serialize a ledger task response (electron).
 */
export const serializeTaskResponse = (
  response: LedgerTaskResponse,
): SerLedgerTaskResponse => {
  const { ack, statusCode, body } = response;
  return { ack, statusCode, serData: JSON.stringify(body) };
};

/**
 * @name handleLedgerTaskError
 * @summary Handle Ledger connection errors and return error metadata.
 */
export const handleLedgerTaskError = (err: Error): LedgerTaskResponse => {
  let errorData: LedgerErrorMeta | null = null;

  // Check if transport is undefined.
  if (err.name === 'TransportUndefined') {
    errorData = ledgerErrorMeta.TransportUndefined;
  }
  // Check `errorMessage` property on error object.
  if ('errorMessage' in err) {
    switch (err.errorMessage) {
      case 'Device Locked': {
        errorData = ledgerErrorMeta.DeviceLocked;
        break;
      }
      case 'App does not seem to be open': {
        errorData = ledgerErrorMeta.AppNotOpen;
        break;
      }
      case 'Data is invalid : wrong metadata digest': {
        errorData = ledgerErrorMeta.WrongMetadataDigest;
        break;
      }
      case 'Data is invalid : Value out of range': {
        errorData = ledgerErrorMeta.ValueOutOfRange;
        break;
      }
      case 'Data is invalid : Unexpected buffer end': {
        errorData = ledgerErrorMeta.UnexpectedBufferEnd;
        break;
      }
      case 'Transaction rejected': {
        errorData = ledgerErrorMeta.TransactionRejected;
        break;
      }
    }
  }

  // Check `id` property on error object.
  if ('id' in err) {
    switch (err.id) {
      case 'ListenTimeout': {
        errorData = ledgerErrorMeta.DeviceNotConnected;
        break;
      }
    }
  }

  // Send default error status.
  if (!errorData) {
    errorData = ledgerErrorMeta.DeviceNotConnected;
  }

  const { ack, statusCode, body } = errorData;
  return { ack, statusCode, body };
};
