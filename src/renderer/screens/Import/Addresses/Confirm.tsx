// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@/renderer/contexts/common/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { useImportHandler } from '@/renderer/contexts/import/ImportHandler';
import type { ConfirmProps } from './types';

export const Confirm = ({ address, name, source }: ConfirmProps) => {
  const { setStatus } = useOverlay();
  const { handleImportAddress } = useImportHandler();

  const handleClickConfirm = () => {
    handleImportAddress(address, source, name);
    setStatus(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Add Account</h3>
      <h5>{address}</h5>
      <p>
        This account will be added to the <b>Subscriptions</b> tab in the main
        window. Click on the account to manage its subscriptions.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono text="Add Account" onClick={() => handleClickConfirm()} />
      </div>
    </ConfirmWrapper>
  );
};
