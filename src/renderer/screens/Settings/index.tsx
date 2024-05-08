// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';

export const Settings: React.FC = () => {
  console.log('Settings opened...');

  return (
    <>
      {/* Header */}
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="settings" />
          <h3>Settings</h3>
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        <p>Put settings here...</p>
      </ContentWrapper>
    </>
  );
};
