// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const ConfirmWrapper = styled.div`
  background-color: var(--background-default);
  border: 1px solid var(--border-primary-color);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2.5rem;

  h3,
  h5,
  p {
    text-align: center;
  }
  h3 {
    margin: 1.25rem 0 0.5rem 0;
  }
  h5 {
    margin: 0.25rem 0;
  }
  .footer {
    display: flex;
    margin-top: 1rem;

    > button {
      margin-right: 1rem;
      &:last-child {
        margin-right: 0;
      }
    }
  }
`;
