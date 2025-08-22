// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { TreasuryBalanceCardWrapper } from './TreasuryBalanceCard.styles';
import type { TreasuryBalanceCardProps } from './types';

export const TreasuryBalanceCard = ({
  chainId,
  symbol,
  balance,
  disable,
}: TreasuryBalanceCardProps) => (
  <TreasuryBalanceCardWrapper $chainId={chainId}>
    <h4 className={disable ? 'disable' : ''}>{balance}</h4>
    <h2>{symbol}</h2>
  </TreasuryBalanceCardWrapper>
);
