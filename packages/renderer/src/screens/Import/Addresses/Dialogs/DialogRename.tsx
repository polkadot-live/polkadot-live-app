// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import {
  DialogContent,
  DialogTrigger,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/ui/styles';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections } from '@ren/contexts/common';
import { useAddresses } from '@ren/contexts/import';
import { useState } from 'react';
import { renderToast, validateAccountName } from '@polkadot-live/ui/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { unescape } from '@w3ux/utils';
import type { FormEvent } from 'react';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';

import { renameAccountInStore } from '@polkadot-live/core';

interface DialogRenameProps {
  genericAccount: ImportedGenericAccount;
}

export const DialogRename = ({ genericAccount }: DialogRenameProps) => {
  const { accountName, publicKeyHex, source } = genericAccount;
  const { handleAddressImport } = useAddresses();
  const { getTheme } = useConnections();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>(accountName);
  const theme = getTheme();

  /**
   * Cancel button clicked for edit input.
   */
  const cancelEditing = () => {
    setInputVal(accountName);
  };

  const renameHandler = async (newName: string) => {
    await renameAccountInStore(publicKeyHex, source, newName);

    // TODO: Apply to encoded accounts.
    // Post message to main renderer to process the account rename.
    //const address = encodeAddress(publicKeyHex, 0); // TMP
    //postRenameAccount(address, newName);

    // Update import window address state
    genericAccount.accountName = newName;
    handleAddressImport(genericAccount);
  };
  /**
   * Validate input and rename account.
   */
  const commitEdit = () => {
    const trimmed = inputVal.trim();
    if (trimmed === accountName) {
      return;
    }

    // Handle validation failure.
    if (!validateAccountName(trimmed)) {
      renderToast('Bad account name.', `toast-${trimmed}`, 'error');
      setInputVal(accountName);
      return;
    }

    // Success alert and rename account.
    renderToast('Account name updated.', `toast-${trimmed}`, 'success');
    renameHandler(trimmed).then(() => {
      setInputVal(trimmed);
    });
  };

  /**
   * Input change handler.
   */
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
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
    } else {
      setInputVal(accountName);
    }
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger $theme={theme}>
        <FlexRow $gap={'0.75rem'} className="btn-text">
          <FontAwesomeIcon icon={faCaretRight} />
          <span>Rename</span>
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
                Rename Account
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Enter a new name for this account.
              </Dialog.Description>
            </FlexColumn>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                commitEdit();
              }}
            >
              <FlexColumn>
                <FlexRow className="Dialog__FieldSet">
                  <label className="Dialog__Label" htmlFor="refId">
                    <FontAwesomeIcon icon={faAngleRight} />
                  </label>
                  <input
                    value={inputVal}
                    onChange={handleChange}
                    className="Dialog__Input"
                    id="refId"
                    placeholder="Account Name"
                  />
                </FlexRow>
                <FlexRow style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="Dialog__Button"
                    disabled={accountName === inputVal}
                    onClick={() => cancelEditing()}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="Dialog__Button"
                    disabled={accountName === inputVal}
                  >
                    Rename
                  </button>
                </FlexRow>
              </FlexColumn>
            </form>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
