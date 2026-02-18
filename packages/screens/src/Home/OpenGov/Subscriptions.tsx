// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useApiHealth,
  useChainEvents,
  useConnections,
  useContextProxy,
  useIntervalSubscriptions,
  useIntervalTasksManager,
} from '@polkadot-live/contexts';
import * as Style from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { SubscriptionRow } from '../ChainEvents/SubscriptionRow';
import { Header } from '../Manage/Subscriptions/Header';
import { DialogManageRef, DialogRemoveRef } from './Dialogs';
import { IntervalRow } from './IntervalRow';
import type { SubscriptionsProps } from './types';

export const Subscriptions = ({
  breadcrumb,
  setSection,
}: SubscriptionsProps) => {
  const { useCtx } = useContextProxy();
  const { isConnecting } = useCtx('BootstrappingCtx')();
  const { hasConnectionIssue } = useApiHealth();
  const { cacheGet, getOnlineMode } = useConnections();
  const { subscriptions, getCategorised, updateIntervalSubscription } =
    useIntervalSubscriptions();

  const {
    insertSubscriptions,
    handleIntervalAnalytics,
    updateIntervalTask,
    removeSubscriptions,
  } = useIntervalTasksManager();

  const {
    activeRefChain,
    getCategorisedRefsForChain,
    refActiveSubCount,
    setActiveRefChain,
  } = useChainEvents();

  const isImportingData = cacheGet('backup:importing');

  const [accordionValEvents, setAccordionValEvents] = useState<string>('');

  // Utility to determine if a connection issue exists.
  const showConnectionIssue = (): boolean =>
    activeRefChain ? hasConnectionIssue(activeRefChain) : false;

  // Total active subscription count.
  const activeCount = (refId: number): number => {
    const smart = refActiveSubCount(refId);
    if (!activeRefChain) {
      return smart;
    }
    const chainSubs = subscriptions.get(activeRefChain) ?? [];
    const classic = chainSubs.filter(
      (s) => s.referendumId === refId && s.status === 'enable',
    ).length;
    return smart + classic;
  };

  // Determines if interval task should be disabled.
  const isIntervalTaskDisabled = (): boolean =>
    !getOnlineMode() ||
    showConnectionIssue() ||
    isConnecting ||
    isImportingData;

  // Map referendum ID to its global toggle state.
  const getOpenGovGlobalToggles = () => {
    const map = new Map<number, boolean>();

    // A "global" toggle is set if all of its tasks are enabled.
    for (const [refId, subs] of getCategorised().entries()) {
      const allToggled = subs.reduce(
        (acc, task) => (acc ? task.status === 'enable' : acc),
        true,
      );
      map.set(refId, allToggled);
    }
    return map;
  };

  // Handler for toggling the "global" switch for a referendum.
  const toggleGlobalSwitch = async (referendumId: number, isOn: boolean) => {
    // Get all tasks with the target status.
    const targetStatus = isOn ? 'enable' : 'disable';

    // Get dynamic tasks under the referendum ID with target status and invert it.
    const subs = activeRefChain
      ? (subscriptions.get(activeRefChain) ?? [])
      : [];

    const tasks = subs
      .filter(
        (t) => t.referendumId === referendumId && t.status === targetStatus,
      )
      .map((t) => {
        t.status = t.status === 'enable' ? 'disable' : 'enable';
        return t;
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    // Return early if there are no tasks to toggle.
    if (tasks.length === 0) {
      return;
    }
    // Update managed tasks in intervals controller.
    tasks[0].status === 'enable'
      ? insertSubscriptions(tasks)
      : removeSubscriptions(tasks);

    // Update React and store state.
    for (const task of tasks) {
      updateIntervalSubscription({ ...task });
      updateIntervalTask(task);
      handleIntervalAnalytics(task);
    }
  };

  return (
    <>
      <DialogRemoveRef />
      <UI.ControlsWrapper $sticky={false} style={{ marginBottom: '1.5rem' }}>
        <div className="left">
          <UI.ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={FA.faCaretLeft}
            onClick={() => {
              setActiveRefChain(null);
              setSection(0);
            }}
          />
          <UI.SortControlLabel label={breadcrumb} />
        </div>
        <Style.FlexRow className="right" style={{ paddingRight: '0.25rem' }}>
          <DialogManageRef activeRefs={getCategorisedRefsForChain()} />
        </Style.FlexRow>
      </UI.ControlsWrapper>

      {!getOnlineMode() && <UI.OfflineBanner rounded={true} />}
      {getOnlineMode() && showConnectionIssue() && (
        <UI.OfflineBanner
          rounded={true}
          text={'Reconnect chain to restore API access.'}
        />
      )}

      <UI.ScreenInfoCard style={{ marginBottom: '1rem' }}>
        <div>Toggle referenda subscriptions.</div>
      </UI.ScreenInfoCard>

      <Style.FlexColumn>
        <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
          <Accordion.Root
            className="AccordionRoot"
            collapsible={true}
            type="single"
            value={accordionValEvents}
            onValueChange={(val) => setAccordionValEvents(val as string)}
          >
            <Style.FlexColumn $rowGap="2px">
              {Object.entries(getCategorisedRefsForChain()).map(
                ([refId, subs]) => (
                  <Accordion.Item
                    key={refId}
                    className="AccordionItem"
                    value={refId}
                  >
                    <Style.FlexRow $gap={'2px'}>
                      <UI.AccordionTrigger narrow={true}>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        <UI.TriggerHeader>
                          <Style.FlexRow>
                            <span style={{ flex: 1 }}>Referendum {refId}</span>
                            {activeCount(parseInt(refId, 10)) > 0 && (
                              <FontAwesomeIcon
                                className="splotch"
                                icon={FA.faSplotch}
                              />
                            )}
                          </Style.FlexRow>
                        </UI.TriggerHeader>
                      </UI.AccordionTrigger>
                    </Style.FlexRow>

                    <UI.AccordionContent transparent={true} topGap={'2px'}>
                      <Style.FlexColumn style={{ margin: '1rem 0' }}>
                        <Style.FlexRow>
                          <Header label="Classic">
                            <span style={{ scale: '0.85' }}>
                              <UI.Switch
                                disabled={isIntervalTaskDisabled()}
                                size="sm"
                                type="primary"
                                isOn={
                                  getOpenGovGlobalToggles().get(
                                    parseInt(refId, 10),
                                  ) || false
                                }
                                handleToggle={async () =>
                                  await toggleGlobalSwitch(
                                    parseInt(refId, 10),
                                    getOpenGovGlobalToggles().get(
                                      parseInt(refId, 10),
                                    ) || false,
                                  )
                                }
                              />
                            </span>
                          </Header>
                        </Style.FlexRow>

                        {Array.from(getCategorised().entries())
                          .filter(([rid]) => parseInt(refId, 10) === rid)
                          .map(([referendumId, intervalTasks]) => (
                            <Style.ItemsColumn key={`classic-${referendumId}`}>
                              {intervalTasks
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((task) => (
                                  <IntervalRow
                                    key={`${task.referendumId}_${task.action}`}
                                    task={task}
                                  />
                                ))}
                            </Style.ItemsColumn>
                          ))}

                        <Header label="Smart" />
                        <Style.ItemsColumn>
                          {subs.map((sub, i) => (
                            <SubscriptionRow
                              key={`${refId}-${sub.eventName}-${i}`}
                              subscription={sub}
                            />
                          ))}
                        </Style.ItemsColumn>
                      </Style.FlexColumn>
                    </UI.AccordionContent>
                  </Accordion.Item>
                ),
              )}
            </Style.FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </Style.FlexColumn>
    </>
  );
};
