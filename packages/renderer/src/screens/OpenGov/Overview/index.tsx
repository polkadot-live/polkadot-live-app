// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Styles from '@polkadot-live/ui/styles';
import { OverviewTreasury } from './OverviewTreasury';
import { OverviewExplore } from './OverviewExplore';
import type { OverviewProps } from './types';

export const Overview: React.FC<OverviewProps> = ({
  setSection,
  setSectionContent,
}: OverviewProps) => (
  <Styles.FlexColumn $rowGap={'2rem'}>
    {/** Treasury Stats */}
    <OverviewTreasury />

    {/** Explore Grid */}
    <OverviewExplore
      setSection={setSection}
      setSectionContent={setSectionContent}
    />
  </Styles.FlexColumn>
);
