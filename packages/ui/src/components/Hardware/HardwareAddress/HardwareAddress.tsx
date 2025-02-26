// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
import { Identicon } from '../../Identicon';
import { EllipsisSpinner } from '../../Spinners';
import { ButtonMono } from '../../../kits/Buttons';
import { validateAccountName } from '../../../utils';
import { HardwareAddressWrapper } from './Wrapper';
import type { FormEvent } from 'react';
import type { HardwareAddressProps } from './types';
import { TooltipRx } from '../../TooltipRx';

export const HardwareAddress = ({
  address,
  accountName,
  ChainIcon,
  isConnected,
  isImported,
  processingStatus,
  theme,
  renameHandler,
  openConfirmHandler,
  openRemoveHandler,
  openDeleteHandler,
  onRenameError,
  onRenameSuccess,
}: HardwareAddressProps) => {
  // Store whether this address is being edited.
  const [editing, setEditing] = useState<boolean>(false);

  // Store the currently edited name and validation errors flag.
  const [editName, setEditName] = useState<string>(accountName);

  // Cancel button clicked for edit input.
  const cancelEditing = () => {
    setEditing(false);
    setEditName(accountName);
  };

  // Validate input and rename account.
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
    renameHandler(address, trimmed).then(() => {
      setEditName(trimmed);
      setEditing(false);
    });
  };

  // Input change handler.
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

  // Function to render a chain icon.
  const renderChainIcon = () => (
    <ChainIcon className={editing ? 'chain-icon' : 'chain-icon fade'} />
  );

  // Utility to get processing status.
  const isProcessing = () => processingStatus || false;

  return (
    <HardwareAddressWrapper>
      <div className="content">
        <div className="inner">
          <TooltipRx text={ellipsisFn(address, 12)} side="right" theme={theme}>
            <div className="identicon">
              <Identicon value={address} />
            </div>
          </TooltipRx>
          <div>
            <section>
              <div className="input-wrapper">
                {renderChainIcon()}
                <input
                  style={{
                    borderColor: editing
                      ? 'var(--border-mid-color)'
                      : 'var(--background-primary)',
                  }}
                  type="text"
                  disabled={isProcessing()}
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

                {editing && !isProcessing() && (
                  <div className="edit">
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
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Account buttons */}
      <div className="action">
        {isImported && !isProcessing() ? (
          <TooltipRx text={'Remove From Main Window'} theme={theme}>
            <div style={{ position: 'relative' }}>
              <ButtonMono
                className="account-action-btn white-hover"
                iconLeft={faMinus}
                iconTransform={'grow-0'}
                text={''}
                onClick={() => openRemoveHandler()}
              />
            </div>
          </TooltipRx>
        ) : (
          <div>
            {isProcessing() ? (
              <div style={{ position: 'relative' }}>
                <ButtonMono
                  disabled={!isConnected}
                  iconLeft={faPlus}
                  iconTransform="grow-0"
                  text={''}
                  className={'account-action-btn processing'}
                />
                <EllipsisSpinner style={{ top: '8px' }} />
              </div>
            ) : (
              <TooltipRx
                text={isConnected ? 'Add To Main Window' : 'Currently Offline'}
                theme={theme}
              >
                <div style={{ position: 'relative' }}>
                  <ButtonMono
                    disabled={!isConnected}
                    iconLeft={faPlus}
                    iconTransform="grow-0"
                    text={''}
                    onClick={() => openConfirmHandler()}
                    className={'account-action-btn white-hover'}
                  />
                </div>
              </TooltipRx>
            )}
          </div>
        )}
        <TooltipRx text={'Delete'} theme={theme}>
          <div style={{ position: 'relative' }}>
            <ButtonMono
              disabled={isProcessing()}
              className="account-action-btn white-hover"
              iconLeft={faTrash}
              iconTransform="shrink-2"
              text={''}
              onClick={() => openDeleteHandler()}
            />
          </div>
        </TooltipRx>
      </div>
    </HardwareAddressWrapper>
  );
};
