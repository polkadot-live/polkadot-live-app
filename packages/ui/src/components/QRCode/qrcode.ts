// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import _qrcode from 'qrcode-generator';

// A small hurdle to jump through, just to get the default/default correct (as generated)
const qrcode: typeof _qrcode = _qrcode;

// HACK The default function take string -> number[], the Uint8array is compatible
// with that signature and the use thereof
// biome-ignore lint/suspicious/noExplicitAny: Allow the QR code library to accept Uint8Array directly, as it internally supports byte mode.
(qrcode as any).stringToBytes = (data: Uint8Array): Uint8Array => data;

export { qrcode };
