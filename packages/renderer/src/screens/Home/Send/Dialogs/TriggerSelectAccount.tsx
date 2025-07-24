// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Styles from '@polkadot-live/ui/styles';
import { useConnections } from '@ren/contexts/common';
import { ellipsisFn } from '@w3ux/utils';
import { Identicon } from '@polkadot-live/ui/components';
import { SelectedAddressItem } from './Wrappers';
import type { SendAccount } from '@polkadot-live/types/accounts';
import type { SendRecipient } from '../types';
import type { TriggerSelectAccountProps } from '.';

export const TriggerSelectAccount = ({
  accountRole,
  recipient,
  sender,
}: TriggerSelectAccountProps) => {
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  let sendAccount: SendAccount | SendRecipient | null;
  let accountNotSet: boolean;
  let notSetMessage: string;
  let label = '';

  switch (accountRole) {
    case 'recipient': {
      sendAccount = recipient;
      accountNotSet = recipient === null || recipient?.address === '';
      notSetMessage = 'Select Recipient';

      if (recipient) {
        const { accountName, address } = recipient;
        label = accountName !== null ? accountName : ellipsisFn(address, 5);
      }
      break;
    }
    case 'sender': {
      sendAccount = sender;
      accountNotSet = sender === null;
      notSetMessage = 'Select Sender';

      if (sender) {
        label = sender.alias;
      }
      break;
    }
  }

  return accountNotSet ? (
    <span style={{ textAlign: 'left', flex: 1 }}>{notSetMessage}</span>
  ) : (
    <SelectedAddressItem
      className={!getOnlineMode() ? 'disable' : ''}
      $theme={theme}
    >
      <Styles.FlexRow $gap={'1.25rem'} style={{ width: '100%' }}>
        <div className="identicon" style={{ minWidth: 'fit-content' }}>
          <Identicon value={sendAccount!.address} fontSize="1.9rem" />
        </div>
        <Styles.FlexColumn $rowGap={'0.5rem'} style={{ flex: 1, minWidth: 0 }}>
          <h3>{label}</h3>
        </Styles.FlexColumn>
      </Styles.FlexRow>
    </SelectedAddressItem>
  );
};
