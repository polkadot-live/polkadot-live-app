// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Wrappers from './Wrappers';
import type * as OG from '@polkadot-live/types/openGov';

import { renderOrigin } from '@app/utils/openGovUtils';
import { usePolkassembly } from '@app/contexts/openGov/Polkassembly';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { FlexRow } from '@polkadot-live/ui/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { ReferendumDropdownMenu } from '../DropdownMenu';

interface HistoryRowProps {
  info: OG.ReferendaInfo;
}

export const HistoryRow = ({ info }: HistoryRowProps) => {
  const { usePolkassemblyApi, getProposal } = usePolkassembly();
  const { activeReferendaChainId: chainId } = useReferenda();
  const proposalData = getProposal(chainId, info.refId);
  const { title } = proposalData || { title: '' };

  return (
    <Wrappers.ReferendumRowWrapper>
      <FlexRow>
        <div className="RefID">
          <FontAwesomeIcon icon={faHashtag} transform={'shrink-5'} />
          {info.refId}
        </div>

        {usePolkassemblyApi ? (
          <Wrappers.TitleWithOrigin $direction="row">
            <FlexRow style={{ width: '100%' }}>
              <div style={{ width: '80px', minWidth: '80px' }}>
                <Wrappers.RefStatusBadge
                  style={{ width: 'fit-content' }}
                  $status={info.refStatus}
                >
                  {info.refStatus}
                </Wrappers.RefStatusBadge>
              </div>
              <h4 style={{ width: '100%' }} className="text-ellipsis">
                {title !== '' ? title : 'No Title'}
              </h4>
              <div>
                <ReferendumDropdownMenu
                  chainId={chainId}
                  proposalData={null}
                  referendum={info}
                />
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
              <ReferendumDropdownMenu
                chainId={chainId}
                proposalData={null}
                referendum={info}
              />
            </div>
          </FlexRow>
        )}
      </FlexRow>
    </Wrappers.ReferendumRowWrapper>
  );
};
