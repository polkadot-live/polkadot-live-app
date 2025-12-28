// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FieldLayout } from './FieldLayout';
import { useEvents } from '@polkadot-live/contexts';
import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import { planckToUnit } from '@w3ux/utils';
import { truncateDecimalPlaces } from '../../../../Action/Helpers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FieldProps } from './types';

export const AmountField = ({ label, value }: FieldProps) => {
  const { dataDialogEvent: event } = useEvents();
  if (!event) {
    return null;
  }

  const chainId = event.who.data.chainId as ChainID;
  const currency = chainCurrency(chainId);
  const planck = BigInt(value);
  const unit = planckToUnit(planck, chainUnits(chainId));

  return (
    <FieldLayout label={label} value={value}>
      <span>
        {truncateDecimalPlaces(unit)} {currency}
      </span>
    </FieldLayout>
  );
};
