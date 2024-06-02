// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faDownFromDottedLine,
  faEraser,
  faTrash,
} from '@fortawesome/pro-solid-svg-icons';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { chainIcon } from '@/config/chains';
import { unescape } from '@w3ux/utils';
import { Flip, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { validateAccountName } from '@/renderer/utils/ImportUtils';
import { Wrapper } from './Wrapper';
import type { FormEvent } from 'react';
import type { HardwareAddressProps } from './types';
import { getAddressChainId } from '@/renderer/Utils';
import { useConnections } from '@/renderer/contexts/common/Connections';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { ButtonMono } from '@/renderer/kits/Buttons/ButtonMono';

export const HardwareAddress = ({
  address,
  index,
  isImported,
  orderData,
  isProcessing,
  accountName,
  renameHandler,
  openConfirmHandler,
  openRemoveHandler,
  openDeleteHandler,
}: HardwareAddressProps) => {
  // Store whether this address is being edited.
  const [editing, setEditing] = useState<boolean>(false);

  // Store the currently edited name and validation errors flag.
  const [editName, setEditName] = useState<string>(accountName);

  // Get app connection status.
  const { isConnected } = useConnections();

  // Use tool tip.
  const { setTooltipTextAndOpen } = useTooltip();

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
      // Render error alert.
      toast.error('Bad account name.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId: `toast-${trimmed}`, // prevent duplicate alerts
      });

      setEditName(accountName);
      setEditing(false);
      return;
    }

    // Render success alert.
    toast.success('Account name updated.', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'dark',
      transition: Flip,
      toastId: `toast-${trimmed}`, // prevent duplicate alerts
    });

    // Otherwise rename account.
    renameHandler(address, trimmed);
    setEditName(trimmed);
    setEditing(false);
  };

  // Input change handler.
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

  // Function to render a chain icon.
  const renderChainIcon = () => {
    const chainId = getAddressChainId(address);
    const ChainIcon = chainIcon(chainId);
    return <ChainIcon className={editing ? 'chain-icon' : 'chain-icon fade'} />;
  };

  // Function to render wrapper JSX.
  const renderContent = () => (
    <>
      <div className="content">
        <div className="inner">
          <div className="identicon">
            <Identicon value={address} size={36} />
            <div className="index-icon ">{index + 1}</div>
          </div>
          <div>
            <section className="row">
              <div className="input-wrapper">
                {renderChainIcon()}

                <h5 className="full">
                  <span>{address}</span>
                </h5>
                <input
                  type="text"
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

                {editing && (
                  <div style={{ display: 'flex' }}>
                    &nbsp;
                    <button
                      id="commit-btn"
                      type="button"
                      className="edit"
                      onPointerDown={() => commitEdit()}
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        transform="grow-1"
                        className="icon"
                      />
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      className="edit"
                      onPointerDown={() => cancelEditing()}
                    >
                      <FontAwesomeIcon icon={faXmark} transform="grow-1" />
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
        {isImported && !isProcessing ? (
          <div
            style={{ position: 'relative' }}
            className="tooltip-trigger-element"
            data-tooltip-text={'Remove'}
            onMouseMove={() => setTooltipTextAndOpen('Remove')}
          >
            <ButtonMono
              className="account-action-btn orange-hover"
              iconLeft={faEraser}
              text={''}
              onClick={() => openRemoveHandler()}
            />
          </div>
        ) : (
          <div
            style={{ position: 'relative' }}
            className="tooltip-trigger-element"
            data-tooltip-text={isConnected ? 'Import' : 'Offline Mode'}
            onMouseMove={() =>
              isConnected
                ? setTooltipTextAndOpen('Import')
                : setTooltipTextAndOpen('Offline Mode')
            }
          >
            <ButtonMono
              disabled={!isConnected}
              iconLeft={faDownFromDottedLine}
              iconTransform="grow-2"
              text={''}
              onClick={() => !isProcessing && openConfirmHandler()}
              className={
                isProcessing
                  ? 'account-action-btn processing'
                  : 'account-action-btn green-hover'
              }
            />
            {isProcessing && (
              <div
                style={{ position: 'absolute', left: '3px', top: '8px' }}
                className="lds-ellipsis"
              >
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}
          </div>
        )}
        <div
          className="tooltip-trigger-element"
          data-tooltip-text={'Delete'}
          onMouseMove={() => setTooltipTextAndOpen('Delete')}
        >
          <ButtonMono
            className="account-action-btn red-hover"
            iconLeft={faTrash}
            iconTransform="shrink-2"
            text={''}
            onClick={() => openDeleteHandler()}
          />
        </div>
      </div>
    </>
  );

  // Don't render bottom border on the address if it's the last one.
  return <Wrapper $orderData={orderData}>{renderContent()}</Wrapper>;
};
