// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';

export const OpenGov: React.FC = () => {
  // TODO: Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  console.log(`window id: ${'todo'}`);

  return (
    <>
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="openGov" />
          <h3>Open Gov</h3>
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        <p>Open Gov</p>
      </ContentWrapper>
    </>
  );
};
