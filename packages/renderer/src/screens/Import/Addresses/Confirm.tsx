// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@polkadot-live/ui/contexts';
import { Identicon } from '@polkadot-live/ui/components';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert, ButtonMono } from '@polkadot-live/ui/kits/buttons';
import { useAddHandler } from '@ren/contexts/import';
import type { ConfirmProps } from './types';

export const Confirm = ({ address, name, source }: ConfirmProps) => {
  const { setStatus } = useOverlay();
  const { handleAddAddress } = useAddHandler();

  const handleClickConfirm = async () => {
    await handleAddAddress(address, source, name);
    setStatus(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} fontSize={'4rem'} />
      <h3>Add Account</h3>
      <h5>{address}</h5>
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
