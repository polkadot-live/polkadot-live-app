// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TreasuryStatCardWrapper } from './TreasuryStatCard.styles';
import { useHelp } from '@ren/renderer/contexts/common/Help';
import type { TreasuryStatCardProps } from './types';

export const TreasuryStatCard = ({
  chainId,
  title,
  statText,
  helpKey,
}: TreasuryStatCardProps) => {
  const { openHelp } = useHelp();

  return (
    <TreasuryStatCardWrapper $chainId={chainId}>
      <div>
        <h2>{title}</h2>
        <div className="help-icon" onClick={() => openHelp(helpKey)}>
          <FontAwesomeIcon icon={faInfo} />
        </div>
      </div>
      <h4>{statText}</h4>
    </TreasuryStatCardWrapper>
  );
};
