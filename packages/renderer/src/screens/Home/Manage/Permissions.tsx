// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../../theme/variables';

import { ItemsColumn } from './Wrappers';
import {
  executeOneShot,
  showGroupTooltip,
  toolTipTextFor,
  AccountsController,
  ConfigRenderer,
  IntervalsController,
} from '@polkadot-live/core';
import {
  ControlsWrapper,
  SortControlLabel,
  Switch,
} from '@polkadot-live/ui/components';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';
import { ellipsisFn } from '@w3ux/utils';
import { Flip, toast } from 'react-toastify';
import { PermissionRow } from './PermissionRow';
import { IntervalRow } from './IntervalRow';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';

/// Contexts.
import { useAppSettings } from '@ren/contexts/main/AppSettings';
import { useConnections } from '@ren/contexts/common';
import { useSubscriptions } from '@ren/contexts/main/Subscriptions';
import { useEffect, useState } from 'react';
import { useBootstrapping } from '@ren/contexts/main/Bootstrapping';
import { useManage } from '@ren/contexts/main/Manage';
import { useIntervalSubscriptions } from '@ren/contexts/main/IntervalSubscriptions';

/// Type imports.
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { PermissionsProps } from './types';
import type {
  SubscriptionTask,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export const Permissions = ({
  breadcrumb,
  section,
  selectedAccount,
  typeClicked,
  setSection,
}: PermissionsProps) => {
  const { showDebuggingSubscriptions } = useAppSettings();
  const { isConnecting } = useBootstrapping();
  const { darkMode, getOnlineMode, isImporting } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const { updateTask, handleQueuedToggle, toggleCategoryTasks, getTaskType } =
    useSubscriptions();

  const {
    activeChainId,
    renderedSubscriptions,
    dynamicIntervalTasksState,
    updateRenderedSubscriptions,
    tryUpdateDynamicIntervalTask,
    getCategorisedDynamicIntervals,
  } = useManage();

  const { updateIntervalSubscription } = useIntervalSubscriptions();

  /// Return subscription tasks mapped by category.
  const getCategorised = (): Map<TaskCategory, SubscriptionTask[]> => {
    const { tasks } = renderedSubscriptions;
    const map = new Map<TaskCategory, SubscriptionTask[]>();

    tasks.forEach((t) => {
      const category = t.category;

      if (map.has(category)) {
        const cur = map.get(category);
        if (cur !== undefined) {
          map.set(category, [...cur, { ...t }]);
        } else {
          map.set(category, [{ ...t }]);
        }
      } else {
        map.set(category, [{ ...t }]);
      }
    });

    return map;
  };

  // Categorised tasks state.
  const [categorisedTasks, setCategorisedTasks] = useState(
    new Map<TaskCategory, SubscriptionTask[]>(getCategorised())
  );

  // Mechanism to trigger re-caculating the accordion value AFTER the account state is updated.
  const [updateAccordionValue, setUpdateAccordionValue] = useState(false);

  /// Accordion state.
  const [accordionValueAccounts, setAccordionValueAccounts] = useState<
    string[]
  >([
    ...Array.from(categorisedTasks.values())
      .filter((tasks) =>
        tasks.length === 0 ? false : !showGroupTooltip(tasks[0])
      )
      .map((tasks) => tasks[0].category),
  ]);

  const [accordionValueChains, setAccordionValueChains] = useState<string[]>([
    'Chain',
  ]);
  const [accordionValueIntervals, setAccordionValueIntervals] = useState<
    string[]
  >([]);

  /// Go to section zero if all interval subscriptions have been removed.
  useEffect(() => {
    if (typeClicked === 'interval' && dynamicIntervalTasksState.length === 0) {
      setSection(0);
    }
  }, [dynamicIntervalTasksState]);

  /// Go to section zero if show debugging subscriptions setting turned off.
  useEffect(() => {
    !showDebuggingSubscriptions && setSection(0);
  }, [showDebuggingSubscriptions]);

  /// Update accordion interval indices if active chain has changed.
  useEffect(() => {
    setAccordionValueIntervals([]);
  }, [activeChainId]);

  /// Re-cache categorised tasks when subscription data changes.
  useEffect(() => {
    setCategorisedTasks(getCategorised());
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    } else if (typeClicked === 'chain') {
      setAccordionValueChains(['Chain']);
    }
  }, [renderedSubscriptions]);

  /// Trigger updating the accordion value when a new account is selected.
  useEffect(() => {
    setUpdateAccordionValue(true);
  }, [selectedAccount]);

  /// Close disabled subscription groups when loading account subscriptions.
  useEffect(() => {
    if (updateAccordionValue) {
      if (typeClicked === 'account') {
        setAccordionValueAccounts([
          ...Array.from(categorisedTasks.values())
            .filter((tasks) =>
              tasks.length === 0 ? false : !showGroupTooltip(tasks[0])
            )
            .map((tasks) => tasks[0].category),
        ]);
      }
      setUpdateAccordionValue(false);
    }
  }, [updateAccordionValue]);

  /// Handle a subscription toggle and update rendered subscription state.
  const handleToggle = async (task: SubscriptionTask) => {
    await handleQueuedToggle(task);
    updateRenderedSubscriptions(task);
  };

  /// Handle toggling a subscription task group switch.
  const handleGroupSwitch = async (category: TaskCategory) => {
    const isOn = getCategoryToggles().get(category) || false;

    await toggleCategoryTasks(
      category,
      isOn,
      renderedSubscriptions,
      updateRenderedSubscriptions
    );
  };

  /// TODO: Add `toggleable` field on subscription task type.
  /// Determine whether the toggle should be disabled based on the
  /// task and account data.
  const getDisabled = (task: SubscriptionTask) => {
    if (!getOnlineMode() || isConnecting || isImporting) {
      return true;
    }

    switch (task.action) {
      case 'subscribe:account:nominationPools:rewards':
      case 'subscribe:account:nominationPools:state':
      case 'subscribe:account:nominationPools:renamed':
      case 'subscribe:account:nominationPools:roles':
      case 'subscribe:account:nominationPools:commission': {
        return task.account?.nominationPoolData ? false : true;
      }
      case 'subscribe:account:nominating:pendingPayouts':
      case 'subscribe:account:nominating:exposure':
      case 'subscribe:account:nominating:commission':
      case 'subscribe:account:nominating:nominations': {
        return task.account?.nominatingData ? false : true;
      }
      default: {
        return false;
      }
    }
  };

  /// Determines if interval task should be disabled.
  const isIntervalTaskDisabled = () =>
    !getOnlineMode() || isConnecting || isImporting;

  const maybeAccountAddress =
    categorisedTasks.size > 0
      ? Array.from(categorisedTasks.values())[0][0].account?.address
      : null;

  /// Map category name to its global toggle state.
  const getCategoryToggles = () => {
    const map = new Map<TaskCategory, boolean>();

    // A category toggle is set if all of its tasks are enabled.
    for (const [category, tasks] of getCategorised().entries()) {
      const allToggled = tasks.reduce(
        (acc, task) => (acc ? (task.status === 'enable' ? true : false) : acc),
        true
      );

      map.set(category, allToggled);
    }

    return map;
  };

  /// Map referendum ID to its global toggle state.
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

  /// Handler for toggling the "global" switch for a referendum.
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
    switch (tasks[0].status) {
      case 'enable': {
        IntervalsController.insertSubscriptions(tasks);
        break;
      }
      case 'disable': {
        IntervalsController.removeSubscriptions(tasks);
        break;
      }
    }

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

  /// Handle a one-shot event for a subscription task.
  const handleOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: AnyFunction,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);
    task.enableOsNotifications = nativeChecked;
    const success = await executeOneShot(task);

    if (!success) {
      setOneShotProcessing(false);

      // Render error alert.
      toast.error('API timed out.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId: 'toast-connection',
      });
    } else {
      // Wait some time to avoid the spinner snapping.
      setTimeout(() => {
        setOneShotProcessing(false);
      }, 550);

      // Analytics.
      const { action, category } = task;
      window.myAPI.umamiEvent('oneshot-account', { action, category });
    }
  };

  /// Handle clicking the native checkbox.
  const handleNativeCheckbox = async (
    flag: boolean,
    task: SubscriptionTask
  ) => {
    // Update checkbox state.
    const checked: boolean = flag;

    if (task.account) {
      // Update received task.
      task.enableOsNotifications = checked;

      // Update persisted task data.
      await window.myAPI.sendSubscriptionTask({
        action: 'subscriptions:account:update',
        data: {
          serAccount: JSON.stringify(task.account!),
          serTask: JSON.stringify(task),
        },
      });

      // Update react state for tasks.
      updateTask('account', task, task.account.address);

      // Update dynamic tasks.
      updateRenderedSubscriptions(task);

      // Update cached task in account's query multi wrapper.
      const account = AccountsController.get(
        task.chainId,
        task.account.address
      );

      if (account) {
        account.queryMulti?.setOsNotificationsFlag(task);
      }
    }
  };

  /// Renders a list of categorised subscription tasks that can be toggled.
  const renderSubscriptionTasks = () => (
    <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
      <Accordion.Root
        className="AccordionRoot"
        type="multiple"
        value={
          typeClicked === 'account'
            ? accordionValueAccounts
            : accordionValueChains
        }
        onValueChange={(val) =>
          typeClicked === 'account'
            ? setAccordionValueAccounts(val as string[])
            : setAccordionValueChains(val as string[])
        }
      >
        <FlexColumn>
          {Array.from(categorisedTasks.entries()).map(([category, tasks]) => (
            <Accordion.Item
              key={category}
              className="AccordionItem"
              value={category}
            >
              {/** Basic trigger for debugging. */}
              {category === 'Chain' ? (
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <UI.TriggerHeader>{category}</UI.TriggerHeader>
                </UI.AccordionTrigger>
              ) : (
                <FlexRow $gap={'2px'}>
                  {/** Trigger for grouped account subscriptions. */}
                  <UI.AccordionTrigger narrow={true}>
                    <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    <UI.TriggerHeader>{category}</UI.TriggerHeader>
                  </UI.AccordionTrigger>
                  <div
                    className="HeaderContentDropdownWrapper"
                    style={{ cursor: 'default' }}
                  >
                    {showGroupTooltip(tasks[0]) ? (
                      <UI.TooltipRx
                        text={toolTipTextFor(category)}
                        theme={theme}
                        side={'left'}
                      >
                        <span>
                          <Switch
                            size="sm"
                            type="primary"
                            isOn={getCategoryToggles().get(category) || false}
                            disabled={getDisabled(tasks[0])}
                            handleToggle={async () =>
                              await handleGroupSwitch(category)
                            }
                          />
                        </span>
                      </UI.TooltipRx>
                    ) : (
                      <Switch
                        size="sm"
                        type="primary"
                        isOn={getCategoryToggles().get(category) || false}
                        disabled={getDisabled(tasks[0])}
                        handleToggle={async () =>
                          await handleGroupSwitch(category)
                        }
                      />
                    )}
                  </div>
                </FlexRow>
              )}
              <UI.AccordionContent transparent={true}>
                <ItemsColumn>
                  {tasks
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((task: SubscriptionTask) => (
                      <PermissionRow
                        key={`${category}-${task.action}`}
                        task={task}
                        handleToggle={handleToggle}
                        handleOneShot={handleOneShot}
                        handleNativeCheckbox={handleNativeCheckbox}
                        getDisabled={getDisabled}
                        getTaskType={getTaskType}
                      />
                    ))}
                </ItemsColumn>
              </UI.AccordionContent>
            </Accordion.Item>
          ))}
        </FlexColumn>
      </Accordion.Root>
    </UI.AccordionWrapper>
  );

  /// Render a list of interval subscription tasks that can be toggled.
  const renderIntervalSubscriptionTasks = () => (
    <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
      <Accordion.Root
        className="AccordionRoot"
        type="multiple"
        value={accordionValueIntervals}
        onValueChange={(val) => setAccordionValueIntervals(val as string[])}
      >
        <FlexColumn>
          {Array.from(getCategorisedDynamicIntervals().entries()).map(
            ([referendumId, intervalTasks]) => (
              <Accordion.Item
                key={`${referendumId}_interval_subscriptions`}
                className="AccordionItem"
                value={String(referendumId)}
              >
                <FlexRow $gap={'2px'}>
                  <UI.AccordionTrigger narrow={true}>
                    <ChevronDownIcon className="AccordionChevron" aria-hidden />
                    <UI.TriggerHeader>
                      Referendum {referendumId}
                    </UI.TriggerHeader>
                  </UI.AccordionTrigger>
                  <div
                    className="HeaderContentDropdownWrapper"
                    style={{ cursor: 'default' }}
                  >
                    <Switch
                      disabled={isIntervalTaskDisabled()}
                      size="sm"
                      type="primary"
                      isOn={
                        getOpenGovGlobalToggles().get(referendumId) || false
                      }
                      handleToggle={async () =>
                        await toggleGlobalSwitch(
                          referendumId,
                          getOpenGovGlobalToggles().get(referendumId) || false
                        )
                      }
                    />
                  </div>
                </FlexRow>
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
        </FlexColumn>
      </Accordion.Root>
    </UI.AccordionWrapper>
  );

  return (
    <>
      <ControlsWrapper $sticky={false}>
        <div className="left">
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => setSection(0)}
          />
          {typeClicked === 'account' && maybeAccountAddress ? (
            <UI.TooltipRx
              text={ellipsisFn(maybeAccountAddress, 12)}
              theme={theme}
              side="bottom"
            >
              <span>
                <SortControlLabel label={breadcrumb} />
              </span>
            </UI.TooltipRx>
          ) : (
            <SortControlLabel label={breadcrumb} />
          )}
        </div>
      </ControlsWrapper>

      <FlexColumn style={{ marginTop: '1.5rem' }}>
        {/* Render separate accordions for account and chain subscription tasks. */}
        {typeClicked === 'account' && renderSubscriptionTasks()}
        {typeClicked === 'chain' && renderSubscriptionTasks()}
        {typeClicked === 'interval' && renderIntervalSubscriptionTasks()}
      </FlexColumn>
    </>
  );
};
