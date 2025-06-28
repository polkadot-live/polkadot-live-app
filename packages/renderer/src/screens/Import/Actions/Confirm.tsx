// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@polkadot-live/ui/contexts';
import { Identicon } from '@polkadot-live/ui/components';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert, ButtonMono } from '@polkadot-live/ui/kits/buttons';
import { useAddHandler } from '@ren/contexts/import';
import { ellipsisFn } from '@w3ux/utils';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import type { ConfirmProps } from './types';

/**
 * @name Confirm
 * @deprecated
 */
export const Confirm = ({ encodedAccount, genericAccount }: ConfirmProps) => {
  const { address, alias } = encodedAccount;
  const { setStatus } = useOverlay();
  const { handleAddAddress } = useAddHandler();

  const handleClickConfirm = async () => {
    await handleAddAddress(encodedAccount, genericAccount);
    setStatus(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} fontSize={'4rem'} />
      <FlexColumn $rowGap={'0.5rem'} style={{ alignItems: 'center' }}>
        <h3>Add Account</h3>
        <h4>{alias}</h4>
        <FlexRow $gap={'0.4rem'}>
          <h5>{ellipsisFn(address, 12)}</h5>
        </FlexRow>
      </FlexColumn>
      <p>
        This account will be added to the <b>Subscriptions</b> tab in the main
        window. Click on the account to manage its subscriptions.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          className="confirm-action"
          text="Add Account"
          onClick={() => handleClickConfirm()}
        />
      </div>
    </ConfirmWrapper>
  );
};
