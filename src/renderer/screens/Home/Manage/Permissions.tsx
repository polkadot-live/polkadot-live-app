// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonText, Switch } from '@polkadot-cloud/react';
import type { AnyJson } from '@/types/misc';
import {
  AccountWrapper,
  AccountsWrapper,
  BreadcrumbsWrapper,
} from './Wrappers';

export const Permissions = ({ setSection, breadcrumb }: AnyJson) => {
  const permissions = ['Transfers', 'Nomination Pools'];
  return (
    <>
      <BreadcrumbsWrapper>
        <ul>
          <li>
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
          </li>
          <li>/</li>
          <li>{breadcrumb}</li>
        </ul>
      </BreadcrumbsWrapper>
      <AccountsWrapper>
        <div style={{ padding: '0 0.75rem' }}>
          {permissions.map((permission: string, i) => (
            <AccountWrapper
              whileHover={{ scale: 1.01 }}
              key={`manage_permission_${i}`}
            >
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
                  <Switch type="secondary" isOn={true} />
                </div>
              </div>
            </AccountWrapper>
          ))}
        </div>
      </AccountsWrapper>
    </>
  );
};
