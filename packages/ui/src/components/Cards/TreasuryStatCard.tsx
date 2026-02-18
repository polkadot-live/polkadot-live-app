// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TreasuryStatCardWrapper } from './TreasuryStatCard.styles';
import type { TreasuryStatCardProps } from './types';

export const TreasuryStatCard = ({
  chainId,
  title,
  statText,
  helpKey,
  disable = false,
  openHelp,
}: TreasuryStatCardProps) => (
  <TreasuryStatCardWrapper $chainId={chainId}>
    <div>
      <h2>{title}</h2>
      <button
        type="button"
        className="help-icon"
        onClick={() => openHelp(helpKey)}
      >
        <FontAwesomeIcon icon={faInfo} />
      </button>
    </div>
    <h4 className={disable ? 'disable' : ''}>{statText}</h4>
  </TreasuryStatCardWrapper>
);
