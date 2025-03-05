// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import PolkadotSVG from '@app/svg/polkadotIcon.svg?react';
import KusamaSVG from '@app/svg/kusamaIcon.svg?react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePen, faList } from '@fortawesome/free-solid-svg-icons';
import { NetworkHeader } from '../Wrappers';
import { useEffect } from 'react';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import type { ChainID } from '@polkadot-live/types/chains';
import type { OverviewExploreProps } from './types';

export const OverviewExplore: React.FC<OverviewExploreProps> = ({
  setSection,
  setSectionContent,
}: OverviewExploreProps) => {
  // Tracks and referenda contexts.
  const { fetchTracksData } = useTracks();
  const { fetchReferendaData, updateHasFetchedReferenda } = useReferenda();

  // Open origins and tracks information.
  const handleOpenTracks = (chainId: ChainID) => {
    setSectionContent('tracks');
    fetchTracksData(chainId);
    setSection(1);
  };

  // Open referenda.
  const handleOpenReferenda = (chainId: ChainID) => {
    updateHasFetchedReferenda(chainId);
    setSectionContent('referenda');
    fetchReferendaData(chainId);
    setSection(1);
  };

  // Apply border radius to navigation cards.
  useEffect(() => {
    const applyBorders = () => {
      const cards = document.querySelectorAll(
        '.methodCard'
      ) as NodeListOf<HTMLElement>;

      cards.forEach((card, i) => {
        if (i === 2) {
          card.style.borderBottomLeftRadius = '0.375rem';
        } else if (i === 3) {
          card.style.borderBottomRightRadius = '0.375rem';
        }
      });
    };

    applyBorders();
  }, []);

  return (
    <section>
      <UI.ActionItem showIcon={false} text={'Explore OpenGov'} />
      <Styles.FlexColumn $rowGap={'0.25rem'}>
        <Styles.FlexRow $gap={'0.25rem'} style={{ marginTop: '1rem' }}>
          <NetworkHeader style={{ borderTopLeftRadius: '0.375rem' }}>
            <PolkadotSVG width={'1.25rem'} opacity={0.8} />
            <h4>Polkadot</h4>
          </NetworkHeader>
          <NetworkHeader style={{ borderTopRightRadius: '0.375rem' }}>
            <KusamaSVG width={'2.2rem'} opacity={0.8} />
            <h4>Kusama</h4>
          </NetworkHeader>
        </Styles.FlexRow>
        <Styles.GridTwoCol>
          <UI.NavCardThin
            title={'Referenda'}
            styleLogoCont={{ opacity: '0.8' }}
            onClick={() => handleOpenReferenda('Polkadot')}
            childrenLogo={
              <FontAwesomeIcon icon={faFilePen} transform={'grow-3'} />
            }
            childrenSubtitle={
              <span>Active referenda on the Polkadot network.</span>
            }
          />
          <UI.NavCardThin
            title={'Referenda'}
            styleLogoCont={{ opacity: '0.8' }}
            onClick={() => handleOpenReferenda('Kusama')}
            childrenLogo={
              <FontAwesomeIcon icon={faFilePen} transform={'grow-3'} />
            }
            childrenSubtitle={
              <span>Active referenda on the Kusama network.</span>
            }
          />
          <UI.NavCardThin
            title={'Tracks'}
            onClick={() => handleOpenTracks('Polkadot')}
            childrenLogo={
              <FontAwesomeIcon icon={faList} transform={'grow-2'} />
            }
            childrenSubtitle={<span>Tracks on the Polkadot network.</span>}
          />
          <UI.NavCardThin
            title={'Tracks'}
            onClick={() => handleOpenTracks('Kusama')}
            childrenLogo={
              <FontAwesomeIcon icon={faList} transform={'grow-2'} />
            }
            childrenSubtitle={<span>Tracks on the Kusama network.</span>}
          />
        </Styles.GridTwoCol>
      </Styles.FlexColumn>
    </section>
  );
};
