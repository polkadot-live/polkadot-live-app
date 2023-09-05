// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { ButtonMono } from '@polkadot-cloud/react';
import { NoAccountsWrapper } from './Wrappers';

export const NoAccounts = () => {
  return (
    <NoAccountsWrapper>
      <h4>No accounts imported.</h4>
      <ButtonMono
        lg
        text="Import Accounts"
        iconLeft={faLink}
        onClick={() => {
          window.myAPI.openWindow('import');
        }}
      />
    </NoAccountsWrapper>
  );
};
