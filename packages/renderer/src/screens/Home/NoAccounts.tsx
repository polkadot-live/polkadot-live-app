// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { NoAccountsWrapper } from './Wrappers';

export const NoAccounts = () => (
  <NoAccountsWrapper>
    <h4>No accounts imported.</h4>
    <ButtonMonoInvert
      lg
      text="Manage Accounts"
      iconLeft={faLink}
      onClick={() => {
        window.myAPI.openWindow('import');
        window.myAPI.umamiEvent('window-open-accounts', null);
      }}
    />
  </NoAccountsWrapper>
);

export const NoOpenGov = () => (
  <NoAccountsWrapper>
    <h4>No OpenGov subscriptions added.</h4>
    <ButtonMonoInvert
      lg
      text="Explore OpenGov"
      iconLeft={faLink}
      onClick={() => {
        window.myAPI.openWindow('openGov');
        window.myAPI.umamiEvent('window-open-openGov', null);
      }}
    />
  </NoAccountsWrapper>
);
