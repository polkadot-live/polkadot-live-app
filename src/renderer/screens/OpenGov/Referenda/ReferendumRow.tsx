// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ReferendumRowWrapper } from './Wrappers';
import { renderOrigin } from '../utils';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripDotsVertical } from '@fortawesome/pro-light-svg-icons';
import type { ReferendumRowProps } from '../types';

export const ReferendumRow = ({ referendum }: ReferendumRowProps) => {
  const { activeReferendaChainId: chainId } = useReferenda();
  const { setTooltipTextAndOpen } = useTooltip();

  const { referendaId } = referendum;
  const uriPolkassembly = `https://${chainId}.polkassembly.io/referenda/${referendaId}`;
  const uriSubsquare = `https://${chainId}.subsquare.io/referenda/${referendaId}`;

  return (
    <ReferendumRowWrapper>
      <div className="content-wrapper">
        <div className="left">
          <div className="stat-wrapper">
            <span>ID</span>
            <h4 className="mw-20">{referendum.referendaId}</h4>
          </div>
          <div className="stat-wrapper">
            <span>Origin</span>
            <h4>{renderOrigin(referendum)}</h4>
          </div>
        </div>
        <div className="right">
          <div className="links-wrapper">
            {/* Polkassembly */}
            <button
              className="btn-polkassembly"
              onClick={() => window.myAPI.openBrowserURL(uriPolkassembly)}
            >
              Polkassembly
            </button>
            {/* Subsquare */}
            <button
              className="btn-subsquare"
              onClick={() => window.myAPI.openBrowserURL(uriSubsquare)}
            >
              Subsquare
            </button>
          </div>
          {/* TODO: Subsciption Menu */}
          <div
            className="menu-btn-wrapper tooltip-trigger-element"
            data-tooltip-text="Subscriptions"
            onMouseMove={() => setTooltipTextAndOpen('Subscriptions')}
          >
            <FontAwesomeIcon icon={faGripDotsVertical} transform={'grow-6'} />
          </div>
        </div>
      </div>
    </ReferendumRowWrapper>
  );
};
