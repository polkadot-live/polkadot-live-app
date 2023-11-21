// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMono, ButtonMonoInvert } from '@polkadot-cloud/react';
import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import type { ConfirmProps } from './types';

export const Confirm = ({ address, name, source }: ConfirmProps) => {
  const { importAddress } = useAddresses();
  const { setStatus } = useOverlay();

  return (
    <ConfirmWrapper>
      <Identicon value={address} size={60} />
      <h3>Import Account</h3>
      <h5>{address}</h5>
      <p>
        Importing this account will automatically subscribe it to events
        relevant to its on-chain activity.
      </p>
      <p>
        After importing, events can be manually managed from the main
        menu&apos;s Manage tab.
      </p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          text="Import Account"
          onClick={() => {
            importAddress('Polkadot', source, address, name);
            setStatus(0);
          }}
        />
      </div>
    </ConfirmWrapper>
  );
};
