// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faPlus,
  faMinus,
  faTrash,
  faPenSquare,
  faCaretRight,
} from '@fortawesome/free-solid-svg-icons';
import { ellipsisFn } from '@w3ux/utils';
import { EllipsisSpinner } from '../../Spinners';
import { ButtonMono } from '../../../kits/Buttons';
import { HardwareAddressWrapper } from './Wrapper';
import { TooltipRx } from '../../TooltipRx';
import { FlexColumn, FlexRow } from '../../../styles';
import { ChainIcon } from '../../ChainIcon';
import { CopyButton } from '../../CopyButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ChainID } from '@polkadot-live/types/chains';
import type { HardwareAddressProps } from './types';

export const HardwareAddress = ({
  genericAccount,
  isConnected,
  anyProcessing,
  theme,
  DialogShowAddress,
  DialogManageAccounts,
  isProcessing,
  openConfirmHandler,
  openRemoveHandler,
  openDeleteHandler,
  onClipboardCopy,
  setIsDialogOpen,
}: HardwareAddressProps) => {
  const { accountName, encodedAccounts } = genericAccount;

  return (
    <HardwareAddressWrapper style={{ paddingBottom: '1.5rem' }}>
      {/* Account name */}
      <FlexRow $gap={'0.9rem'} className="PrimaryRow">
        <h2 className="overflow">{accountName}</h2>
        <div style={{ flex: 1 }}>
          <TooltipRx text={'Rename Accounts'} theme={theme}>
            <button
              type="button"
              className="RenameBtn"
              disabled={anyProcessing}
              aria-label="Rename Accounts"
            >
              <FontAwesomeIcon
                icon={faPenSquare}
                onClick={() =>
                  !anyProcessing && setIsDialogOpen(genericAccount, true)
                }
                transform={'grow-1'}
              />
            </button>
          </TooltipRx>
        </div>

        <FlexRow $gap={'0.25rem'}>
          <DialogManageAccounts genericAccount={genericAccount} />
        </FlexRow>

        {/* Account buttons */}
        <FlexRow $gap={'0.75rem'}>
          <TooltipRx text={'Delete'} theme={theme}>
            <div style={{ position: 'relative' }}>
              <ButtonMono
                disabled={anyProcessing}
                className="action-btn white-hover"
                iconLeft={faTrash}
                iconTransform="shrink-2"
                text={''}
                onClick={() => openDeleteHandler()}
              />
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

        {Array.from(Object.entries(encodedAccounts)).map(([cid, a], i) => (
          <FlexRow
            $gap={'1.25rem'}
            key={`${cid}-encoded-${i}`}
            className="EncodedRow"
          >
            <FlexRow $gap="1.25rem" className="NameAddressRow">
              <FontAwesomeIcon
                icon={faCaretRight}
                transform={'grow-2'}
                className="EntryArrow"
              />
              <span className="overflow">{a.alias}</span>
              <FlexRow $gap="0.6rem" className="AddressRow">
                <span className="overflow">{ellipsisFn(a.address, 5)}</span>
                <CopyButton
                  iconFontSize="0.96rem"
                  theme={theme}
                  onCopyClick={async () => await onClipboardCopy(a.address)}
                />
                <DialogShowAddress address={a.address} />
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
                    <ButtonMono
                      className="action-btn white-hover"
                      iconLeft={faMinus}
                      iconTransform={'grow-0'}
                      text={''}
                      onClick={() => openRemoveHandler(a)}
                    />
                  </div>
                </TooltipRx>
              ) : (
                <div>
                  {isProcessing(a) ? (
                    <div style={{ position: 'relative' }}>
                      <ButtonMono
                        disabled={!isConnected}
                        iconLeft={faPlus}
                        iconTransform="grow-0"
                        text={''}
                        className={'action-btn processing'}
                      />
                      <EllipsisSpinner style={{ top: '8px' }} />
                    </div>
                  ) : (
                    <TooltipRx
                      text={
                        isConnected ? 'Add Subscriptions' : 'Currently Offline'
                      }
                      theme={theme}
                    >
                      <div style={{ position: 'relative' }}>
                        <ButtonMono
                          disabled={!isConnected}
                          iconLeft={faPlus}
                          iconTransform="grow-0"
                          text={''}
                          onClick={() => openConfirmHandler(a)}
                          className={'action-btn white-hover'}
                        />
                      </div>
                    </TooltipRx>
                  )}
                </div>
              )}
            </FlexRow>
          </FlexRow>
        ))}
      </FlexColumn>
    </HardwareAddressWrapper>
  );
};
