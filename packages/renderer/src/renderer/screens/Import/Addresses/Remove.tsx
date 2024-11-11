// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@ren/renderer/contexts/common/Overlay';
import { Identicon } from '@app/library/components';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@ren/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@ren/renderer/kits/Buttons/ButtonMono';
import { useRemoveHandler } from '@ren/renderer/contexts/import/RemoveHandler';
import type { RemoveProps } from './types';

export const Remove = ({ address, source, accountName }: RemoveProps) => {
  const { setStatus } = useOverlay();
  const { handleRemoveAddress } = useRemoveHandler();

  const handleClickRemove = async () => {
    await handleRemoveAddress(address, source, accountName);
    setStatus(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Remove Account</h3>
      <h5>{address}</h5>
      <p>
        This account will be removed from the main window. All active
        subscriptions associated with this account will be turned off.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          className="confirm-action"
          text="Remove Account"
          onClick={async () => await handleClickRemove()}
        />
      </div>
    </ConfirmWrapper>
  );
};
