// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NoEventsWrapper } from './Wrappers';

export const NoEvents = () => (
  <NoEventsWrapper>
    <h1>
      <FontAwesomeIcon icon={faBoxOpen} transform="grow-10" />
    </h1>
    <h3>No New Events</h3>
  </NoEventsWrapper>
);
