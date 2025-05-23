// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as smoldot from 'smoldot/worker';
import { compileBytecode } from 'smoldot/bytecode';

compileBytecode().then((bytecode) => postMessage(bytecode));
onmessage = (msg) => smoldot.run(msg.data);
