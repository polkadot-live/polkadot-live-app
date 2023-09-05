// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faBoxOpen, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NoEventsWrapper } from './Wrappers';

export const NoEvents = () => {
  return (
    <NoEventsWrapper>
      <h1>
        <FontAwesomeIcon icon={faBoxOpen} transform="grow-10" />
      </h1>
      <h3>No New Events</h3>
      <h4>
        <a
          href="/import"
          onClick={(e) => {
            e.preventDefault();
            window.myAPI.openWindow('import');
          }}
        >
          Import more accounts{' '}
          <FontAwesomeIcon icon={faChevronRight} transform="shrink-6" />
        </a>
      </h4>
    </NoEventsWrapper>
  );
};
