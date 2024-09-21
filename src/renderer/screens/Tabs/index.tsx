// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

const TabsWrapper = styled.div`
  -webkit-app-region: drag;
  user-select: none;
  width: 100%;
  height: 50px;
  background-color: black;
  border-bottom: 1px solid grey;

  .inner {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    height: 100%;
    color: red;
    padding: 0 0.5rem;
  }
`;

export const Tabs: React.FC = () => (
  <TabsWrapper>
    <div className="inner">
      <p>Tabs</p>
    </div>
  </TabsWrapper>
);
