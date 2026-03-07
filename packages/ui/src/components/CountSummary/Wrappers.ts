// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { styled } from 'styled-components';

/** Count display group used in accordion triggers */
export const CountGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

export const ActiveCount = styled.span<{ $color: string; $active: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $color }) => $color};
  opacity: ${({ $active }) => ($active ? 0.7 : 0.3)};
  font-size: 1rem;
  font-weight: 800;
`;

export const NotifyCount = styled.span<{ $color: string; $active: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $color }) => $color};
  opacity: ${({ $active }) => ($active ? 0.7 : 0.3)};
  font-size: 1rem;
  font-weight: 800;
`;
