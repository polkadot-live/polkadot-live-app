// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { NoAccountsWrapper } from './Wrappers';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';

export const NoAccounts = () => (
  <NoAccountsWrapper>
    <h4>No accounts imported.</h4>
    <ButtonMonoInvert
      lg
      text="Manage Accounts"
      iconLeft={faLink}
      onClick={() => {
        window.myAPI.openWindow('import');
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
      }}
    />
  </NoAccountsWrapper>
);
