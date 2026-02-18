// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useConnections,
  useDialogControl,
  useRenameHandler,
} from '@polkadot-live/contexts';
import {
  DialogContent,
  DialogHr,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/styles';
import { renderToast, TooltipRx } from '@polkadot-live/ui';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { unescape } from '@w3ux/utils';
import { useEffect, useState } from 'react';
import { NetworkLabel } from './NetworkLabel';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FormEvent } from 'react';
import type { DialogBulkRenameProps } from './types';

export const DialogBulkRename = ({ genericAccount }: DialogBulkRenameProps) => {
  const { accountName, encodedAccounts } = genericAccount;
  const { getTheme } = useConnections();
  const { renameHandler, validateNameInput } = useRenameHandler();
  const { getBulkRenameDialogData, setBulkRenameDialogData } =
    useDialogControl();

  const theme = getTheme();
  const [inputVal, setInputVal] = useState<string>(accountName);

  const getNameData = (): [ChainID, string][] =>
    Object.values(encodedAccounts).map(({ alias, chainId }) => [
      chainId,
      alias,
    ]);

  const [encodedNames, setEncodedNames] = useState(new Map([...getNameData()]));

  /**
   * Sync names after data import or encoded accounts change.
   */
  useEffect(() => {
    setEncodedNames(new Map([...getNameData()]));
  }, [genericAccount.encodedAccounts]);

  /**
   * Cancel button clicked for edit input.
   */
  const cancelEditing = () => {
    setInputVal(accountName);
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
    if (!validateNameInput(trimmed)) {
      return;
    }

    // Success alert and rename account.
    renderToast('Account name updated.', `toast-${trimmed}`, 'success');
    const updatedAccount: ImportedGenericAccount = { ...genericAccount };
    updatedAccount.accountName = trimmed;

    renameHandler(updatedAccount, genericAccount).then(() => {
      setInputVal(trimmed);
      setBulkRenameDialogData({ genericAccount: updatedAccount, isOpen: true });
    });
  };

  /**
   * Rename an encoded account.
   */
  const commitEncodedRename = (chainId: ChainID) => {
    const trimmed = (encodedNames.get(chainId) || '').trim();
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
      setEncodedNames((prev) => new Map(prev).set(chainId, trimmed));
      setBulkRenameDialogData({ genericAccount: updatedAccount, isOpen: true });
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
  const handleOpenChange = (open: boolean) =>
    open
      ? setBulkRenameDialogData({ genericAccount, isOpen: open })
      : setBulkRenameDialogData({ genericAccount: null, isOpen: open });

  /**
   * Handle encoded change.
   */
  const handleEncodedChange = (
    e: FormEvent<HTMLInputElement>,
    chainId: ChainID,
  ) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEncodedNames((prev) => new Map(prev).set(chainId, val));
  };

  /**
   * Set encoded account to current name.
   */
  const resetEncodedEditing = (chainId: ChainID) => {
    setEncodedNames((prev) =>
      new Map(prev).set(chainId, encodedAccounts[chainId].alias),
    );
  };

  return (
    <Dialog.Root
      open={getBulkRenameDialogData().isOpen}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />
        <DialogContent $theme={theme} $size={'lg'}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Rename Accounts
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Choose a primary account name and assign names to your chain
                accounts.
              </Dialog.Description>
            </FlexColumn>

            <DialogHr $theme={theme} />
            <FlexColumn $rowGap={'0.75rem'}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  commitEdit();
                }}
              >
                <FlexRow style={{ marginTop: '0.75rem' }}>
                  <NetworkLabel
                    hideIcon={true}
                    htmlFor="refId"
                    text="Primary Name"
                    theme={theme}
                    labelStyle={{ fontSize: '1.1rem', fontWeight: '600' }}
                    wrapperStyle={{ minWidth: '140px' }}
                  />
                  <FlexRow
                    className="Dialog__FieldSet"
                    style={{ padding: '0.25rem 1.25rem' }}
                  >
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

              {/* Encoded Accounts */}
              {Array.from(Object.values(encodedAccounts)).map(
                ({ address, alias, chainId }, i) => (
                  <form
                    key={`${chainId}-${address}-${i}`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitEncodedRename(chainId);
                    }}
                  >
                    <FlexRow>
                      <NetworkLabel
                        hideIcon={true}
                        chainId={chainId}
                        htmlFor={`input-${chainId}`}
                        text={chainId}
                        theme={theme}
                        wrapperStyle={{ minWidth: '140px' }}
                      />
                      <FlexRow
                        className="Dialog__FieldSet"
                        style={{ padding: '0.25rem 1.25rem' }}
                      >
                        <input
                          value={encodedNames.get(chainId) || ''}
                          onChange={(e) => handleEncodedChange(e, chainId)}
                          className="Dialog__Input"
                          id={`input-${chainId}`}
                          placeholder="Account Name"
                        />
                      </FlexRow>
                      <FlexRow style={{ justifyContent: 'flex-end' }}>
                        <TooltipRx text={'Reset'} theme={theme}>
                          <button
                            type="button"
                            className="Dialog__Button"
                            disabled={encodedNames.get(chainId) === alias}
                            onClick={() => resetEncodedEditing(chainId)}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </TooltipRx>
                        <TooltipRx text={'Apply'} theme={theme}>
                          <button
                            type="submit"
                            className="Dialog__Button"
                            disabled={encodedNames.get(chainId) === alias}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        </TooltipRx>
                      </FlexRow>
                    </FlexRow>
                  </form>
                ),
              )}
            </FlexColumn>

            <FlexRow style={{ justifyContent: 'end' }}>
              <Dialog.Close
                className="Dialog__Button"
                style={{ minWidth: '150px' }}
              >
                Close
              </Dialog.Close>
            </FlexRow>
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
