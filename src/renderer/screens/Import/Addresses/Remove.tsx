// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { useRemoveHandler } from '@/renderer/contexts/import/RemoveHandler';
import type { RemoveProps } from './types';

export const Remove = ({ address, source }: RemoveProps) => {
  const { setStatus } = useOverlay();
  const { handleRemoveAddress } = useRemoveHandler();

  const handleClickRemove = () => {
    handleRemoveAddress(address, source);
    setStatus(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Remove Account</h3>
      <h5>{address}</h5>
      <p>
        Removing this account will unsubscribe it from all of its events. After
        removal, this account will need to be re-imported to resume receiving
        events.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono text="Remove Account" onClick={() => handleClickRemove()} />
      </div>
    </ConfirmWrapper>
  );
};
