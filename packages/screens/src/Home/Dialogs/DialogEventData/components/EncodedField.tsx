// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountField } from './AccountField';
import { AmountField } from './AmountField';
import { DefaultField } from './DefaultField';
import { NumberField } from './NumberField';
import type { EncodedFieldProps } from './types';

export const EncodedField = ({ encoded }: EncodedFieldProps) => {
  switch (encoded.tag) {
    case 'AccountId32': {
      return <AccountField {...encoded} />;
    }
    case 'BigInt': {
      return <AmountField {...encoded} />;
    }
    case 'Number': {
      return <NumberField {...encoded} />;
    }
    case 'Boolean': {
      return <DefaultField {...encoded} />;
    }
    default: {
      return <DefaultField {...encoded} />;
    }
  }
};
