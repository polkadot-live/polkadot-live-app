// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Style from '@polkadot-live/styles/wrappers';
import {
  useApiHealth,
  useChainEvents,
  useConnections,
  useContextProxy,
  useIntervalSubscriptions,
  useIntervalTasksManager,
  useManage,
} from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { IntervalRow } from './IntervalRow';
import { faCaretLeft, faSplotch } from '@fortawesome/free-solid-svg-icons';
import { Header } from '../Manage/Subscriptions/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SubscriptionRow } from '../ChainEvents/SubscriptionRow';
import type { SubscriptionsProps } from './types';

export const Subscriptions = ({
  breadcrumb,
  setSection,
}: SubscriptionsProps) => {
  const { useCtx } = useContextProxy();
  const { isConnecting } = useCtx('BootstrappingCtx')();
  const { hasConnectionIssue } = useApiHealth();
  const { cacheGet, getOnlineMode } = useConnections();
  const { updateIntervalSubscription } = useIntervalSubscriptions();

  const {
    insertSubscriptions,
    handleIntervalAnalytics,
    updateIntervalTask,
    removeSubscriptions,
  } = useIntervalTasksManager();

  const {
    dynamicIntervalTasksState,
    tryUpdateDynamicIntervalTask,
    getCategorisedDynamicIntervals,
  } = useManage();

  const {
    activeRefChain,
    getCategorisedRefsForChain,
    refActiveSubCount,
    setActiveRefChain,
  } = useChainEvents();

  const isImportingData = cacheGet('backup:importing');

  const [accordionValEvents, setAccordionValEvents] = useState<
    string | undefined
  >(undefined);

  /**
   * Go to section zero if all interval subscriptions have been removed.
   */
  useEffect(() => {
    if (dynamicIntervalTasksState.length === 0) {
      setSection(0);
    }
  }, [dynamicIntervalTasksState]);

  /**
   * Determines if interval task should be disabled.
   */
  const isIntervalTaskDisabled = () =>
    !getOnlineMode() ||
    showConnectionIssue() ||
    isConnecting ||
    isImportingData;

  /**
   * Map referendum ID to its global toggle state.
   */
  const getOpenGovGlobalToggles = () => {
    const map = new Map<number, boolean>();

    // A "global" toggle is set if all of its tasks are enabled.
    for (const [
      referendumId,
      intervalTasks,
    ] of getCategorisedDynamicIntervals().entries()) {
      const allToggled = intervalTasks.reduce(
        (acc, task) => (acc ? (task.status === 'enable' ? true : false) : acc),
        true
      );

      map.set(referendumId, allToggled);
    }
    return map;
  };

  /**
   * Handler for toggling the "global" switch for a referendum.
   */
  const toggleGlobalSwitch = async (referendumId: number, isOn: boolean) => {
    // Get all tasks with the target status.
    const targetStatus = isOn ? 'enable' : 'disable';

    // Get dynamic tasks under the referendum ID with target status and invert it.
    const tasks = dynamicIntervalTasksState
      .filter(
        (t) => t.referendumId === referendumId && t.status === targetStatus
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
      tryUpdateDynamicIntervalTask({ ...task });
      updateIntervalTask(task);
      handleIntervalAnalytics(task);
    }
  };

  /**
   * Utility to determine if a connection issue exists.
   */
  const showConnectionIssue = (): boolean =>
    activeRefChain ? hasConnectionIssue(activeRefChain) : false;

  return (
    <>
      <UI.ControlsWrapper $sticky={false} style={{ marginBottom: '1.5rem' }}>
        <div className="left">
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => {
              setActiveRefChain(null);
              setSection(0);
            }}
          />
          <UI.SortControlLabel label={breadcrumb} />
        </div>
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
                            {refActiveSubCount(parseInt(refId)) > 0 && (
                              <FontAwesomeIcon
                                style={{ color: 'var(--accent-primary)' }}
                                icon={faSplotch}
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
                                    parseInt(refId)
                                  ) || false
                                }
                                handleToggle={async () =>
                                  await toggleGlobalSwitch(
                                    parseInt(refId),
                                    getOpenGovGlobalToggles().get(
                                      parseInt(refId)
                                    ) || false
                                  )
                                }
                              />
                            </span>
                          </Header>
                        </Style.FlexRow>

                        {Array.from(getCategorisedDynamicIntervals().entries())
                          .filter(([rid]) => parseInt(refId) === rid)
                          .map(([referendumId, intervalTasks]) => (
                            <Style.ItemsColumn key={`classic-${referendumId}`}>
                              {intervalTasks.map((task) => (
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
                )
              )}
            </Style.FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </Style.FlexColumn>
    </>
  );
};
