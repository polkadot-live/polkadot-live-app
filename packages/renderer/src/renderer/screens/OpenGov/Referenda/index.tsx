// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import * as AccordionRx from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import { LinksFooter } from '@app/Utils';

import {
  ControlsWrapper,
  SortControlButton,
} from '@polkadot-live/ui/components';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import {
  faCaretLeft,
  faLayerGroup,
  faUpDown,
  faSort,
  faArrowsRotate,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect, useState } from 'react';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { getSpacedOrigin } from '@app/utils/openGovUtils';
import { ReferendumRow } from './ReferendumRow';
import { NoteWrapper } from './Wrappers';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { useReferendaSubscriptions } from '@app/contexts/openGov/ReferendaSubscriptions';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { ReferendaProps } from '../types';

export const Referenda = ({ setSection }: ReferendaProps) => {
  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

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

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<string[]>([
    ...getCategorisedReferenda(newestFirst).keys(),
  ]);

  /// Get subscribed referenda only.
  const getSubscribedReferenda = () =>
    referenda.filter((r) => isSubscribedToReferendum(chainId, r));

  /// Open all accordion items when new referenda is loaded.
  useEffect(() => {
    setAccordionValue([...getCategorisedReferenda(newestFirst).keys()]);
    setExpandAll(true);
  }, [referenda]);

  /// Re-fetch referenda if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode()) {
      setFetchingReferenda(true);

      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:referenda:get',
        data: {
          chainId,
        },
      });
    }
  }, [getOnlineMode()]);

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

    return accordionValue.length === length;
  };

  /// Render categorized referenda.
  const renderCategorised = () => (
    <section
      style={{ display: groupingOn && !onlySubscribed ? 'block' : 'none' }}
    >
      <UI.AccordionWrapper $onePart={true}>
        <AccordionRx.Root
          className="AccordionRoot"
          type="multiple"
          value={accordionValue}
          onValueChange={(val) => setAccordionValue(val as string[])}
        >
          <Styles.FlexColumn>
            {Array.from(getCategorisedReferenda(newestFirst).entries()).map(
              ([origin, infos]) => (
                <AccordionRx.Item
                  key={`${origin}_referenda_group`}
                  className="AccordionItem"
                  value={origin}
                >
                  <UI.AccordionTrigger narrow={true}>
                    <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    <UI.TriggerHeader>
                      {getSpacedOrigin(origin)}
                    </UI.TriggerHeader>
                  </UI.AccordionTrigger>
                  <UI.AccordionContent transparent={true}>
                    <ItemsColumn>
                      {infos.map((referendum, j) => (
                        <ReferendumRow
                          key={`${j}_${referendum.referendaId}`}
                          referendum={referendum}
                          index={j}
                        />
                      ))}
                    </ItemsColumn>
                  </UI.AccordionContent>
                </AccordionRx.Item>
              )
            )}
          </Styles.FlexColumn>
        </AccordionRx.Root>
      </UI.AccordionWrapper>
    </section>
  );

  /// Render categorised subscribed referenda.
  const renderSubscribedCategorised = () => {
    const display = groupingOn && onlySubscribed ? 'block' : 'none';

    return isNotSubscribedToAny(chainId) ? (
      <div style={{ display }}>
        <p>You have not subscribed to any referenda.</p>
      </div>
    ) : (
      <section style={{ display }}>
        <UI.AccordionWrapper $onePart={true}>
          <AccordionRx.Root
            className="AccordionRoot"
            type="multiple"
            value={accordionValue}
            onValueChange={(val) => setAccordionValue(val as string[])}
          >
            <Styles.FlexColumn>
              {Array.from(
                getCategorisedReferenda(
                  newestFirst,
                  getSubscribedReferenda()
                ).entries()
              ).map(([origin, infos]) => (
                <AccordionRx.Item
                  key={`${origin}_subscribed_referenda_group`}
                  className="AccordionItem"
                  value={origin}
                >
                  <UI.AccordionTrigger narrow={true}>
                    <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    <UI.TriggerHeader>
                      {getSpacedOrigin(origin)}
                    </UI.TriggerHeader>
                  </UI.AccordionTrigger>
                  <UI.AccordionContent transparent={true} narrow={true}>
                    <ItemsColumn>
                      {infos.map((referendum, j) => (
                        <ReferendumRow
                          key={`${j}_${referendum.referendaId}`}
                          referendum={referendum}
                          index={j}
                        />
                      ))}
                    </ItemsColumn>
                  </UI.AccordionContent>
                </AccordionRx.Item>
              ))}
            </Styles.FlexColumn>
          </AccordionRx.Root>
        </UI.AccordionWrapper>
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
      setAccordionValue([]);
      setExpandAll(false);
    } else {
      // Handle categorised all or subscribed referenda.
      if (onlySubscribed) {
        const rs = getSubscribedReferenda();
        setAccordionValue([...getCategorisedReferenda(newestFirst, rs).keys()]);
      } else {
        setAccordionValue([...getCategorisedReferenda(newestFirst).keys()]);
      }

      setExpandAll(true);
    }
  };

  /// Handle clicking only subscribed button.
  const handleToggleOnlySubscribed = () => {
    if (!onlySubscribed) {
      const rs = getSubscribedReferenda();
      setAccordionValue([...getCategorisedReferenda(newestFirst, rs).keys()]);
    } else {
      setAccordionValue([...getCategorisedReferenda(newestFirst).keys()]);
    }

    setOnlySubscribed(!onlySubscribed);
  };

  return (
    <UI.ScrollableMax>
      <Styles.PadWrapper>
        <Styles.FlexColumn $rowGap={'1.5rem'}>
          <section>
            <Styles.FlexColumn>
              <UI.ActionItem showIcon={false} text={`${chainId} Referenda`} />
              {/* Sorting controls */}
              <ControlsWrapper
                className="ReferendaControls"
                $padBottom={!groupingOn}
              >
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
                  isDisabled={!getOnlineMode() || fetchingReferenda}
                  faIcon={faSort}
                  onClick={() => setNewestFirst(!newestFirst)}
                  onLabel="Newest First"
                  offLabel="Oldest First"
                  respClass="ReferendaControls"
                />
                <SortControlButton
                  isActive={groupingOn}
                  isDisabled={!getOnlineMode() || fetchingReferenda}
                  faIcon={faLayerGroup}
                  onClick={() => setGroupingOn(!groupingOn)}
                  onLabel="Grouping"
                  offLabel="Grouping"
                  fixedWidth={false}
                  respClass="ReferendaControls"
                />
                <SortControlButton
                  isActive={isExpandActive()}
                  isDisabled={
                    !getOnlineMode() || fetchingReferenda || !groupingOn
                  }
                  faIcon={faUpDown}
                  onClick={() => handleExpandAll()}
                  onLabel="Expanded"
                  offLabel="Collapsed"
                  fixedWidth={false}
                  respClass="ReferendaControls"
                />
                <UI.TooltipRx
                  theme={theme}
                  text={
                    getOnlineMode() ? 'Refresh Referenda' : 'Currently Offline'
                  }
                >
                  <span>
                    <SortControlButton
                      isActive={true}
                      isDisabled={fetchingReferenda || !getOnlineMode()}
                      onClick={() => handleRefetchReferenda()}
                      faIcon={faArrowsRotate}
                      fixedWidth={false}
                      respClass="ReferendaControls"
                    />
                  </span>
                </UI.TooltipRx>
                <UI.TooltipRx
                  theme={theme}
                  text={
                    getOnlineMode() ? 'Show Subscribed' : 'Currently Offline'
                  }
                >
                  <span>
                    <SortControlButton
                      isActive={onlySubscribed}
                      isDisabled={!getOnlineMode() || fetchingReferenda}
                      faIcon={faEllipsisVertical}
                      onClick={() => handleToggleOnlySubscribed()}
                      fixedWidth={false}
                      respClass="ReferendaControls"
                    />
                  </span>
                </UI.TooltipRx>
              </ControlsWrapper>
            </Styles.FlexColumn>
          </section>

          <section>
            <Styles.FlexColumn>
              {/* Only Subscribed Notice */}
              {onlySubscribed && (
                <NoteWrapper>
                  <Styles.FlexRow>
                    <span>Note:</span>
                    <p>
                      You are viewing only referenda that you are subscribed to.
                    </p>
                  </Styles.FlexRow>
                </NoteWrapper>
              )}

              {/* List referenda */}
              {!getOnlineMode() ? (
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
                      {renderSubscribedCategorised()}
                      {renderSubscribedListed()}
                    </>
                  )}
                </div>
              )}
            </Styles.FlexColumn>
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <LinksFooter />
    </UI.ScrollableMax>
  );
};
