// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FlexRow } from '../../styles';
import styled from 'styled-components';

const VertBar = () => (
  <span style={{ fontSize: '0.75rem', color: 'var(--text-dimmed)' }}>
    &#x7C;
  </span>
);

const LinkItem = styled.p`
  color: var(--text-color-secondary);
  opacity: 0.5;
  margin: 0;
  cursor: pointer;
  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

interface LinksFooterProps {
  handleDisclaimerClick: () => void;
  handlePrivacyClick: () => void;
}

export const BaseLinksFooter = ({
  handleDisclaimerClick,
  handlePrivacyClick,
}: LinksFooterProps) => (
  <div style={{ marginTop: 'auto' }}>
    <FlexRow style={{ justifyContent: 'center', padding: '1rem' }}>
      <p
        style={{
          margin: 0,
          color: 'var(--text-color-secondary)',
          opacity: '0.4',
        }}
      >
        Polkadot Live
      </p>
      <VertBar />
      <LinkItem onClick={() => handleDisclaimerClick()}>Disclaimer</LinkItem>
      <VertBar />
      <LinkItem onClick={() => handlePrivacyClick()}>Privacy</LinkItem>
    </FlexRow>
  </div>
);
