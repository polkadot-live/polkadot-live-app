// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

export interface WcVerifierContextInterface {
  wcAccountApproved: boolean;
  wcAccountVerifying: boolean;
  checkVerifiedSession: (info: ExtrinsicInfo) => void;
  initVerifiedSession: (info: ExtrinsicInfo) => void;
  resetVerification: () => void;
  setWcAccountApproved: React.Dispatch<React.SetStateAction<boolean>>;
  setWcAccountVerifying: React.Dispatch<React.SetStateAction<boolean>>;
}
