// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ButtonText } from '@polkadot-cloud/react';
import { AnyJson } from '@polkadot-live/types';
import { Identicon } from '@app/library/Identicon';
import { Account } from '@/model/Account';
import { ReactComponent as PolkadotIcon } from '@app/svg/polkadotIcon.svg';
import { AccountWrapper, AccountsWrapper, HeadingWrapper } from './Wrappers';

export const Accounts = ({ setSection, addresses }: AnyJson) => {
  return (
    <AccountsWrapper>
      <HeadingWrapper>
        <h5 style={{ marginBottom: '0.5rem' }}>
          <PolkadotIcon className="icon" />
          Polkadot
        </h5>
      </HeadingWrapper>
      <div style={{ padding: '0 0.75rem' }}>
        {addresses
          .filter(({ type }: Account) => type === 0)
          .map(({ address, name }: Account, i: number) => (
            <AccountWrapper
              whileHover={{ scale: 1.01 }}
              key={`manage_account_${i}`}
            >
              <button type="button" onClick={() => setSection(1)}></button>
              <div className="inner">
                <div>
                  <span className="icon">
                    <Identicon value={address} size={26} />
                  </span>
                  <div className="content">
                    <h3>{name}</h3>
                  </div>
                </div>
                <div>
                  <ButtonText
                    text=""
                    iconRight={faChevronRight}
                    iconTransform="shrink-3"
                  />
                </div>
              </div>
            </AccountWrapper>
          ))}
      </div>
    </AccountsWrapper>
  );
};
