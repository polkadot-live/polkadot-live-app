// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as Style from '@polkadot-live/ui/styles';
import * as UI from '@polkadot-live/ui/components';

import { ActionBtn, EncodedAddressesWrapper } from './Wrappers';
import { DialogShowAddress } from './DialogShowAddress';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { ellipsisFn } from '@w3ux/utils';
import { useState } from 'react';
import { useConnections } from '@ren/contexts/common';
import {
  useAccountStatuses,
  useAddHandler,
  useRemoveHandler,
} from '@ren/contexts/import';

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

interface DialogManageAccountsProps {
  genericAccount: ImportedGenericAccount;
}

export const DialogManageAccounts = ({
  genericAccount,
}: DialogManageAccountsProps) => {
  const { encodedAccounts, source } = genericAccount;

  const { getStatusForAccount } = useAccountStatuses();
  const { handleAddAddress, handleBookmarkToggle } = useAddHandler();
  const { handleRemoveAddress } = useRemoveHandler();
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isConnected = getOnlineMode();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const isProcessing = ({ address, chainId }: EncodedAccount) =>
    Boolean(getStatusForAccount(`${chainId}:${address}`, source));

  const handleAddSubscriptions = async (encodedAccount: EncodedAccount) => {
    await handleAddAddress(encodedAccount, genericAccount);
  };

  const handleRemoveSubscriptions = async (encodedAccount: EncodedAccount) => {
    await handleRemoveAddress(encodedAccount, genericAccount);
  };

  const handleBookmarkClick = async (encodedAccount: EncodedAccount) => {
    await handleBookmarkToggle(encodedAccount, genericAccount);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Style.DialogTrigger $theme={theme}>
        <div className="ManageBtn">
          <Style.FlexRow $gap={'0.5rem'}>
            <FontAwesomeIcon icon={FA.faCaretRight} />
            <span>Manage Accounts</span>
          </Style.FlexRow>
        </div>
      </Style.DialogTrigger>

      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />
        <Style.DialogContent $theme={theme} $size={'lg'}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <Style.FlexColumn $rowGap={'1.5rem'}>
            <Style.FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Manage Accounts
              </Dialog.Title>
              <Dialog.Description className="Dialog__Description">
                Subscribe to networks and bookmark accounts for quick access.
              </Dialog.Description>
            </Style.FlexColumn>

            <span
              style={{
                borderTop: `1px solid ${theme.textColorSecondary}`,
                opacity: '0.1',
              }}
            />

            {/*  Encoded addresses */}
            <EncodedAddressesWrapper $theme={theme}>
              <Style.FlexColumn $rowGap={'2px'}>
                {Array.from(Object.entries(encodedAccounts)).map(
                  ([cid, a], i) => (
                    <Style.FlexRow
                      key={`${cid}-encoded-${i}`}
                      className="EncodedRow"
                    >
                      <Style.FlexRow $gap="1.25rem" className="NameAddressRow">
                        <FontAwesomeIcon
                          icon={FA.faCaretRight}
                          transform={'grow-2'}
                          className="EntryArrow"
                        />
                        <span className="Overflow">{a.alias}</span>
                        <Style.FlexRow $gap="0.45rem" className="AddressRow">
                          <span className="Overflow">
                            {ellipsisFn(a.address, 5, 'end')}
                          </span>
                          <UI.CopyButton
                            iconFontSize="0.96rem"
                            theme={theme}
                            onCopyClick={async () =>
                              await window.myAPI.copyToClipboard(a.address)
                            }
                          />
                          <DialogShowAddress address={a.address} />
                        </Style.FlexRow>

                        <Style.FlexRow className="NetworkRow">
                          <span className="Overflow NetworkLabel">
                            {a.chainId}
                          </span>
                          <UI.ChainIcon
                            chainId={cid as ChainID}
                            className="NetworkIcon"
                            style={{
                              fill: [
                                'Polkadot',
                                'Polkadot Asset Hub',
                                'Polkadot People',
                              ].includes(cid)
                                ? '#ac2461'
                                : [
                                      'Kusama',
                                      'Kusama Asset Hub',
                                      'Kusama People',
                                    ].includes(cid)
                                  ? 'rgb(133, 113, 177)'
                                  : undefined,
                            }}
                          />
                        </Style.FlexRow>
                      </Style.FlexRow>

                      {/* Manage buttons */}
                      <Style.FlexRow $gap={'0.75rem'}>
                        {a.isImported && !isProcessing(a) ? (
                          <UI.TooltipRx
                            text={'Remove Subscriptions'}
                            theme={theme}
                          >
                            <div style={{ position: 'relative' }}>
                              <ActionBtn
                                $theme={theme}
                                onClick={async () =>
                                  await handleRemoveSubscriptions(a)
                                }
                              >
                                <FontAwesomeIcon icon={FA.faMinus} />
                              </ActionBtn>
                            </div>
                          </UI.TooltipRx>
                        ) : (
                          <div>
                            {isProcessing(a) ? (
                              <div style={{ position: 'relative' }}>
                                <ActionBtn
                                  disabled={!isConnected}
                                  $theme={theme}
                                >
                                  <UI.EllipsisSpinner
                                    style={{ top: '8px', left: 0 }}
                                  />
                                </ActionBtn>
                              </div>
                            ) : (
                              <Style.FlexRow $gap={'0.5rem'}>
                                <UI.TooltipRx
                                  text={
                                    isConnected
                                      ? 'Add Subscriptions'
                                      : 'Currently Offline'
                                  }
                                  theme={theme}
                                >
                                  <div style={{ position: 'relative' }}>
                                    <ActionBtn
                                      onClick={async () =>
                                        await handleAddSubscriptions(a)
                                      }
                                      $theme={theme}
                                    >
                                      <FontAwesomeIcon icon={FA.faPlus} />
                                    </ActionBtn>
                                  </div>
                                </UI.TooltipRx>
                              </Style.FlexRow>
                            )}
                          </div>
                        )}
                      </Style.FlexRow>

                      <UI.TooltipRx text={'Bookmark'} theme={theme}>
                        <ActionBtn
                          $theme={theme}
                          onClick={async () => await handleBookmarkClick(a)}
                        >
                          <FontAwesomeIcon
                            icon={a.isBookmarked ? FA.faBookmark : faBookmark}
                            transform={'shrink-2'}
                          />
                        </ActionBtn>
                      </UI.TooltipRx>
                    </Style.FlexRow>
                  )
                )}
              </Style.FlexColumn>
            </EncodedAddressesWrapper>
            <Style.FlexRow style={{ justifyContent: 'end' }}>
              <Dialog.Close
                className="Dialog__Button"
                style={{ minWidth: '150px' }}
              >
                Close
              </Dialog.Close>
            </Style.FlexRow>
          </Style.FlexColumn>
        </Style.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
