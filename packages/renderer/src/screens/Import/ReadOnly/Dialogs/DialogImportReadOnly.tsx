// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useAddresses, useImportHandler } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useState } from 'react';
import { checkAddress } from '@polkadot/util-crypto';
import { decodeAddress, u8aToHex } from 'dedot/utils';
import {
  DialogContent,
  DialogTrigger,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/ui/styles';
import { faAngleRight, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSupportedChains } from '@polkadot-live/consts/chains';
import { renderToast } from '@polkadot-live/ui/utils';
import { ellipsisFn, unescape } from '@w3ux/utils';

export const DialogImportReadOnly = () => {
  const { isAlreadyImported } = useAddresses();
  const { getTheme } = useConnections();
  const { handleImportAddress } = useImportHandler();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  const theme = getTheme();

  /**
   * Handle import click.
   */
  const onImportClick = async () => {
    const trimmed = inputVal.trim();
    const isValid = isInputValid(trimmed);

    // Validate address.
    if (!isValid) {
      renderToast('Invalid Address.', `toast-${trimmed}`, 'error');
      return;
    }

    // Check if public key is already imported.
    const publicKeyHex = u8aToHex(decodeAddress(trimmed));
    if (isAlreadyImported(publicKeyHex)) {
      renderToast('Address is already imported.', `toast-${trimmed}`, 'error');
      return;
    }

    // Handle valid address input.
    setInputVal('');
    setDialogOpen(false);

    // Set processing flag to true if online and import via main renderer.
    const accountName = ellipsisFn(publicKeyHex, 5);
    await handleImportAddress(trimmed, 'read-only', accountName, true);
  };

  /**
   * Handle input change.
   */
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val = event.target.value;
    val = unescape(val);
    setInputVal(val);
  };

  /**
   * Reset input when dialog closed.
   */
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInputVal('');
    }
  };

  /**
   * Validate input field.
   */
  const isInputValid = (address: string): boolean => {
    for (const { prefix } of Object.values(getSupportedChains())) {
      const result = checkAddress(address, prefix);

      if (result !== null) {
        const [isValid] = result;

        if (isValid) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger $theme={theme}>
        <FlexRow $gap={'0.75rem'} className="btn-text">
          <FontAwesomeIcon icon={faCaretRight} />
          <span>Import</span>
        </FlexRow>
      </DialogTrigger>
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1.5rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Import Read Only Account
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Enter an address from any supported network and click import to
                add a read-only account.
              </Dialog.Description>
            </FlexColumn>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onImportClick();
              }}
            >
              <FlexRow $gap={'1rem'}>
                <FlexRow className="Dialog__FieldSet">
                  <label className="Dialog__Label" htmlFor="refId">
                    <FontAwesomeIcon icon={faAngleRight} />
                  </label>
                  <input
                    value={inputVal || ''}
                    onChange={onInputChange}
                    className="Dialog__Input"
                    id="refId"
                    placeholder="Input Address"
                  />
                </FlexRow>
                <button
                  type="submit"
                  className="Dialog__Button"
                  disabled={false}
                >
                  Import
                </button>
              </FlexRow>
            </form>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
