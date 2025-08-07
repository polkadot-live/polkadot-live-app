// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FlexRow } from '../../styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const OfflineBannerWrapper = styled(FlexRow)`
  background-color: #e7ad65;
  color: #101010;
  font-size: 1.02rem;
  justify-content: center;
  padding: 0.95rem 1rem;
`;

export const OfflineBanner = ({ style }: { style?: React.CSSProperties }) => (
  <OfflineBannerWrapper $gap={'0.75rem'} style={style}>
    <FontAwesomeIcon icon={faCircleExclamation} transform={'grow-1'} />
    <span>Currently offline.</span>
  </OfflineBannerWrapper>
);
