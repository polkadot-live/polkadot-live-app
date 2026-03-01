// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useConnections } from '@polkadot-live/contexts';
import { FlexColumn } from '@polkadot-live/styles';
import { OpenViewButtonWrapper } from './Wrappers';
import type { OpenViewButtonProps } from './types';

export const OpenViewButton = ({
  title,
  icon,
  target,
  umamiEvent,
}: OpenViewButtonProps) => {
  const { openTab } = useConnections();

  return (
    <OpenViewButtonWrapper
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openTab(target, { event: umamiEvent, data: null })}
    >
      <FlexColumn>
        <FontAwesomeIcon className="icon" icon={icon} />
        <h2>{title}</h2>
      </FlexColumn>
      <span className="accent-line" />
    </OpenViewButtonWrapper>
  );
};
