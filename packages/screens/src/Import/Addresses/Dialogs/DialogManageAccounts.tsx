// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as Style from '@polkadot-live/styles/wrappers';
import * as UI from '@polkadot-live/ui/components';

import {
  useAccountStatuses,
  useAddHandler,
  useConnections,
  useDialogControl,
  useRemoveHandler,
} from '@polkadot-live/contexts';
import { ControlsRow, EncodedAddressesWrapper, ToggleRx } from './Wrappers';
import { Cross2Icon } from '@radix-ui/react-icons';
import { DropdownAccount } from '../Dropdowns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { ellipsisFn } from '@w3ux/utils';
import { useState } from 'react';

import type { ChainID } from '@polkadot-live/types/chains';
import type { DialogManageAccountsProps } from './types';
import type { EncodedAccount } from '@polkadot-live/types/accounts';

export const DialogManageAccounts = ({
  genericAccount,
}: DialogManageAccountsProps) => {
  const { accountName, encodedAccounts, publicKeyHex, source } = genericAccount;
  const { copyToClipboard, getTheme, getOnlineMode } = useConnections();
  const { getStatusForAccount } = useAccountStatuses();
  const { handleAddAddress, handleBookmarkToggle } = useAddHandler();
  const { handleRemoveAddress } = useRemoveHandler();
  const {
    getManageAccountDialogData,
    setManageAccountDialogData,
    setShowAddressDialogData,
  } = useDialogControl();

  const [showBookmarks, setShowBookmarks] = useState(false);
  const theme = getTheme();
  const isConnected = getOnlineMode();

  const handleOpenChange = (open: boolean) =>
    open
      ? setManageAccountDialogData({ genericAccount, isOpen: open })
      : setManageAccountDialogData({ genericAccount: null, isOpen: open });

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
    <Dialog.Root
      open={getManageAccountDialogData().isOpen}
      onOpenChange={handleOpenChange}
    >
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

            <Style.DialogHr $theme={theme} />

            {/** Controls */}
            <ControlsRow $theme={theme}>
              <UI.TooltipRx text="Manage Bookmarks" theme={theme}>
                <span>
                  <ToggleRx
                    $theme={theme}
                    aria-label="Toggle bookmarks"
                    pressed={showBookmarks}
                    onPressedChange={(pressed) => setShowBookmarks(pressed)}
                  >
                    <FontAwesomeIcon
                      icon={showBookmarks ? FA.faBookmark : faBookmark}
                      transform={'shrink-5'}
                    />
                  </ToggleRx>
                </span>
              </UI.TooltipRx>
              <h2>{accountName}</h2>
              <UI.TooltipRx theme={theme} text={'Public Key'}>
                <Style.FlexRow $gap={'0.5rem'} style={{ fontSize: '1rem' }}>
                  <FontAwesomeIcon icon={FA.faKey} transform={'shrink-4'} />
                  <span>{ellipsisFn(publicKeyHex, 5)}</span>
                </Style.FlexRow>
              </UI.TooltipRx>
            </ControlsRow>

            {/** Encoded addresses */}
            <EncodedAddressesWrapper $theme={theme}>
              <Style.FlexColumn $rowGap={'0.75rem'}>
                {Array.from(Object.entries(encodedAccounts)).map(
                  ([cid, a], i) => (
                    <Style.FlexRow key={`${cid}-encoded-${i}`}>
                      {/** Bookmark */}
                      {showBookmarks && (
                        <UI.TooltipRx text={'Bookmark'} theme={theme}>
                          <button
                            className="Dialog__Button"
                            onClick={async () => await handleBookmarkClick(a)}
                          >
                            <FontAwesomeIcon
                              icon={a.isBookmarked ? FA.faBookmark : faBookmark}
                              transform={'shrink-5'}
                            />
                          </button>
                        </UI.TooltipRx>
                      )}

                      <Style.FlexRow className="NetworkRow">
                        <UI.ChainIcon
                          chainId={cid as ChainID}
                          className="NetworkIcon"
                        />
                        <span className="Overflow NetworkLabel">
                          {a.chainId}
                        </span>
                      </Style.FlexRow>

                      <Style.FlexRow className="EncodedRow" style={{ flex: 1 }}>
                        <Style.FlexRow
                          $gap="1.25rem"
                          className="NameAddressRow"
                        >
                          <span className="Overflow">{a.alias}</span>
                          <Style.FlexRow $gap="0.45rem" className="AddressRow">
                            <span className="Overflow">
                              {ellipsisFn(a.address, 5, 'end')}
                            </span>
                            <UI.CopyButton
                              iconFontSize="0.96rem"
                              theme={theme}
                              onCopyClick={async () =>
                                await copyToClipboard(a.address)
                              }
                            />
                            <UI.ViewAddressIcon
                              theme={theme}
                              onClick={() =>
                                setShowAddressDialogData({
                                  address: a.address,
                                  isOpen: true,
                                })
                              }
                            />
                          </Style.FlexRow>
                        </Style.FlexRow>
                      </Style.FlexRow>

                      <Style.FlexRow style={{ justifyContent: 'flex-end' }}>
                        {/* Subscriptions buttons */}
                        {a.isImported && !isProcessing(a) ? (
                          <UI.TooltipRx
                            text={'Remove Subscriptions'}
                            theme={theme}
                          >
                            <div style={{ position: 'relative' }}>
                              <button
                                className="Dialog__Button"
                                onClick={async () =>
                                  await handleRemoveSubscriptions(a)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={FA.faMinus}
                                  transform={'shrink-4'}
                                />
                              </button>
                            </div>
                          </UI.TooltipRx>
                        ) : (
                          <div>
                            {isProcessing(a) ? (
                              <div
                                style={{
                                  position: 'relative',
                                  color: theme.textColorPrimary,
                                }}
                              >
                                <button
                                  className="Dialog__Button"
                                  disabled={!isConnected}
                                >
                                  <FontAwesomeIcon
                                    style={{ opacity: 0 }}
                                    icon={FA.faMinus}
                                    transform={'shrink-4'}
                                  />
                                </button>

                                <UI.EllipsisSpinner
                                  style={{ top: '16px', left: 0 }}
                                />
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
                                    <button
                                      className="Dialog__Button"
                                      onClick={async () =>
                                        await handleAddSubscriptions(a)
                                      }
                                    >
                                      <FontAwesomeIcon
                                        icon={FA.faPlus}
                                        transform={'shrink-4'}
                                      />
                                    </button>
                                  </div>
                                </UI.TooltipRx>
                              </Style.FlexRow>
                            )}
                          </div>
                        )}
                        {/** Dropdown Menu */}
                        <DropdownAccount
                          triggerSize={'lg'}
                          encodedAccount={a}
                          genericAccount={genericAccount}
                          onBookmarkToggle={async (en) =>
                            await handleBookmarkToggle(en, genericAccount)
                          }
                        />
                      </Style.FlexRow>
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
