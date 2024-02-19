// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useAddresses } from '@app/contexts/Addresses';
import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import type { ConfirmProps } from './types';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';

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
