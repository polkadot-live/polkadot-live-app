// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCheck,
  faPlus,
  faTimes,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonText } from '../../../kits/Buttons/ButtonText';
import { unescape } from '@w3ux/utils';
import { Flip, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Identicon } from '@app/library/Identicon';
import { useState } from 'react';
import { validateAccountName } from '@/renderer/utils/ImportUtils';
import { Wrapper } from './Wrapper';
import type { FormEvent } from 'react';
import type { HardwareAddressProps } from './types';

export const HardwareAddress = ({
  address,
  index,
  isImported,
  isLast,
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

  // Function to render wrapper JSX.
  const renderContent = () => (
    <>
      <div className="content">
        <div className="inner">
          <div className="identicon">
            <Identicon value={address} size={40} />
            <div className="index-icon ">{index + 1}</div>
          </div>
          <div>
            <section className="row">
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
            </section>
            <h5 className="full">
              <span>{address}</span>
            </h5>
          </div>
        </div>
      </div>
      <div className="action">
        {isImported ? (
          <ButtonText
            iconLeft={faTimes}
            text={'Remove'}
            onClick={() => openRemoveHandler()}
          />
        ) : (
          <ButtonText
            iconLeft={faPlus}
            text={'Import'}
            onClick={() => openConfirmHandler()}
          />
        )}
        <ButtonText
          iconLeft={faTimes}
          text={'Delete'}
          onClick={() => openDeleteHandler()}
        />
      </div>
    </>
  );

  // Don't render bottom border on the address if it's the last one.
  if (isLast) {
    return <Wrapper $noBorder>{renderContent()}</Wrapper>;
  } else {
    return <Wrapper>{renderContent()}</Wrapper>;
  }
};
