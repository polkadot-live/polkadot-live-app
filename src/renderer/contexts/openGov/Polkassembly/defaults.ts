// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { PolkassemblyContextInterface } from './types';

export const defaultPolkassemblyContext: PolkassemblyContextInterface = {
  proposals: [],
  fetchingProposals: false,
  getProposal: () => null,
  fetchProposals: () => new Promise(() => {}),
  usePolkassemblyApi: true,
  setUsePolkassemblyApi: () => {},
};
