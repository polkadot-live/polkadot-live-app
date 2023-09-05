// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  faAngleLeft,
  faCheckCircle,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText } from '@polkadot-cloud/react';
import { AnyJson } from '@polkadot-live/types';
import { AccountWrapper, AccountsWrapper, HeadingWrapper } from './Wrappers';

export const Permissions = ({ setSection }: AnyJson) => {
  const permissions = ['Nomination Pools'];
  return (
    <AccountsWrapper>
      <HeadingWrapper>
        <h5>
          <ButtonText
            text="Back"
            onClick={() => setSection(0)}
            iconLeft={faAngleLeft}
            iconTransform="shrink-3"
            style={{
              fontSize: '0.92rem',
              fontWeight: 500,
              position: 'relative',
              left: '-0.5rem',
            }}
          />
        </h5>
      </HeadingWrapper>
      <div style={{ padding: '0 0.75rem' }}>
        {permissions.map((permission: string, i) => (
          <AccountWrapper
            whileHover={{ scale: 1.01 }}
            key={`manage_permission_${i}`}
          >
            <button
              type="button"
              onClick={() => {
                /* TODO: toggle permission */
              }}
            ></button>
            <div className="inner">
              <div>
                <span className="icon">
                  <FontAwesomeIcon icon={faUserGroup} />
                </span>
                <div className="content">
                  <h3>{permission}</h3>
                </div>
              </div>
              <div>
                <FontAwesomeIcon icon={faCheckCircle} transform="grow-4" />
              </div>
            </div>
          </AccountWrapper>
        ))}
      </div>
    </AccountsWrapper>
  );
};
