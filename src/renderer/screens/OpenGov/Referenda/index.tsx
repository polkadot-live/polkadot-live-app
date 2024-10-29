// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
  ControlsWrapper,
  SortControlButton,
} from '@app/library/components';
import { ContentWrapper } from '@app/screens/Wrappers';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import {
  faCaretLeft,
  faLayerGroup,
  faUpDown,
  faSort,
  faArrowsRotate,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@/renderer/contexts/common/Connections';
import { useEffect, useState } from 'react';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { getSpacedOrigin } from '@/renderer/utils/openGovUtils';
import { ReferendumRow } from './ReferendumRow';
import { NoteWrapper } from './Wrappers';
import { Scrollable, StatsFooter } from '@/renderer/library/styles';
import { renderPlaceholders } from '@/renderer/library/utils';
import { useReferendaSubscriptions } from '@/renderer/contexts/openGov/ReferendaSubscriptions';
import type { ReferendaProps } from '../types';
import { ItemsColumn } from '../../Home/Manage/Wrappers';

export const Referenda = ({ setSection }: ReferendaProps) => {
  const { isConnected } = useConnections();
  const { setTooltipTextAndOpen } = useTooltip();

  const {
    referenda,
    fetchingReferenda,
    activeReferendaChainId: chainId,
    refetchReferenda,
    setFetchingReferenda,
    getSortedActiveReferenda,
    getCategorisedReferenda,
  } = useReferenda();

  const { isSubscribedToReferendum, isNotSubscribedToAny } =
    useReferendaSubscriptions();

  /// Sorting controls state.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [onlySubscribed, setOnlySubscribed] = useState(false);

  /// Calculate number of accordion panels needed.
  const indicesLength = Array.from(
    getCategorisedReferenda(newestFirst).keys()
  ).length;

  /// Accordion state.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: indicesLength }, (_, index) => index));

  /// Get subscribed referenda only.
  const getSubscribedReferenda = () =>
    referenda.filter((r) => isSubscribedToReferendum(chainId, r));

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

  /// Re-fetch referenda when user clicks refresh button.
  const handleRefetchReferenda = () => {
    refetchReferenda();
  };

  /// Utility for making expand button dynamic.
  const isExpandActive = () => {
    let length = 0;
    if (onlySubscribed) {
      const rs = getSubscribedReferenda();
      const map = getCategorisedReferenda(newestFirst, rs);
      length = Array.from(map.keys()).length;
    } else {
      const map = getCategorisedReferenda(newestFirst);
      length = Array.from(map.keys()).length;
    }

    return accordionActiveIndices.length === length;
  };

  /// Render categorized referenda.
  const renderCategorised = () => (
    <section
      style={{ display: groupingOn && !onlySubscribed ? 'block' : 'none' }}
    >
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
                <ItemsColumn>
                  {infos.map((referendum, j) => (
                    <ReferendumRow
                      key={`${j}_${referendum.referendaId}`}
                      referendum={referendum}
                      index={j}
                    />
                  ))}
                </ItemsColumn>
              </AccordionPanel>
            </AccordionItem>
          )
        )}
      </Accordion>
    </section>
  );

  /// Render categorised subscribed referenda.
  const renderSubscribedCategorised = () => {
    const display = groupingOn && onlySubscribed ? 'block' : 'none';

    return isNotSubscribedToAny(chainId) ? (
      <div style={{ display }}>
        <p style={{ marginTop: '20px' }}>
          You have not subscribed to any referenda.
        </p>
      </div>
    ) : (
      <section style={{ display }}>
        <Accordion
          multiple
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
        >
          {Array.from(
            getCategorisedReferenda(
              newestFirst,
              getSubscribedReferenda()
            ).entries()
          ).map(([origin, infos], i) => (
            <AccordionItem key={`${origin}_subscribed_referenda_group`}>
              <AccordionCaretHeader
                title={getSpacedOrigin(origin)}
                itemIndex={i}
                wide={true}
              />
              <AccordionPanel>
                <ItemsColumn>
                  {infos.map((referendum, j) => (
                    <ReferendumRow
                      key={`${j}_${referendum.referendaId}`}
                      referendum={referendum}
                      index={j}
                    />
                  ))}
                </ItemsColumn>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    );
  };

  /// Render referenda as single list.
  const renderListed = () => (
    <ItemsColumn
      style={{ display: groupingOn || onlySubscribed ? 'none' : 'flex' }}
    >
      {getSortedActiveReferenda(newestFirst).map((referendum, i) => (
        <ReferendumRow
          key={`${i}_${referendum.referendaId}`}
          referendum={referendum}
          index={i}
        />
      ))}
    </ItemsColumn>
  );

  /// Render subscribed referenda as a single list.
  const renderSubscribedListed = () => {
    const display = groupingOn || !onlySubscribed ? 'none' : 'flex';

    return isNotSubscribedToAny(chainId) ? (
      <div style={{ display }}>
        <p>You have not subscribed to any referenda.</p>
      </div>
    ) : (
      <ItemsColumn style={{ display }}>
        {getSortedActiveReferenda(newestFirst, getSubscribedReferenda()).map(
          (referendum, i) => (
            <ReferendumRow
              key={`${i}_${referendum.referendaId}_subscribed`}
              referendum={referendum}
              index={i}
            />
          )
        )}
      </ItemsColumn>
    );
  };

  /// Handle expanding or collapsing all accordion panels.
  const handleExpandAll = () => {
    if (!groupingOn) {
      return;
    }

    if (expandAll) {
      setAccordionActiveIndices([]);
      setExpandAll(false);
    } else {
      // Handle categorised all or subscribed referenda.
      let length = 0;
      if (onlySubscribed) {
        const rs = getSubscribedReferenda();
        const map = getCategorisedReferenda(newestFirst, rs);
        length = Array.from(map.keys()).length;
      } else {
        const map = getCategorisedReferenda(newestFirst);
        length = Array.from(map.keys()).length;
      }

      setAccordionActiveIndices(Array.from({ length }, (_, index) => index));
      setExpandAll(true);
    }
  };

  /// Handle clicking only subscribed button.
  const handleToggleOnlySubscribed = () => {
    const target = !onlySubscribed;

    let length = 0;
    if (target) {
      const rs = getSubscribedReferenda();
      const map = getCategorisedReferenda(newestFirst, rs);
      length = Array.from(map.keys()).length;
    } else {
      const map = getCategorisedReferenda(newestFirst);
      length = Array.from(map.keys()).length;
    }

    setAccordionActiveIndices(Array.from({ length }, (_, index) => index));
    setOnlySubscribed(!onlySubscribed);
  };

  return (
    <>
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
              faIcon={faSort}
              onClick={() => setNewestFirst(!newestFirst)}
              onLabel="Newest First"
              offLabel="Oldest First"
            />
            <SortControlButton
              isActive={groupingOn}
              isDisabled={!isConnected || fetchingReferenda}
              faIcon={faLayerGroup}
              onClick={() => setGroupingOn(!groupingOn)}
              onLabel="Grouping"
              offLabel="Grouping"
              fixedWidth={false}
            />
            <SortControlButton
              isActive={isExpandActive()}
              isDisabled={!isConnected || fetchingReferenda || !groupingOn}
              faIcon={faUpDown}
              onClick={() => handleExpandAll()}
              onLabel="Expanded"
              offLabel="Collapsed"
              fixedWidth={false}
            />
            <div
              className="tooltip-trigger-element"
              data-tooltip-text={
                isConnected ? 'Refresh Referenda' : 'Currently Offline'
              }
              onMouseMove={() =>
                setTooltipTextAndOpen(
                  isConnected ? 'Refresh Referenda' : 'Currently Offline'
                )
              }
            >
              <SortControlButton
                isActive={true}
                isDisabled={fetchingReferenda || !isConnected}
                onClick={() => handleRefetchReferenda()}
                faIcon={faArrowsRotate}
                fixedWidth={false}
              />
            </div>
            <div
              className="tooltip-trigger-element"
              data-tooltip-text={
                isConnected ? 'Show Subscribed' : 'Currently Offline'
              }
              onMouseMove={() =>
                setTooltipTextAndOpen(
                  isConnected ? 'Show Subscribed' : 'Currently Offline'
                )
              }
            >
              <SortControlButton
                isActive={onlySubscribed}
                isDisabled={!isConnected || fetchingReferenda}
                faIcon={faEllipsisVertical}
                onClick={() => handleToggleOnlySubscribed()}
                fixedWidth={false}
              />
            </div>
          </ControlsWrapper>

          {/* Only Subscribed Notice */}
          {onlySubscribed && (
            <NoteWrapper>
              <div className="note-wrapper">
                <span>Note:</span>
                <p>
                  You are viewing only referenda that you are subscribed to.
                </p>
              </div>
            </NoteWrapper>
          )}

          {/* List referenda */}
          <section>
            {!isConnected ? (
              <div style={{ padding: '0.5rem' }}>
                <p>Currently offline.</p>
                <p>Please reconnect to load OpenGov referenda.</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                {fetchingReferenda ? (
                  <>{renderPlaceholders(4)}</>
                ) : (
                  <>
                    {renderCategorised()}
                    {renderListed()}
                    {renderSubscribedCategorised()}
                    {renderSubscribedListed()}
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
              <h2>Active Referenda:</h2>
              <span style={{ minWidth: '14px' }}>
                {fetchingReferenda ? '-' : referenda.length}
              </span>
            </div>
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
