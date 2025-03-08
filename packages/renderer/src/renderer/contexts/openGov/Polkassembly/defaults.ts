// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { PolkassemblyContextInterface } from './types';

export const defaultPolkassemblyContext: PolkassemblyContextInterface = {
  usePolkassemblyApi: true,
  fetchingMetadata: false,
  clearProposals: () => {},
  getProposal: () => null,
  fetchProposals: () => new Promise(() => {}),
  setFetchingMetadata: () => {},
  setUsePolkassemblyApi: () => {},
};
