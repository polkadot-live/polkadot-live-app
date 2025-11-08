// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FlexRow } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const OfflineBannerWrapper = styled(FlexRow)`
  background-color: var(--accent-warning-background);
  color: #101010;
  font-size: 1.01rem;
  justify-content: center;
  padding: 0.65rem 1rem;
`;

export const OfflineBanner = ({
  rounded = false,
  text,
  marginTop,
}: {
  rounded?: boolean;
  text?: string;
  marginTop?: string;
}) => (
  <OfflineBannerWrapper
    $gap={'0.75rem'}
    style={{ borderRadius: rounded ? '0.375rem' : undefined, marginTop }}
  >
    <FontAwesomeIcon icon={faCircleExclamation} transform={'grow-1'} />
    <span>{text || 'Currently offline.'}</span>
  </OfflineBannerWrapper>
);
