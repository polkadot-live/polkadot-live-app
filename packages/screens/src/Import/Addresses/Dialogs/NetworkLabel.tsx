// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { FlexRow } from '@polkadot-live/styles/wrappers';
import { ChainIcon } from '@polkadot-live/ui';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

const NetworkLabelWrapper = styled(FlexRow).attrs<{ $hide?: boolean }>(
  (props) => ({
    $hide: props.$hide,
  })
)`
  min-width: 140px;
  .Label {
    font-size: 1rem;
    text-align: left;
    display: block;
  }
  .IconWrapper {
    min-width: 15px;
    width: 15px;
    height: 15px;
  }
  @media (max-width: 500px) {
    min-width: 15px !important;
    .Label {
      display: ${({ $hide }) => ($hide === true ? 'none' : 'block')};
    }
  }
`;

export const NetworkLabel = ({
  htmlFor,
  text,
  theme,
  chainId,
  hideIcon,
  labelStyle,
  wrapperStyle,
}: {
  htmlFor: string;
  text: string;
  theme: AnyData;
  chainId?: ChainID;
  hideIcon?: boolean;
  labelStyle?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}) => (
  <NetworkLabelWrapper
    $gap={'0.75rem'}
    $hide={Boolean(hideIcon)}
    style={{ ...wrapperStyle }}
  >
    {chainId && (
      <div className="IconWrapper">
        <ChainIcon chainId={chainId} />
      </div>
    )}
    <label
      className="Label"
      htmlFor={htmlFor}
      style={{ color: theme.textColorSecondary, ...labelStyle }}
    >
      {text}
    </label>
  </NetworkLabelWrapper>
);
