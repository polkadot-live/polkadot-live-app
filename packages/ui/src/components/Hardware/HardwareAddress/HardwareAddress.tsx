// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCheck,
  faXmark,
  faPlus,
  faMinus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { ellipsisFn, unescape } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EllipsisSpinner } from '../../Spinners';
import { ButtonMono } from '../../../kits/Buttons';
import { validateAccountName } from '../../../utils';
import { HardwareAddressWrapper } from './Wrapper';
import { TooltipRx } from '../../TooltipRx';
import { FlexColumn, FlexRow } from '../../../styles';
import { ChainIcon } from '../../ChainIcon';
import { CopyButton } from '../../CopyButton';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FormEvent } from 'react';
import type { HardwareAddressProps } from './types';

export const HardwareAddress = ({
  genericAccount,
  isConnected,
  anyProcessing,
  theme,
  DialogRename,
  isProcessing,
  renameHandler,
  openConfirmHandler,
  openRemoveHandler,
  openDeleteHandler,
  onRenameError,
  onRenameSuccess,
  onClipboardCopy,
}: HardwareAddressProps) => {
  const { accountName, encodedAccounts } = genericAccount;

  // Store whether this address is being edited.
  const [editing, setEditing] = useState<boolean>(false);

  // Store the currently edited name and validation errors flag.
  const [editName, setEditName] = useState<string>(accountName);

  // Cancel button clicked for edit input.
  const cancelEditing = () => {
    setEditing(false);
    setEditName(accountName);
  };

  /**
   * Validate input and rename account.
   */
  const commitEdit = () => {
    const trimmed = editName.trim();

    // Return if account name hasn't changed.
    if (trimmed === accountName) {
      setEditing(false);
      return;
    }

    // Handle validation failure.
    if (!validateAccountName(trimmed)) {
      onRenameError('Bad account name.', `toast-${trimmed}`);
      setEditName(accountName);
      setEditing(false);
      return;
    }

    // Render success alert.
    onRenameSuccess('Account name updated.', `toast-${trimmed}`);

    // Otherwise rename account.
    renameHandler(trimmed).then(() => {
      setEditName(trimmed);
      setEditing(false);
    });
  };

  /**
   * Input change handler.
   */
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

  return (
    <HardwareAddressWrapper style={{ paddingBottom: '1.5rem' }}>
      {/* Account name */}
      <FlexRow $gap={'0.75rem'} style={{ width: '100%' }}>
        <div className="input-wrapper">
          <input
            style={{
              borderColor: editing
                ? 'var(--border-mid-color)'
                : 'var(--background-primary)',
            }}
            type="text"
            disabled={anyProcessing}
            value={editing ? editName : accountName}
            onChange={(e) => handleChange(e)}
            onFocus={() => setEditing(true)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                commitEdit();
                e.currentTarget.blur();
              }
            }}
          />

          <DialogRename genericAccount={genericAccount} />

          {editing && !anyProcessing && (
            <FlexRow className="edit">
              <button
                id="commit-btn"
                type="button"
                onPointerDown={() => commitEdit()}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <button type="button" onPointerDown={() => cancelEditing()}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </FlexRow>
          )}
        </div>

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
        {Array.from(Object.entries(encodedAccounts)).map(([cid, a]) => (
          <FlexRow $gap={'1.25rem'} key={`${cid}-encoded`}>
            {/* Chain icon */}
            <ChainIcon
              style={{
                width: '14px',
                height: '14px',
                fill: cid === 'Polkadot' ? '#ac2461' : undefined,
                marginLeft: '1rem',
              }}
              chainId={cid as ChainID}
            />
            <FlexRow $gap="0.6rem" style={{ flex: 1 }}>
              <span>{ellipsisFn(a.address, 12)}</span>
              <CopyButton
                iconFontSize="0.96rem"
                theme={theme}
                onCopyClick={async () => await onClipboardCopy(a.address)}
              />
            </FlexRow>

            {/* Manage buttons */}
            <FlexRow $gap={'0.75rem'}>
              {a.isImported && !isProcessing(a) ? (
                <TooltipRx text={'Remove From Main Window'} theme={theme}>
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
                        isConnected ? 'Add To Main Window' : 'Currently Offline'
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
