// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Style from '@polkadot-live/ui/styles';
import { ConfigRenderer, IntervalsController } from '@polkadot-live/core';

import {
  useBootstrapping,
  useIntervalSubscriptions,
  useManage,
} from '@ren/contexts/main';
import { useConnections } from '@ren/contexts/common';
import { useEffect, useState } from 'react';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { ItemsColumn } from '../Manage/Wrappers';
import { IntervalRow } from './IntervalRow';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import type { SubscriptionsProps } from './types';

export const Subscriptions = ({
  breadcrumb,
  setSection,
}: SubscriptionsProps) => {
  const { isConnecting } = useBootstrapping();
  const { cacheGet, getOnlineMode } = useConnections();
  const { updateIntervalSubscription } = useIntervalSubscriptions();

  const {
    activeChainId,
    dynamicIntervalTasksState,
    tryUpdateDynamicIntervalTask,
    getCategorisedDynamicIntervals,
  } = useManage();

  const [accordionValueIntervals, setAccordionValueIntervals] = useState<
    string[]
  >([]);

  const isImportingData = cacheGet('backup:importing');

  /**
   * Go to section zero if all interval subscriptions have been removed.
   */
  useEffect(() => {
    if (dynamicIntervalTasksState.length === 0) {
      setSection(0);
    }
  }, [dynamicIntervalTasksState]);

  /**
   * Update accordion interval indices if active chain has changed.
   */
  useEffect(() => {
    setAccordionValueIntervals([]);
  }, [activeChainId]);

  /**
   * Determines if interval task should be disabled.
   */
  const isIntervalTaskDisabled = () =>
    !getOnlineMode() || isConnecting || isImportingData;

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
      ? IntervalsController.insertSubscriptions(tasks)
      : IntervalsController.removeSubscriptions(
          cacheGet('mode:connected'),
          tasks
        );

    // Update React and store state.
    for (const task of tasks) {
      updateIntervalSubscription({ ...task });
      tryUpdateDynamicIntervalTask({ ...task });

      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:task:update',
        data: {
          serialized: JSON.stringify(task),
        },
      });

      await window.myAPI.sendIntervalTask({
        action: 'interval:task:update',
        data: { serialized: JSON.stringify(task) },
      });
    }

    // Analytics.
    const event = `subscriptions-interval-category-${targetStatus === 'enable' ? 'off' : 'on'}`;
    const { category, chainId } = tasks[0];
    window.myAPI.umamiEvent(event, { category, chainId });
  };

  return (
    <>
      <UI.ControlsWrapper $sticky={false} style={{ marginBottom: '1.5rem' }}>
        <div className="left">
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => setSection(0)}
          />
          <UI.SortControlLabel label={breadcrumb} />
        </div>
      </UI.ControlsWrapper>

      {!getOnlineMode() && <UI.OfflineBanner rounded={true} />}

      <Style.FlexColumn>
        <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
          <Accordion.Root
            className="AccordionRoot"
            type="multiple"
            value={accordionValueIntervals}
            onValueChange={(val) => setAccordionValueIntervals(val as string[])}
          >
            <Style.FlexColumn>
              {Array.from(getCategorisedDynamicIntervals().entries()).map(
                ([referendumId, intervalTasks]) => (
                  <Accordion.Item
                    key={`${referendumId}_interval_subscriptions`}
                    className="AccordionItem"
                    value={String(referendumId)}
                  >
                    <Style.FlexRow $gap={'2px'}>
                      <UI.AccordionTrigger narrow={true}>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        <UI.TriggerHeader>
                          Referendum {referendumId}
                        </UI.TriggerHeader>
                      </UI.AccordionTrigger>
                      <div
                        className="HeaderContentDropdownWrapper"
                        style={{ cursor: 'default' }}
                      >
                        <UI.Switch
                          disabled={isIntervalTaskDisabled()}
                          size="sm"
                          type="primary"
                          isOn={
                            getOpenGovGlobalToggles().get(referendumId) || false
                          }
                          handleToggle={async () =>
                            await toggleGlobalSwitch(
                              referendumId,
                              getOpenGovGlobalToggles().get(referendumId) ||
                                false
                            )
                          }
                        />
                      </div>
                    </Style.FlexRow>
                    <UI.AccordionContent transparent={true}>
                      <ItemsColumn>
                        {intervalTasks.map((task) => (
                          <IntervalRow
                            key={`${task.referendumId}_${task.action}`}
                            task={task}
                          />
                        ))}
                      </ItemsColumn>
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
