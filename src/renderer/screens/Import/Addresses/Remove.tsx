// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { ConfigRenderer } from '@/config/ConfigRenderer';
import type { AnyFunction } from '@w3ux/utils/types';
import type { LocalAddress } from '@/types/accounts';
import { getAddressChainId } from '@/renderer/Utils';

export const Remove = ({
  address,
  setAddresses,
}: {
  address: string;
  setAddresses: AnyFunction;
}) => {
  const { setStatus } = useOverlay();

  const handleRemoveAddress = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address
          ? {
              address: a.address,
              index: a.index,
              isImported: false,
            }
          : a
      );

      localStorage.setItem('vault_addresses', JSON.stringify(newAddresses));

      return newAddresses;
    });

    // Send address data to main window.
    ConfigRenderer.portImport.postMessage({
      task: 'address:remove',
      data: {
        address,
        chainId: getAddressChainId(address),
      },
    });

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
        <ButtonMono
          text="Remove Account"
          onClick={() => handleRemoveAddress()}
        />
      </div>
    </ConfirmWrapper>
  );
};
