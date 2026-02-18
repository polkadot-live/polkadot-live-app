// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerResponse } from '@polkadot-live/types/ledger';

// Formats a title and subtitle depending on the Ledger code received.
export const getDisplayFromLedgerCode = (
  statusCode: string,
  inStatusBar = false,
) => {
  let title;
  let subtitle = null;

  switch (statusCode) {
    case 'DeviceLocked': {
      title = 'Unlock your Ledger device to continue.';
      break;
    }
    case 'DeviceNotConnected': {
      title = inStatusBar
        ? 'Waiting For Ledger Device'
        : 'Connect and unlock your Ledger device.';
      subtitle = inStatusBar
        ? ''
        : 'Connect a Ledger device to continue account import.';
      break;
    }
    case 'AppNotOpen': {
      title = 'Open the Polkadot App';
      break;
    }
    case 'GettingAddress': {
      title = 'Getting Address...';
      break;
    }
    case 'ReceivedAddress': {
      title = 'Successfully Fetched Address';
      break;
    }
    case 'TransportUndefined': {
      title = 'Connect and unlock your Ledger device.';
      break;
    }
    default: {
      title = 'Connecting to Device...';
      break;
    }
  }

  return { title, subtitle };
};

// Determine the status of connection process. If the device is reported to be connected, ignore
// `DeviceNotConnected` error returned by other tasks.
export const determineStatusFromCode = (
  response: LedgerResponse | null,
  inStatusBar: boolean,
) => {
  if (!response) {
    return getDisplayFromLedgerCode('', inStatusBar);
  }

  const { statusCode } = response;
  return getDisplayFromLedgerCode(statusCode, inStatusBar);
};
