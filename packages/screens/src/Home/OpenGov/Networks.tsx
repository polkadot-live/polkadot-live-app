// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBell, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useChainEvents,
  useConnections,
  useIntervalSubscriptions,
} from '@polkadot-live/contexts';
import * as Style from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { getNetworkColor } from '../Wrappers';
import { DialogManageRef, DialogRemoveRef } from './Dialogs';
import {
  RefCard,
  RefCardContent,
  RefCardHeader,
  RefChevron,
  RefIconCircle,
  RefName,
  RefStatsRow,
  RefSubCountBadge,
} from './Wrappers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NetworksProps } from './types';

export const Networks = ({
  section,
  setBreadcrumb,
  setSection,
}: NetworksProps) => {
  const { openTab } = useConnections();
  const { subscriptions } = useIntervalSubscriptions();
  const {
    activeRefChain,
    refSubscriptions,
    getActiveRefIds,
    refHasActiveSubs,
    setActiveRefChain,
    updateSelectedRef,
  } = useChainEvents();

  // Accordion state.
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const [isReferendaAdded, setIsReferendaAdded] = useState(true);

  const handleClickRef = (chainId: ChainID, refId: number) => {
    setActiveRefChain(chainId);
    updateSelectedRef(refId);
    setBreadcrumb(`Referendum ${refId}`);
    setSection(1);
  };

  // Determine if a chain has active subscriptions.
  const refHasSubs = (chainId: ChainID, refId: number): boolean => {
    const hasSmart = refHasActiveSubs(chainId, refId);
    const hasClassic = Boolean(
      subscriptions
        .get(chainId)
        ?.find((s) => s.referendumId === refId && s.status === 'enable'),
    );
    return hasSmart || hasClassic;
  };

  // Counts for interval and referenda subscriptions.
  const getCounts = (chainId: ChainID, refId: number) => {
    const interval = (subscriptions.get(chainId) ?? []).filter(
      (s) => s.referendumId === refId,
    );
    const eventSubs = refSubscriptions.get(chainId)?.get(refId) ?? [];

    const active =
      interval.filter((s) => s.status === 'enable').length +
      eventSubs.filter((s) => s.enabled).length;

    const osNotify =
      interval.filter((s) => s.enableOsNotifications).length +
      eventSubs.filter((s) => s.osNotify).length;

    return { active, osNotify };
  };

  const getChainRefIds = () => {
    const acc = new Map<ChainID, Set<number>>();

    // Collect refIds from interval subscriptions.
    subscriptions.forEach((subs, chainId) => {
      subs?.forEach((s) => {
        const refId = s?.referendumId;
        if (Number.isInteger(refId)) {
          if (!acc.has(chainId)) acc.set(chainId, new Set());
          acc.get(chainId)!.add(refId as number);
        }
      });
    });

    // Collect refIds from chain event subscriptions.
    refSubscriptions.forEach((innerMap, chainId) => {
      innerMap?.forEach((_, refId) => {
        if (!acc.has(chainId)) acc.set(chainId, new Set());
        acc.get(chainId)!.add(refId);
      });
    });

    // Build a Record<ChainID, number[]> with deduped, sorted ids. Omit empty chains.
    const result: Record<ChainID, number[]> = {} as Record<ChainID, number[]>;
    acc.forEach((set, chainId) => {
      const arr = Array.from(set).sort((a, b) => a - b);
      if (arr.length > 0) result[chainId] = arr;
    });

    return result;
  };

  useEffect(() => {
    setAccordionValue(Object.keys(getChainRefIds()));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const activeIds = await getActiveRefIds();
      setIsReferendaAdded(activeIds.length > 0);
    };
    fetch();
  }, [activeRefChain, section, subscriptions]);

  return (
    <>
      <DialogRemoveRef />
      <div style={{ width: '100%' }}>
        <UI.ScreenInfoCard>
          <div>Select a referendum to manage subscriptions.</div>
        </UI.ScreenInfoCard>

        {!isReferendaAdded ? (
          <UI.NoOpenGov
            onClick={() =>
              openTab('openGov', {
                event: 'window-open-openGov',
                data: null,
              })
            }
          />
        ) : (
          <UI.AccordionWrapper style={{ marginTop: '0.75rem' }}>
            <Accordion.Root
              style={{ marginBottom: '1rem' }}
              className="AccordionRoot"
              type="multiple"
              value={accordionValue}
              onValueChange={(val) => setAccordionValue(val as string[])}
            >
              <Style.FlexColumn $rowGap="0.6rem">
                {Object.entries(getChainRefIds())
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([cid, refIds]) => (
                    <Accordion.Item
                      key={cid}
                      className="AccordionItem"
                      value={cid}
                    >
                      <Style.FlexRow $gap={'2px'}>
                        <UI.AccordionTrigger narrow={true}>
                          <ChevronDownIcon
                            className="AccordionChevron"
                            aria-hidden
                          />
                          <UI.TriggerHeader>{cid}</UI.TriggerHeader>
                        </UI.AccordionTrigger>
                        <div
                          className="HeaderContentDropdownWrapper"
                          style={{ padding: 0 }}
                        >
                          <DialogManageRef
                            refIds={refIds}
                            chainId={cid as ChainID}
                          />
                        </div>
                      </Style.FlexRow>

                      <UI.AccordionContent
                        transparent={true}
                        className={'AccordionContentReduce'}
                      >
                        <Style.FlexColumn $rowGap="0.6rem">
                          {refIds.map((refId, i) => {
                            const color = getNetworkColor(cid as ChainID);
                            const { active, osNotify } = getCounts(
                              cid as ChainID,
                              refId,
                            );

                            return (
                              <RefCard
                                $accentColor={color}
                                key={`referendum_item_${i}`}
                                onClick={() =>
                                  handleClickRef(cid as ChainID, refId)
                                }
                              >
                                <RefIconCircle $color={color}>
                                  <UI.ChainIcon
                                    chainId={cid as ChainID}
                                    width={20}
                                  />
                                </RefIconCircle>

                                <RefCardContent>
                                  <RefCardHeader>
                                    <RefName>{`Referendum ${refId}`}</RefName>
                                  </RefCardHeader>

                                  <RefStatsRow
                                    $color={color}
                                    $inactive={active === 0}
                                  >
                                    <span className="stat-pill">
                                      Active
                                      <span className="stat-value">
                                        {active}
                                      </span>
                                    </span>
                                    <span className="stat-pill">
                                      <FontAwesomeIcon icon={faBell} />
                                      <span className="stat-value">
                                        {osNotify}
                                      </span>
                                    </span>
                                  </RefStatsRow>
                                </RefCardContent>

                                {refHasSubs(cid as ChainID, refId) && (
                                  <RefSubCountBadge
                                    $color={color}
                                    $active={true}
                                  >
                                    {active}
                                  </RefSubCountBadge>
                                )}

                                <RefChevron>
                                  <FontAwesomeIcon icon={faChevronRight} />
                                </RefChevron>
                              </RefCard>
                            );
                          })}
                        </Style.FlexColumn>
                      </UI.AccordionContent>
                    </Accordion.Item>
                  ))}
              </Style.FlexColumn>
            </Accordion.Root>
          </UI.AccordionWrapper>
        )}
      </div>
    </>
  );
};
