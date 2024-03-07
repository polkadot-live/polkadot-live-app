// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { getAddressChainId } from '@/renderer/Utils';
import { Config as RendererConfig } from '@/renderer/static/Config';
import type { ConfirmProps } from './types';
import type { LocalAddress } from '@/types/accounts';

export const Confirm = ({
  setAddresses,
  address,
  name,
  source,
}: ConfirmProps) => {
  const { setStatus } = useOverlay();

  const handleImportAddress = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address
          ? {
              address: a.address,
              index: a.index,
              isImported: true,
            }
          : a
      );

      localStorage.setItem('vault_addresses', JSON.stringify(newAddresses));

      return newAddresses;
    });

    // Send address data to main window.
    RendererConfig.portImport.postMessage({
      task: 'address:import',
      data: {
        chainId: getAddressChainId(address),
        source,
        address,
        name,
      },
    });

    setStatus(0);
  };

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
          onClick={() => handleImportAddress()}
        />
      </div>
    </ConfirmWrapper>
  );
};
