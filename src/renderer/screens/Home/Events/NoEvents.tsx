// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBoxOpen, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NoEventsWrapper } from './Wrappers';

export const NoEvents = () => (
  <NoEventsWrapper>
    <h1>
      <FontAwesomeIcon icon={faBoxOpen} transform="grow-10" />
    </h1>
    <h3>No New Events</h3>
    <h4>
      <a
        href="/import"
        onClick={async (e) => {
          e.preventDefault();
          await window.myAPI.openWindow('import');
        }}
      >
        Import more accounts{' '}
        <FontAwesomeIcon icon={faChevronRight} transform="shrink-6" />
      </a>
    </h4>
  </NoEventsWrapper>
);
