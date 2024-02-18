// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { NoAccountsWrapper } from './Wrappers';
import { ButtonMono } from '@/renderer/library/Buttons/ButtonMono';

export const NoAccounts = () => (
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
