// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import { DialogContent, FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useConnections } from '@ren/contexts/common';
import { useRenameHandler } from '@ren/contexts/import';
import { useEffect, useState } from 'react';
import { renderToast } from '@polkadot-live/ui/utils';
import { ChainIcon, TooltipRx } from '@polkadot-live/ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { unescape } from '@w3ux/utils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FormEvent } from 'react';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';
import styled from 'styled-components';

interface DialogRenameProps {
  genericAccount: ImportedGenericAccount;
}

const NetworkLabelWrapper = styled(FlexRow)`
  min-width: 140px;
  .Label {
    font-size: 1rem;
    text-align: left;
  }
  .IconWrapper {
    min-width: 15px;
    width: 15px;
    height: 15px;
  }
  @media (max-width: 500px) {
    min-width: 15px !important;
    .Label {
      display: none;
    }
  }
`;

const FormLabel = ({
  htmlFor,
  text,
  theme,
  chainId,
  style,
}: {
  htmlFor: string;
  text: string;
  theme: AnyData;
  chainId?: ChainID;
  style?: React.CSSProperties;
}) => (
  <NetworkLabelWrapper $gap={'0.75rem'} style={{ minWidth: '140px' }}>
    {chainId && (
      <div className="IconWrapper">
        <ChainIcon
          chainId={chainId as ChainID}
          style={{
            fill: [
              'Polkadot',
              'Polkadot Asset Hub',
              'Polkadot People',
            ].includes(chainId)
              ? '#ac2461'
              : ['Kusama', 'Kusama Asset Hub', 'Kusama People'].includes(
                    chainId
                  )
                ? 'rgb(133, 113, 177)'
                : undefined,
          }}
        />
      </div>
    )}
    <label
      className="Label"
      htmlFor={htmlFor}
      style={{ color: theme.textColorSecondary, ...style }}
    >
      {text}
    </label>
  </NetworkLabelWrapper>
);

export const DialogRename = ({ genericAccount }: DialogRenameProps) => {
  const { accountName, encodedAccounts } = genericAccount;

  const { getTheme } = useConnections();
  const { isDialogOpen, renameHandler, setIsDialogOpen, validateNameInput } =
    useRenameHandler();

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
    setIsDialogOpen(genericAccount, open);
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
    <Dialog.Root
      open={isDialogOpen(genericAccount)}
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

            <span
              style={{
                marginTop: '0.6rem',
                borderBottom: `1px solid ${theme.textDimmed}`,
                opacity: '0.25',
              }}
            ></span>

            <FlexColumn $rowGap={'0.75rem'}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  commitEdit();
                }}
              >
                <FlexRow style={{ marginTop: '0.75rem' }}>
                  <FormLabel
                    style={{ fontSize: '1.1rem', fontWeight: '600' }}
                    htmlFor="refId"
                    text="Primary Name"
                    theme={theme}
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
                      <FormLabel
                        chainId={chainId}
                        htmlFor={`input-${chainId}`}
                        text={chainId}
                        theme={theme}
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
                )
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
