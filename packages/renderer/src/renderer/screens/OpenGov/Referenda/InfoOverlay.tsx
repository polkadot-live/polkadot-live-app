// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { MoreOverlay } from './Wrappers';
import { Scrollable } from '@polkadot-live/ui/styles';
import { useOverlay } from '@app/contexts/common/Overlay';
import type { PolkassemblyProposal } from '@app/contexts/openGov/Polkassembly/types';

interface InfoOverlayProps {
  proposalData: PolkassemblyProposal;
}

export const InfoOverlay = ({ proposalData }: InfoOverlayProps) => {
  const { setStatus } = useOverlay();

  return (
    <MoreOverlay>
      <Scrollable style={{ height: 'auto', padding: '1rem' }}>
        <div className="content">
          <h1>{proposalData?.title}</h1>

          <div className="outer-wrapper">
            <div className="description">{proposalData?.content}</div>
          </div>
          <ButtonPrimaryInvert text="Close" onClick={() => setStatus(0)} />
        </div>
      </Scrollable>
    </MoreOverlay>
  );
};
