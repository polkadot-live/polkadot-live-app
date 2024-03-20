// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  faCheck,
  faPlus,
  faTimes,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { ellipsisFn, unescape } from '@w3ux/utils';
import { Identicon } from '@app/library/Identicon';
import { Wrapper } from './Wrapper';
import { ButtonText } from '../../../kits/Buttons/ButtonText';
import type { HardwareAddressProps } from './types';

export const HardwareAddress = ({
  address,
  index,
  isImported,
  initial,
  disableEditIfImported = false,
  renameHandler,
  openConfirmHandler,
  openRemoveHandler,
  openDeleteHandler,
}: HardwareAddressProps) => {
  // store whether this address is being edited.
  const [editing, setEditing] = useState<boolean>(false);

  // store the currently saved name.
  const [name, setName] = useState<string>(initial);

  // store the currently edited name.
  const [editName, setEditName] = useState<string>(initial);

  const cancelEditing = () => {
    setEditName(name);
    setEditing(false);
  };

  const commitEdit = () => {
    let newName = editName;
    if (editName === '') {
      newName = ellipsisFn(address, 6);
    }
    if (newName !== name) {
      setName(newName);
      setEditName(newName);
      renameHandler(address, newName);
    }
    setEditing(false);
  };
  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value || '';
    val = unescape(val);
    setEditName(val);
  };

  return (
    <Wrapper>
      <div className="content">
        <div className="inner">
          <div className="identicon">
            <Identicon value={address} size={40} />
            <div className="index-icon ">{index + 1}</div>
          </div>
          <div>
            <section className="row">
              <input
                disabled={isImported && disableEditIfImported}
                type="text"
                value={editing ? editName : name}
                onChange={(e) => handleChange(e)}
                onFocus={() => setEditing(true)}
                onBlur={() => commitEdit()}
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
                    type="button"
                    className="edit"
                    onClick={() => commitEdit()}
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
                    onClick={() => cancelEditing()}
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
    </Wrapper>
  );
};
