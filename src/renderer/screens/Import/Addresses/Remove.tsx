// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono, ButtonMonoInvert } from '@polkadot-cloud/react';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';

export const Remove = ({ address }: { address: string }) => {
  const { removeAddress } = useAddresses();
  const { setStatus } = useOverlay();

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
        <ButtonMono
          text="Remove Account"
          onClick={() => {
            removeAddress('Polkadot', address);
            setStatus(0);
          }}
        />
      </div>
    </ConfirmWrapper>
  );
};
