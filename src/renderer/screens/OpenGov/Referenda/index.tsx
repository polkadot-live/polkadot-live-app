// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import type { ReferendaProps } from '../types';
import { OpenGovFooter, Scrollable } from '../Wrappers';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import {
  faCaretLeft,
  faLayerGroup,
  faTimer,
} from '@fortawesome/pro-solid-svg-icons';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { ReferendumRow } from './ReferendumRow';
import { ControlsWrapper, ReferendaGroup } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export const Referenda = ({ setSection, chainId }: ReferendaProps) => {
  const { fetchingReferenda, getSortedActiveReferenda } = useReferenda();

  /// Sorting controls state.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(false);

  return (
    <>
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="openGov" />
          <h3>{chainId} Referenda</h3>
        </div>
      </HeaderWrapper>
      <Scrollable>
        <ContentWrapper style={{ padding: '1rem 2rem 0' }}>
          {/* Sorting controls */}
          <ControlsWrapper>
            <div
              className={newestFirst ? 'icon-wrapper active' : 'icon-wrapper'}
              onClick={() => setNewestFirst(!newestFirst)}
            >
              <div className="icon">
                <FontAwesomeIcon icon={faTimer} />
              </div>
              <span>{newestFirst ? 'Newest First' : 'Oldest First'}</span>
            </div>
            <div
              className={groupingOn ? 'icon-wrapper active' : 'icon-wrapper'}
              onClick={() => setGroupingOn(!groupingOn)}
            >
              <div className="icon">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <span>{groupingOn ? 'Grouping On' : 'Grouping Off'}</span>
            </div>
          </ControlsWrapper>
          {/* List referenda */}
          <section>
            {fetchingReferenda ? (
              <p>Loading referenda...</p>
            ) : (
              <ReferendaGroup>
                {getSortedActiveReferenda(newestFirst).map((referendum, i) => (
                  <ReferendumRow key={i} referendum={referendum} />
                ))}
              </ReferendaGroup>
            )}
          </section>
        </ContentWrapper>
      </Scrollable>
      <OpenGovFooter $chainId={chainId}>
        <div>
          <section className="left"></section>
          <section className="right">
            <ButtonPrimaryInvert
              text={'Back'}
              iconLeft={faCaretLeft}
              style={{
                padding: '0.3rem 1.25rem',
                color:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
                borderColor:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
              }}
              onClick={() => setSection(0)}
            />
          </section>
        </div>
      </OpenGovFooter>
    </>
  );
};
