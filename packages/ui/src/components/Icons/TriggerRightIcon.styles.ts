// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const TriggerRightIconWrapper = styled.div`
  svg {
    opacity: 0.75;
    transition: opacity 200ms ease-out;
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
`;
