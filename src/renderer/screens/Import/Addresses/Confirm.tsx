// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@app/contexts/Overlay';
import { Identicon } from '@app/library/Identicon';
import { ConfirmWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';
import { getAddressChainId } from '@/renderer/Utils';
import { ConfigRenderer } from '@/config/ConfigRenderer';
import type { ConfirmProps } from './types';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export const Confirm = ({
  setAddresses,
  address,
  name,
  source,
}: ConfirmProps) => {
  const { setStatus } = useOverlay();

  // Click handler function.
  const handleImportAddress = () => {
    if (source === 'vault') {
      handleVaultImport();
    } else if (source === 'ledger') {
      handleLedgerImport();
    }

    setStatus(0);
  };

  // Handle a ledger address import.
  const handleLedgerImport = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LedgerLocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: true } : a
      );

      localStorage.setItem('ledger_addresses', JSON.stringify(newAddresses));

      return newAddresses;
    });

    postAddressToMainWindow();
  };

  // Handle a vault address import.
  const handleVaultImport = () => {
    // Update import window's managed address state and local storage.
    setAddresses((prevState: LocalAddress[]) => {
      const newAddresses = prevState.map((a: LocalAddress) =>
        a.address === address ? { ...a, isImported: true } : a
      );

      localStorage.setItem('vault_addresses', JSON.stringify(newAddresses));

      return newAddresses;
    });

    postAddressToMainWindow();
  };

  // Send address data to main window to process.
  const postAddressToMainWindow = () => {
    ConfigRenderer.portImport.postMessage({
      task: 'address:import',
      data: {
        chainId: getAddressChainId(address),
        source,
        address,
        name,
      },
    });
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
