// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Wrapper } from './Wrapper';

export const DragClose = ({ windowName }: { windowName: string }) => {
  return (
    <Wrapper>
      <div></div>
      <div>
        <button
          type="button"
          onClick={() => window.myAPI.closeWindow(windowName)}
        >
          <FontAwesomeIcon icon={faTimes} transform="grow-2" />
        </button>
      </div>
    </Wrapper>
  );
};
