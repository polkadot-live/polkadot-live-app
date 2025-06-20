// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import {
  DialogContent,
  DialogTrigger,
  FlexColumn,
  FlexRow,
} from '@polkadot-live/ui/styles';
import { postRenameAccount, renameAccountInStore } from '@polkadot-live/core';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections } from '@ren/contexts/common';
import { useAddresses } from '@ren/contexts/import';
import { useState } from 'react';
import { renderToast, validateAccountName } from '@polkadot-live/ui/utils';
import { TooltipRx } from '@polkadot-live/ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faPenToSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { unescape } from '@w3ux/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FormEvent } from 'react';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';

interface DialogRenameProps {
  genericAccount: ImportedGenericAccount;
}

const FormLabel = ({
  htmlFor,
  text,
  theme,
}: {
  htmlFor: string;
  text: string;
  theme: AnyData;
}) => (
  <label
    className="Dialog__Label"
    style={{
      color: theme.textColorSecondary,
      fontSize: '1rem',
      textAlign: 'left',
      paddingLeft: '0.25rem',
    }}
    htmlFor={htmlFor}
  >
    {text}
  </label>
);

export const DialogRename = ({ genericAccount }: DialogRenameProps) => {
  const { accountName, encodedAccounts } = genericAccount;
  const { handleAddressImport, isUniqueAccountName } = useAddresses();
  const { getTheme } = useConnections();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>(accountName);
  const theme = getTheme();

  const nameData: [ChainID, string][] = Object.values(encodedAccounts).map(
    ({ alias, chainId }) => [chainId, alias]
  );
  const [encodedNames, setEncodedNames] = useState(new Map([...nameData]));

  /**
   * Cancel button clicked for edit input.
   */
  const cancelEditing = () => {
    setInputVal(accountName);
  };

  /**
   * Validate account name input.
   */
  const validateNameInput = (trimmed: string): boolean => {
    // Handle validation failure.
    if (!validateAccountName(trimmed)) {
      renderToast('Bad account name.', `toast-${trimmed}`, 'error');
      return false;
    }

    // Handle duplicate account name.
    if (!isUniqueAccountName(trimmed)) {
      renderToast(
        'Account name is already in use.',
        `toast-${trimmed}`,
        'error'
      );
      return false;
    }

    return true;
  };

  /**
   * Rename handler for generic and encoded accounts.
   */
  const renameHandler = async (updatedAccount: ImportedGenericAccount) => {
    await renameAccountInStore(updatedAccount);

    // Update encoded account names in main renderer.
    const { encodedAccounts: updatedEncoded } = updatedAccount;
    for (const encodedAccount of Object.values(updatedEncoded)) {
      const { chainId, alias } = encodedAccount;
      if (alias !== genericAccount.encodedAccounts[chainId].alias) {
        postRenameAccount(encodedAccount);
      }
    }

    // Update import window address state
    handleAddressImport(updatedAccount);
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

    renameHandler(updatedAccount).then(() => {
      setInputVal(trimmed);
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

    renameHandler(updatedAccount).then(() => {
      setEncodedNames((prev) => new Map(prev).set(chainId, trimmed));
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

  /**
   * Handle encoded change.
   */
  const handleEncodedChange = (
    e: FormEvent<HTMLInputElement>,
    chainId: ChainID
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
      new Map(prev).set(chainId, encodedAccounts[chainId].alias)
    );
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger $theme={theme}>
        <FlexRow $gap={'0.75rem'} className="btn-text">
          <TooltipRx theme={theme} text={'Rename Accounts'}>
            <FontAwesomeIcon icon={faPenToSquare} transform={'shrink-2'} />
          </TooltipRx>
        </FlexRow>
      </DialogTrigger>
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent
          $theme={theme}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <FlexColumn $rowGap={'1.5rem'}>
            <FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Rename Accounts
              </Dialog.Title>
            </FlexColumn>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                commitEdit();
              }}
            >
              <FlexColumn style={{ marginTop: '0.75rem' }}>
                <FlexColumn $rowGap={'0.75rem'}>
                  <FormLabel
                    htmlFor="refId"
                    text="Primary Name"
                    theme={theme}
                  />
                  <FlexRow>
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
                    <FlexRow
                      $gap={'0.5rem'}
                      style={{ justifyContent: 'flex-end' }}
                    >
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
                </FlexColumn>
              </FlexColumn>
            </form>

            <span
              style={{
                marginTop: '0.6rem',
                borderBottom: `1px solid ${theme.textDimmed}`,
                opacity: '0.25',
              }}
            ></span>

            {/* Encoded Accounts */}
            {Array.from(Object.values(encodedAccounts)).map(
              ({ address, alias, chainId }) => (
                <form
                  key={address}
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitEncodedRename(chainId);
                  }}
                >
                  <FlexColumn>
                    <FlexColumn $rowGap={'0.75rem'}>
                      <FormLabel
                        htmlFor={`input-${chainId}`}
                        text={chainId}
                        theme={theme}
                      />
                      <FlexRow>
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
                        <FlexRow
                          $gap={'0.5rem'}
                          style={{ justifyContent: 'flex-end' }}
                        >
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
                    </FlexColumn>
                  </FlexColumn>
                </form>
              )
            )}
          </FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
