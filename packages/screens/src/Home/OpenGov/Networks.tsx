// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChevronRight, faSplotch } from '@fortawesome/free-solid-svg-icons';
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
import { DialogManageRef, DialogRemoveRef } from './Dialogs';
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
    setSelectedRef,
  } = useChainEvents();

  const [isReferendaAdded, setIsReferendaAdded] = useState(true);

  const handleClickRef = (chainId: ChainID, refId: number) => {
    setActiveRefChain(chainId);
    setSelectedRef(refId);
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

  const getChainRefIds = () => {
    const acc = new Map<ChainID, Set<number>>();

    // Collect refIds from interval subscriptions.
    subscriptions.forEach((subs, chainId) => {
      subs?.forEach((s) => {
        const refId = s?.referendumId;
        if (Number.isInteger(refId)) {
          !acc.has(chainId)
            ? acc.set(chainId, new Set())
            : acc.get(chainId)!.add(refId as number);
        }
      });
    });

    // Collect refIds from chain event subscriptions.
    refSubscriptions.forEach((innerMap, chainId) => {
      innerMap?.forEach((_, refId) => {
        !acc.has(chainId)
          ? acc.set(chainId, new Set())
          : acc.get(chainId)!.add(refId);
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

  // Accordion state.
  const [accordionValue, setAccordionValue] = useState<string[]>(
    Object.keys(getChainRefIds()),
  );

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
          <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
            <Accordion.Root
              style={{ marginBottom: '1rem' }}
              className="AccordionRoot"
              type="multiple"
              value={accordionValue}
              onValueChange={(val) => setAccordionValue(val as string[])}
            >
              <Style.FlexColumn>
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
                        <Style.ItemsColumn>
                          {refIds.map((refId, i) => (
                            <Style.ItemEntryWrapper
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              key={`referendum_item_${i}`}
                              onClick={() =>
                                handleClickRef(cid as ChainID, refId)
                              }
                            >
                              <div className="inner">
                                <div>
                                  <span>
                                    <UI.ChainIcon
                                      chainId={cid as ChainID}
                                      width={16}
                                    />
                                  </span>
                                  <div className="content">
                                    <h3>Referendum {refId}</h3>
                                  </div>
                                </div>
                                <Style.FlexRow>
                                  {refHasSubs(cid as ChainID, refId) && (
                                    <FontAwesomeIcon
                                      className="splotch"
                                      icon={faSplotch}
                                    />
                                  )}
                                  <UI.ButtonText
                                    text=""
                                    iconRight={faChevronRight}
                                    iconTransform="shrink-3"
                                  />
                                </Style.FlexRow>
                              </div>
                            </Style.ItemEntryWrapper>
                          ))}
                        </Style.ItemsColumn>
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
