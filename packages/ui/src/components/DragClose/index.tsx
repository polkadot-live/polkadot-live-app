// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Wrapper } from './Wrapper';
import type { DragCloseProps } from './types';

export const DragClose = ({ onClick }: DragCloseProps) => (
  <Wrapper>
    <div></div>
    <div>
      <button type="button" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faTimes} transform="grow-2" />
      </button>
    </div>
  </Wrapper>
);
