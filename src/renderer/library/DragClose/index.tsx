// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Wrapper } from './Wrapper';

export const DragClose = ({ windowName }: { windowName: string }) => (
  <Wrapper>
    <div></div>
    <div>
      <button type="button" onClick={() => window.myAPI.hideWindow(windowName)}>
        <FontAwesomeIcon icon={faTimes} transform="grow-2" />
      </button>
    </div>
  </Wrapper>
);
