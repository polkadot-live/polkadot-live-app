// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import type { ReferendaProps } from '../types';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import {
  faCaretLeft,
  faLayerGroup,
  faLineHeight,
  faTimer,
} from '@fortawesome/pro-solid-svg-icons';
import { useConnections } from '@/renderer/contexts/common/Connections';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { ReferendumRow } from './ReferendumRow';
import { ReferendaGroup, StickyHeadings } from './Wrappers';
import { useEffect, useState } from 'react';
import { getSpacedOrigin } from '@/renderer/utils/openGovUtils';
import {
  renderPlaceholders,
  ControlsWrapper,
  StatsFooter,
  Scrollable,
  SortControlButton,
} from '@/renderer/utils/common';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';

export const Referenda = ({ setSection, chainId }: ReferendaProps) => {
  const {
    referenda,
    fetchingReferenda,
    setFetchingReferenda,
    getSortedActiveReferenda,
    getCategorisedReferenda,
  } = useReferenda();

  const { isConnected } = useConnections();

  /// Sorting controls state.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  /// Calculate number of accordion panels needed.
  const indicesLength = Array.from(
    getCategorisedReferenda(newestFirst).keys()
  ).length;

  /// Accordion state.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: indicesLength }, (_, index) => index));

  /// Open all accordion items when new referenda is loaded.
  useEffect(() => {
    setAccordionActiveIndices(
      Array.from(
        {
          length: Array.from(getCategorisedReferenda(newestFirst).keys())
            .length,
        },
        (_, index) => index
      )
    );
    setExpandAll(true);
  }, [referenda]);

  /// Re-fetch referenda if app goes online from offline mode.
  useEffect(() => {
    if (isConnected) {
      setFetchingReferenda(true);

      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:referenda:get',
        data: {
          chainId,
        },
      });
    }
  }, [isConnected]);

  /// Utility for making expand button dynamic.
  const isExpandActive = () =>
    accordionActiveIndices.length ===
    Array.from(getCategorisedReferenda(newestFirst)).length;

  /// Render categorized referenda.
  const renderCategorised = () => (
    <section style={{ display: groupingOn ? 'block' : 'none' }}>
      <Accordion
        multiple
        defaultIndex={accordionActiveIndices}
        setExternalIndices={setAccordionActiveIndices}
      >
        {Array.from(getCategorisedReferenda(newestFirst).entries()).map(
          ([origin, infos], i) => (
            <AccordionItem key={`${origin}_referenda_group`}>
              <AccordionCaretHeader
                title={getSpacedOrigin(origin)}
                itemIndex={i}
                wide={true}
              />
              <AccordionPanel>
                <ReferendaGroup>
                  {infos.map((referendum, j) => (
                    <ReferendumRow
                      key={`${j}_${referendum.referendaId}`}
                      referendum={referendum}
                      index={j}
                    />
                  ))}
                </ReferendaGroup>
              </AccordionPanel>
            </AccordionItem>
          )
        )}
      </Accordion>
    </section>
  );

  /// Render referenda as single list.
  const renderListed = () => (
    <ReferendaGroup style={{ display: groupingOn ? 'none' : 'block' }}>
      {getSortedActiveReferenda(newestFirst).map((referendum, i) => (
        <ReferendumRow
          key={`${i}_${referendum.referendaId}`}
          referendum={referendum}
          index={i}
        />
      ))}
    </ReferendaGroup>
  );

  /// Handle expanding or collapsing all accordion panels.
  const handleExpandAll = () => {
    if (!groupingOn) {
      return;
    }

    if (expandAll) {
      setAccordionActiveIndices([]);
      setExpandAll(false);
    } else {
      setAccordionActiveIndices(
        Array.from(
          {
            length: Array.from(getCategorisedReferenda(newestFirst).keys())
              .length,
          },
          (_, index) => index
        )
      );
      setExpandAll(true);
    }
  };

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
          <ControlsWrapper $padBottom={!groupingOn}>
            <ButtonPrimaryInvert
              className="back-btn"
              text="Back"
              iconLeft={faCaretLeft}
              onClick={() => setSection(0)}
              style={{
                color:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
                borderColor:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
              }}
            />
            <SortControlButton
              isActive={newestFirst}
              isDisabled={!isConnected || fetchingReferenda}
              faIcon={faTimer}
              onClick={() => setNewestFirst(!newestFirst)}
              onLabel="Newest First"
              offLabel="Oldest First"
            />
            <SortControlButton
              isActive={groupingOn}
              isDisabled={!isConnected || fetchingReferenda}
              faIcon={faLayerGroup}
              onClick={() => setGroupingOn(!groupingOn)}
              onLabel="Grouping On"
              offLabel="Grouping Off"
            />
            <SortControlButton
              isActive={isExpandActive()}
              isDisabled={!isConnected || fetchingReferenda || !groupingOn}
              faIcon={faLineHeight}
              onClick={() => handleExpandAll()}
              onLabel="All Expanded"
              offLabel="Collapsed"
            />
          </ControlsWrapper>

          {/* Sticky Headings */}
          {!groupingOn && (
            <StickyHeadings>
              <div className="content-wrapper">
                <div className="left">
                  <div className="heading">ID</div>
                  <div className="heading">Origin</div>
                </div>
                <div className="right">
                  <div className="heading">OpenGov Portal Links</div>
                  <div className="heading">Subscriptions</div>
                </div>
              </div>
            </StickyHeadings>
          )}

          {/* List referenda */}
          <section>
            {!isConnected ? (
              <div style={{ padding: '0.5rem' }}>
                <p>Currently offline.</p>
                <p>Please reconnect to load OpenGov referenda.</p>
              </div>
            ) : (
              <div>
                {fetchingReferenda ? (
                  <>{renderPlaceholders(4)}</>
                ) : (
                  <>
                    {renderCategorised()}
                    {renderListed()}
                  </>
                )}
              </div>
            )}
          </section>
        </ContentWrapper>
      </Scrollable>
      <StatsFooter $chainId={chainId}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Chain:</h2>
              <span>{chainId}</span>
            </div>
            <div className="footer-stat">
              <h2>Active Referenda:</h2>
              <span>{fetchingReferenda ? '-' : referenda.length}</span>
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
