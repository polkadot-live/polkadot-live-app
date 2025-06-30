// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { DialogContent, FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useRenameHandler } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useEffect, useState } from 'react';
import { TooltipRx } from '@polkadot-live/ui/components';
import { NetworkLabel } from './NetworkLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { renderToast } from '@polkadot-live/ui/utils';
import { unescape } from '@w3ux/utils';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';
import type { FormEvent } from 'react';

export const DialogRename = () => {
  const {
    getRenameDialogData,
    renameHandler,
    setRenameDialogData,
    validateNameInput,
  } = useRenameHandler();

  const { getTheme } = useConnections();
  const theme = getTheme();
  const { encodedAccount, genericAccount } = getRenameDialogData();

  const accountName = encodedAccount?.alias || '';
  const [inputVal, setInputVal] = useState(encodedAccount?.alias || '');

  const handleOpenChange = (open: boolean) => {
    setRenameDialogData({ encodedAccount, genericAccount, isOpen: open });
  };

  useEffect(() => {
    if (encodedAccount) {
      setInputVal(encodedAccount.alias);
    }
  }, [encodedAccount]);

  /**
   * Cancel button clicked for edit input.
   */
  const cancelEditing = () => {
    setInputVal(accountName);
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
   * Validate input and rename account.
   */
  const commitEdit = () => {
    if (!(genericAccount && encodedAccount)) {
      return;
    }

    const { chainId } = encodedAccount;
    const trimmed = inputVal.trim();
    if (trimmed === genericAccount.encodedAccounts[chainId].alias) {
      return;
    }

    // Handle validation failure.
    if (!validateNameInput(trimmed)) {
      return;
    }

    // Success alert and rename account.
    renderToast('Account name updated.', `toast-${trimmed}`, 'success');

    const clone = structuredClone(genericAccount.encodedAccounts);
    const updatedAccount: ImportedGenericAccount = {
      ...genericAccount,
      encodedAccounts: clone,
    };
    updatedAccount.encodedAccounts[chainId].alias = trimmed;

    renameHandler(updatedAccount, genericAccount).then(() => {
      setInputVal(trimmed);
      setRenameDialogData({
        encodedAccount: updatedAccount.encodedAccounts[chainId],
        genericAccount,
        isOpen: true,
      });
    });
  };

  return (
    <Dialog.Root
      open={getRenameDialogData().isOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />
        <DialogContent $theme={theme} $size={'sm'}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Rename Account
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Set a new account name.
              </Dialog.Description>
            </FlexColumn>

            <span
              style={{
                marginTop: '0.6rem',
                borderBottom: `1px solid ${theme.textDimmed}`,
                opacity: '0.25',
              }}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                commitEdit();
              }}
            >
              <FlexRow style={{ marginTop: '0.75rem' }}>
                <NetworkLabel
                  chainId={encodedAccount?.chainId}
                  htmlFor="refId"
                  text={encodedAccount?.chainId || ''}
                  theme={theme}
                  wrapperStyle={{ minWidth: 0 }}
                />
              </FlexRow>
              <FlexRow style={{ marginTop: '0.75rem' }}>
                <FlexRow className="Dialog__FieldSet">
                  <input
                    value={inputVal}
                    onChange={handleChange}
                    className="Dialog__Input"
                    id="refId"
                    placeholder="Account Name"
                  />
                </FlexRow>
                <FlexRow style={{ justifyContent: 'flex-end' }}>
                  <TooltipRx text={'Reset'} theme={theme}>
                    <button
                      type="button"
                      className="Dialog__Button"
                      disabled={accountName === inputVal}
                      onClick={() => cancelEditing()}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </TooltipRx>
                  <TooltipRx text={'Apply'} theme={theme}>
                    <button
                      type="submit"
                      className="Dialog__Button"
                      disabled={accountName === inputVal}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  </TooltipRx>
                </FlexRow>
              </FlexRow>
            </form>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
