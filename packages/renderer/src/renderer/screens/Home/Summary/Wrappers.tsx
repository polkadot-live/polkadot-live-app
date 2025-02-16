// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FlexRow } from '@polkadot-live/ui/styles';
import styled from 'styled-components';

const SideTriggerButtonWrapper = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 1.25rem;
  opacity: 0.75;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color-primary);
`;

export const SideTriggerButton = ({ onClick }: { onClick: () => void }) => (
  <SideTriggerButtonWrapper onClick={() => onClick()}>
    <FlexRow $gap={'0.65rem'}>
      <FontAwesomeIcon icon={faCaretRight} transform={'grow-2'} />
    </FlexRow>
  </SideTriggerButtonWrapper>
);
