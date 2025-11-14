// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Wrappers from './Wrappers';
import {
  useConnections,
  usePolkassembly,
  useReferenda,
} from '@polkadot-live/contexts';
import { Loader } from './Loader';
import { renderOrigin } from '@polkadot-live/core';
import { FlexRow } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { ReferendumDropdownMenu } from '../Dropdowns';
import type * as OG from '@polkadot-live/types/openGov';

interface HistoryRowProps {
  info: OG.ReferendaInfo;
}

export const HistoryRow = ({ info }: HistoryRowProps) => {
  const { getTheme } = useConnections();
  const { usePolkassemblyApi, getProposal } = usePolkassembly();
  const { activeReferendaChainId: chainId } = useReferenda();
  const proposalMeta = getProposal(chainId, info.refId);

  return (
    <Wrappers.ReferendumRowWrapper>
      <FlexRow>
        <div className="RefID">
          <FontAwesomeIcon icon={faHashtag} transform={'shrink-5'} />
          {info.refId}
        </div>

        {usePolkassemblyApi ? (
          <Wrappers.TitleWithOrigin $direction="row">
            <FlexRow style={{ width: '100%', minHeight: '22px' }}>
              <div style={{ width: '80px', minWidth: '80px' }}>
                <Wrappers.RefStatusBadge
                  style={{ width: 'fit-content' }}
                  $status={info.refStatus}
                >
                  {info.refStatus}
                </Wrappers.RefStatusBadge>
              </div>
              <div style={{ minWidth: '0', flex: 1 }}>
                {proposalMeta ? (
                  <h4 style={{ width: '100%' }} className="text-ellipsis">
                    {proposalMeta.title}
                  </h4>
                ) : (
                  <Loader theme={getTheme()} />
                )}
              </div>
              <div>
                <ReferendumDropdownMenu chainId={chainId} referendum={info} />
              </div>
            </FlexRow>
          </Wrappers.TitleWithOrigin>
        ) : (
          <FlexRow style={{ width: '100%', minWidth: 0 }}>
            <div style={{ width: '76px', minWidth: '76px' }}>
              <Wrappers.RefStatusBadge
                style={{ width: 'fit-content' }}
                $status={info.refStatus}
              >
                {info.refStatus}
              </Wrappers.RefStatusBadge>
            </div>
            <h4 style={{ width: '100%' }} className="text-ellipsis">
              {renderOrigin(info)}
            </h4>
            <div>
              <ReferendumDropdownMenu chainId={chainId} referendum={info} />
            </div>
          </FlexRow>
        )}
      </FlexRow>
    </Wrappers.ReferendumRowWrapper>
  );
};
