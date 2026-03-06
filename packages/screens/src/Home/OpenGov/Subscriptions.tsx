// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
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
import { SubscriptionRow } from '../ChainEvents/SubscriptionRow';
import { Header } from '../Manage/Subscriptions/Header';
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
    selectedRef,
    getCategorisedRefsForChain,
    refActiveSubCount,
    setActiveRefChain,
  } = useChainEvents();

  const isImportingData = cacheGet('backup:importing');

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
      <UI.ControlsWrapper $sticky={false} style={{ marginBottom: '1.25rem' }}>
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
          {selectedRef && (
            <UI.SortControlLabel
              label={`${activeCount(selectedRef).toString()} Active`}
            />
          )}
        </div>
      </UI.ControlsWrapper>

      {!getOnlineMode() && <UI.OfflineBanner rounded={true} />}
      {getOnlineMode() && showConnectionIssue() && (
        <UI.OfflineBanner
          rounded={true}
          text={'Reconnect chain to restore API access.'}
        />
      )}

      <UI.ScreenInfoCard>
        <div>Toggle referenda subscriptions.</div>
      </UI.ScreenInfoCard>

      {selectedRef && (
        <Style.FlexColumn>
          <Style.FlexColumn $rowGap="0.6rem" style={{ margin: '0.75rem 0' }}>
            <Style.FlexRow>
              <Header label="Classic">
                <span style={{ scale: '0.85' }}>
                  <UI.Switch
                    disabled={isIntervalTaskDisabled()}
                    size="sm"
                    type="primary"
                    isOn={
                      selectedRef
                        ? getOpenGovGlobalToggles().get(selectedRef)
                        : false
                    }
                    handleToggle={async () => {
                      if (selectedRef) {
                        await toggleGlobalSwitch(
                          selectedRef,
                          getOpenGovGlobalToggles().get(selectedRef) || false,
                        );
                      }
                    }}
                  />
                </span>
              </Header>
            </Style.FlexRow>

            {Array.from(getCategorised().entries())
              .filter(([rid]) => selectedRef === rid)
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
              {selectedRef &&
                getCategorisedRefsForChain().map((sub, i) => (
                  <SubscriptionRow
                    key={`${selectedRef}-${sub.eventName}-${i}`}
                    subscription={sub}
                  />
                ))}
            </Style.ItemsColumn>
          </Style.FlexColumn>
        </Style.FlexColumn>
      )}
    </>
  );
};
