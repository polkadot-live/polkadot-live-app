// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono, ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
import { ConfirmWrapper } from './Wrappers';
import { Identicon } from '@polkadot-live/ui/components';
import { useOverlay } from '@ren/renderer/contexts/common/Overlay';
import { useDeleteHandler } from '@ren/renderer/contexts/import/DeleteHandler';
import type { DeleteProps } from './types';

export const Delete = ({ address, source, setSection }: DeleteProps) => {
  const { setStatus } = useOverlay();
  const { handleDeleteAddress } = useDeleteHandler();

  // Click handler function.
  const handleDeleteClick = async () => {
    const goBack = await handleDeleteAddress(address, source);
    setStatus(0);
    goBack && setSection(0);
  };

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Delete Account</h3>
      <h5>{address}</h5>
      <p>
        Deleting this account will turn off all of its active subscriptions. It
        will need to be re-imported into the application after deletion.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          className="confirm-action"
          text="Delete Account"
          onClick={async () => await handleDeleteClick()}
        />
      </div>
    </ConfirmWrapper>
  );
};
