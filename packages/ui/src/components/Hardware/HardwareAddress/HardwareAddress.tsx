// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { ellipsisFn } from '@w3ux/utils';
import { EllipsisSpinner } from '../../Spinners';
import { ActionBtn, HardwareAddressWrapper } from './Wrapper';
import { TooltipRx } from '../../TooltipRx';
import { FlexColumn, FlexRow } from '../../../styles';
import { ChainIcon } from '../../ChainIcon';
import { CopyButton } from '../../CopyButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HardwareAddressProps } from './types';

//TMP
import styled from 'styled-components';
const ViewIconWrapper = styled.div`
  .ViewIcon {
    cursor: pointer;
    &:hover {
      color: var(--text-color-primary);
    }
  }
`;

export const HardwareAddress = ({
  genericAccount,
  isConnected,
  anyProcessing,
  theme,
  DropdownAccount,
  isProcessing,
  handleAddSubscriptions,
  handleBookmarkToggle,
  handleManageAccountClick,
  handleRemoveSubscriptions,
  handleShowAddressClick,
  openDeleteHandler,
  onClipboardCopy,
  setBulkRenameDialogData,
}: HardwareAddressProps) => {
  const { accountName, encodedAccounts } = genericAccount;

  const hasBookmarks = (): boolean =>
    Object.values(encodedAccounts)
      .map(({ isBookmarked }) => Boolean(isBookmarked))
      .some(Boolean);

  return (
    <HardwareAddressWrapper style={{ paddingBottom: '1.5rem' }}>
      {/* Account name */}
      <FlexRow $gap={'0.9rem'} className="PrimaryRow">
        <TooltipRx text={'Rename Accounts'} theme={theme}>
          <button
            type="button"
            className="RenameBtn"
            disabled={anyProcessing}
            aria-label="Rename Accounts"
          >
            <FontAwesomeIcon
              icon={FA.faPenSquare}
              onClick={() =>
                !anyProcessing &&
                setBulkRenameDialogData({ genericAccount, isOpen: true })
              }
              transform={'grow-1'}
            />
          </button>
        </TooltipRx>
        <h2 className="overflow">{accountName}</h2>
        <FlexRow $gap={'0.25rem'} style={{ flex: 1, paddingLeft: '0.5rem' }}>
          <div
            role="button"
            onClick={() => handleManageAccountClick()}
            className="ManageBtn"
          >
            <FlexRow $gap={'0.5rem'}>
              <FontAwesomeIcon icon={FA.faCaretRight} />
              <span>Manage</span>
            </FlexRow>
          </div>
        </FlexRow>

        {/* Account buttons */}
        <FlexRow $gap={'0.75rem'}>
          <TooltipRx text={'Delete'} theme={theme}>
            <div style={{ position: 'relative' }}>
              <ActionBtn
                disabled={anyProcessing}
                onClick={() => openDeleteHandler()}
              >
                <FontAwesomeIcon icon={FA.faTrash} transform={'shrink-3'} />
              </ActionBtn>
            </div>
          </TooltipRx>
        </FlexRow>
      </FlexRow>

      {/* Encoded addresses */}
      <FlexColumn $rowGap={'1.25rem'}>
        <span
          style={{
            borderTop: `1px solid ${theme.textDimmed}`,
            opacity: '0.1',
          }}
        />

        {!hasBookmarks() && (
          <FlexRow $gap={'0.5rem'} className="NoBookmarks">
            <FontAwesomeIcon
              icon={FA.faExclamationCircle}
              transform={'shrink-1'}
            />
            <span>No accounts bookmarked.</span>
          </FlexRow>
        )}

        {Array.from(Object.entries(encodedAccounts))
          .filter(([, a]) => Boolean(a.isBookmarked))
          .map(([cid, a], i) => (
            <FlexRow
              $gap={'1.25rem'}
              key={`${cid}-encoded-${i}`}
              className="EncodedRow"
            >
              <FlexRow $gap="1.25rem" className="NameAddressRow">
                <FontAwesomeIcon
                  icon={FA.faCaretRight}
                  transform={'grow-2'}
                  className="EntryArrow"
                />
                <span className="overflow">{a.alias}</span>
                <FlexRow $gap="0.45rem" className="AddressRow">
                  <span className="overflow">
                    {ellipsisFn(a.address, 5, 'end')}
                  </span>
                  <CopyButton
                    iconFontSize="0.96rem"
                    theme={theme}
                    onCopyClick={async () => await onClipboardCopy(a.address)}
                  />
                  <TooltipRx text={'Show Address'} theme={theme}>
                    <ViewIconWrapper onClick={() => handleShowAddressClick(a)}>
                      <FontAwesomeIcon
                        className="ViewIcon"
                        icon={FA.faEye}
                        transform={'shrink-4'}
                      />
                    </ViewIconWrapper>
                  </TooltipRx>
                </FlexRow>

                <FlexRow className="NetworkRow">
                  <span className="overflow NetworkLabel">{a.chainId}</span>
                  <ChainIcon
                    chainId={cid as ChainID}
                    className="NetworkIcon"
                    style={{
                      fill:
                        cid === 'Polkadot' ||
                        cid === 'Polkadot Asset Hub' ||
                        cid === 'Polkadot People'
                          ? '#ac2461'
                          : undefined,
                    }}
                  />
                </FlexRow>
              </FlexRow>

              {/* Manage buttons */}
              <FlexRow $gap={'0.75rem'}>
                {a.isImported && !isProcessing(a) ? (
                  <TooltipRx text={'Remove Subscriptions'} theme={theme}>
                    <div style={{ position: 'relative' }}>
                      <ActionBtn
                        onClick={async () => await handleRemoveSubscriptions(a)}
                      >
                        <FontAwesomeIcon icon={FA.faMinus} />
                      </ActionBtn>
                    </div>
                  </TooltipRx>
                ) : (
                  <div>
                    {isProcessing(a) ? (
                      <div style={{ position: 'relative' }}>
                        <ActionBtn disabled={!isConnected}>
                          <EllipsisSpinner
                            style={{ top: '8px', left: '6px' }}
                          />
                        </ActionBtn>
                      </div>
                    ) : (
                      <TooltipRx
                        text={
                          isConnected
                            ? 'Add Subscriptions'
                            : 'Currently Offline'
                        }
                        theme={theme}
                      >
                        <div style={{ position: 'relative' }}>
                          <ActionBtn
                            disabled={!isConnected}
                            onClick={async () =>
                              await handleAddSubscriptions(a)
                            }
                          >
                            <FontAwesomeIcon icon={FA.faPlus} />
                          </ActionBtn>
                        </div>
                      </TooltipRx>
                    )}
                  </div>
                )}
                <DropdownAccount
                  encodedAccount={a}
                  genericAccount={genericAccount}
                  triggerSize={'sm'}
                  onBookmarkToggle={async (en) =>
                    await handleBookmarkToggle(en)
                  }
                />
              </FlexRow>
            </FlexRow>
          ))}
      </FlexColumn>
    </HardwareAddressWrapper>
  );
};
