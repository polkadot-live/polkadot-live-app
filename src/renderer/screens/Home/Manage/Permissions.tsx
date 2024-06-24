// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { AccountsWrapper } from './Wrappers';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { AccordionCaretSwitchHeader } from '@app/library/Accordion/AccordionCaretHeaders';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { ellipsisFn } from '@w3ux/utils';
import { executeOneShot } from '@/renderer/callbacks/oneshots';
import { executeIntervaledOneShot } from '@/renderer/callbacks/intervaled';
import { Flip, toast } from 'react-toastify';
import { PermissionRow } from './PermissionRow';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import { IntervalRow } from './IntervalRow';
import { Switch } from '@/renderer/library/Switch';
import {
  getTooltipClassForGroup,
  toolTipTextFor,
} from '@app/utils/renderingUtils';
import { ControlsWrapper, SortControlLabel } from '@/renderer/utils/common';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { faCaretLeft } from '@fortawesome/pro-solid-svg-icons';

/// Contexts.
import { useAppSettings } from '@/renderer/contexts/main/AppSettings';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { useEffect, useState, useRef } from 'react';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { useManage } from '@/renderer/contexts/main/Manage';
import { useIntervalSubscriptions } from '@/renderer/contexts/main/IntervalSubscriptions';

/// Type imports.
import type { AnyFunction } from '@/types/misc';
import type { PermissionsProps } from './types';
import type {
  IntervalSubscription,
  SubscriptionTask,
  TaskCategory,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

export const Permissions = ({
  breadcrumb,
  section,
  typeClicked,
  setSection,
}: PermissionsProps) => {
  const { setTooltipTextAndOpen } = useTooltip();
  const { showDebuggingSubscriptions } = useAppSettings();
  const { online: isOnline, isConnecting } = useBootstrapping();

  const { updateTask, handleQueuedToggle, toggleCategoryTasks, getTaskType } =
    useSubscriptions();

  const {
    activeChainId,
    renderedSubscriptions,
    dynamicIntervalTasksState,
    updateRenderedSubscriptions,
    tryUpdateDynamicIntervalTask,
    tryRemoveIntervalSubscription,
    getCategorizedDynamicIntervals,
  } = useManage();

  const { updateIntervalSubscription, removeIntervalSubscription } =
    useIntervalSubscriptions();

  /// Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >([0, 1, 2]);

  /// Active accordion indices for chain subscription tasks categories.
  const [accordionActiveChainIndices, setAccordionActiveChainIndices] =
    useState<number[]>([0]);

  /// Active accordion indices for interval subscription task categories.
  const [accordionActiveIntervalIndices, setAccordionActiveIntervalIndices] =
    useState<number[]>([]);

  /// Ref to keep track of number of interval categories being rendered.
  const numIntervalCategoresRef = useRef(
    Array.from(getCategorizedDynamicIntervals().keys()).length
  );

  useEffect(() => {
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    }
  }, [renderedSubscriptions]);

  /// Go to section zero if all interval subscriptions have been removed.
  useEffect(() => {
    if (typeClicked === 'interval' && dynamicIntervalTasksState.length === 0) {
      setSection(0);
    }

    // Close all accordion panels if new category has been added.
    if (typeClicked === 'interval') {
      const newLength = Array.from(
        getCategorizedDynamicIntervals().keys()
      ).length;

      if (newLength !== numIntervalCategoresRef.current) {
        numIntervalCategoresRef.current = newLength;
        setAccordionActiveIntervalIndices([]);
      }
    }
  }, [dynamicIntervalTasksState]);

  /// Go to section zero if show debugging subscriptions setting turned off.
  useEffect(() => {
    !showDebuggingSubscriptions && setSection(0);
  }, [showDebuggingSubscriptions]);

  /// Update accordion interval indices if active chain has changed.
  useEffect(() => {
    setAccordionActiveIntervalIndices([]);
  }, [activeChainId]);

  /// Handle a subscription toggle and update rendered subscription state.
  const handleToggle = async (cached: WrappedSubscriptionTasks) => {
    await handleQueuedToggle(cached);

    // Update rendererd subscription tasks state.
    const task = cached.tasks[0];
    task.status = task.status === 'enable' ? 'disable' : 'enable';
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

  /// Handle toggling an interval subscription.
  const handleIntervalToggle = async (task: IntervalSubscription) => {
    // Invert task status.
    const newStatus = task.status === 'enable' ? 'disable' : 'enable';
    task.status = newStatus;

    // Handle task in intervals controller.
    switch (newStatus) {
      case 'enable': {
        IntervalsController.insertSubscription({ ...task });
        break;
      }
      case 'disable': {
        IntervalsController.removeSubscription({ ...task });
        break;
      }
    }

    // Update main renderer state.
    updateIntervalSubscription({ ...task });
    tryUpdateDynamicIntervalTask({ ...task });

    // Update OpenGov renderer state.
    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:task:update',
      data: {
        serialized: JSON.stringify(task),
      },
    });

    // Update persisted task in store.
    await window.myAPI.updateIntervalTask(JSON.stringify(task));
  };

  /// TODO: Add `toggleable` field on subscription task type.
  /// Determine whether the toggle should be disabled based on the
  /// task and account data.
  const getDisabled = (task: SubscriptionTask) => {
    if (!isOnline || isConnecting) {
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
      case 'subscribe:account:nominating:commission': {
        return task.account?.nominatingData ? false : true;
      }
      default: {
        return false;
      }
    }
  };

  /// Determines if interval task should be disabled.
  const isIntervalTaskDisabled = () => !isOnline || isConnecting;

  /// Get unique key for the task row component.
  const getKey = (
    type: string,
    action: string,
    chainId: string,
    address: string | undefined
  ) =>
    address
      ? `${type}_${chainId}_${address}_${action}`
      : `${type}_${chainId}_${action}`;

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

  /// Cache categorised tasks and account address (if account was clicked).
  const categorisedTasks = getCategorised();

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
    ] of getCategorizedDynamicIntervals().entries()) {
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

      ConfigRenderer.portToOpenGov.postMessage({
        task: 'openGov:task:update',
        data: {
          serialized: JSON.stringify(task),
        },
      });

      await window.myAPI.updateIntervalTask(JSON.stringify(task));
    }
  };

  /// Handle a one-shot event for a subscription task.
  const handleOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: AnyFunction,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);
    task.enableOsNotifications = nativeChecked;
    const result = await executeOneShot(task);

    if (!result) {
      setOneShotProcessing(false);

      // Render error alert.
      toast.error('API timed out.', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
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
    }
  };

  /// Handle a one-shot event for a subscription task.
  const handleIntervalOneShot = async (
    task: IntervalSubscription,
    nativeChecked: boolean,
    setOneShotProcessing: AnyFunction
  ) => {
    setOneShotProcessing(true);
    task.enableOsNotifications = nativeChecked;
    const { success, message } = await executeIntervaledOneShot(
      task,
      'one-shot'
    );

    if (!success) {
      setOneShotProcessing(false);

      // Render error alert.
      toast.error(message ? message : 'Error', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
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
    }
  };

  /// Handle clicking the native checkbox.
  const handleNativeCheckbox = async (
    flag: boolean,
    task: SubscriptionTask,
    setNativeChecked: AnyFunction
  ) => {
    // Update checkbox state.
    const checked: boolean = flag;
    setNativeChecked(checked);

    if (task.account) {
      // Update received task.
      task.enableOsNotifications = checked;

      // Update persisted task data.
      await window.myAPI.updatePersistedAccountTask(
        JSON.stringify(task),
        JSON.stringify(task.account!)
      );

      // Update react state for tasks.
      updateTask('account', task, task.account.address);

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

  /// Handle clicking native os notifications toggle for interval subscriptions.
  const handleIntervalNativeCheckbox = async (
    task: IntervalSubscription,
    flag: boolean
  ) => {
    const checked: boolean = flag;
    task.enableOsNotifications = checked;

    // Update task data in intervals controller.
    IntervalsController.updateSubscription({ ...task });

    // Update main renderer state.
    updateIntervalSubscription({ ...task });
    tryUpdateDynamicIntervalTask({ ...task });

    // Update OpenGov renderer state.
    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:task:update',
      data: {
        serialized: JSON.stringify(task),
      },
    });

    // Update persisted task in store.
    await window.myAPI.updateIntervalTask(JSON.stringify(task));
  };

  /// Handle removing an interval subscription.
  const handleRemoveIntervalSubscription = async (
    task: IntervalSubscription
  ) => {
    // Remove task from interval controller.
    task.status === 'enable' &&
      IntervalsController.removeSubscription({ ...task }, isOnline);
    // Set status to disable.
    task.status = 'disable';
    // Remove task from dynamic manage state if necessary.
    tryRemoveIntervalSubscription({ ...task });
    // Remove task from React state for rendering.
    removeIntervalSubscription({ ...task });
    // Remove task from store.
    await window.myAPI.removeIntervalTask(JSON.stringify(task));
    // Send message to OpenGov window to update its subscription state.
    ConfigRenderer.portToOpenGov.postMessage({
      task: 'openGov:task:removed',
      data: { serialized: JSON.stringify(task) },
    });
  };

  /// Handle setting a new interval duration for the subscription.
  const handleChangeIntervalDuration = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    task: IntervalSubscription,
    setIntervalSetting: (ticksToWait: number) => void
  ) => {
    const newSetting: number = parseInt(event.target.value);
    const settingObj = IntervalsController.durations.find(
      (setting) => setting.ticksToWait === newSetting
    );

    if (settingObj) {
      setIntervalSetting(newSetting);

      // Update task state.
      task.intervalSetting = settingObj;
      updateIntervalSubscription({ ...task });
      tryUpdateDynamicIntervalTask({ ...task });
      // Update managed task in intervals controller.
      IntervalsController.updateSubscription({ ...task });
      // Update state in OpenGov window.
      ConfigRenderer.portToOpenGov.postMessage({
        task: 'openGov:task:update',
        data: {
          serialized: JSON.stringify(task),
        },
      });
      // Update persisted task in store.
      await window.myAPI.updateIntervalTask(JSON.stringify(task));
    }
  };

  /// Get dynamic accordion indices state for account categories or
  /// static accordion indices for chain categories.
  const getAccordionIndices = () =>
    typeClicked === 'account'
      ? accordionActiveIndices
      : accordionActiveChainIndices;

  /// Provide the external indices setter if we are about to render
  /// account subscription tasks in the accordion.
  const getAccordionIndicesSetter = () =>
    typeClicked === 'account'
      ? setAccordionActiveIndices
      : setAccordionActiveChainIndices;

  /// Renders a list of categorised subscription tasks that can be toggled.
  const renderSubscriptionTasks = () => (
    <Accordion
      multiple
      defaultIndex={getAccordionIndices()}
      setExternalIndices={getAccordionIndicesSetter()}
    >
      {Array.from(categorisedTasks.entries()).map(([category, tasks], j) => (
        <AccordionItem key={`${category}_${j}`}>
          <AccordionCaretSwitchHeader
            title={category}
            itemIndex={j}
            SwitchComponent={
              <div
                className={getTooltipClassForGroup(tasks[0])}
                data-tooltip={toolTipTextFor(category)}
                onMouseMove={() =>
                  setTooltipTextAndOpen(toolTipTextFor(category), 'left')
                }
              >
                <Switch
                  size="sm"
                  type="primary"
                  isOn={getCategoryToggles().get(category) || false}
                  disabled={getDisabled(tasks[0])}
                  handleToggle={async () => await handleGroupSwitch(category)}
                />
              </div>
            }
          />
          <AccordionPanel>
            <div className="flex-column" style={{ padding: '0 0.75rem' }}>
              {tasks
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((task: SubscriptionTask, i: number) => (
                  <PermissionRow
                    key={`${i}_${getKey(category, task.action, task.chainId, task.account?.address)}`}
                    task={task}
                    handleToggle={handleToggle}
                    handleOneShot={handleOneShot}
                    handleNativeCheckbox={handleNativeCheckbox}
                    getDisabled={getDisabled}
                    getTaskType={getTaskType}
                  />
                ))}
            </div>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );

  /// Render a list of interval subscription tasks that can be toggled.
  const renderIntervalSubscriptionTasks = () => (
    <Accordion
      multiple
      defaultIndex={accordionActiveIntervalIndices}
      setExternalIndices={setAccordionActiveIntervalIndices}
    >
      {Array.from(getCategorizedDynamicIntervals().entries()).map(
        ([referendumId, intervalTasks], i) => (
          <AccordionItem key={`${referendumId}_interval_subscriptions`}>
            <AccordionCaretSwitchHeader
              title={`Referendum ${referendumId}`}
              itemIndex={i}
              SwitchComponent={
                <Switch
                  disabled={isIntervalTaskDisabled()}
                  size="sm"
                  type="primary"
                  isOn={getOpenGovGlobalToggles().get(referendumId) || false}
                  handleToggle={async () =>
                    await toggleGlobalSwitch(
                      referendumId,
                      getOpenGovGlobalToggles().get(referendumId) || false
                    )
                  }
                />
              }
            />
            <AccordionPanel>
              <div className="flex-column" style={{ padding: '0 0.75rem' }}>
                {intervalTasks.map((task: IntervalSubscription, j: number) => (
                  <IntervalRow
                    key={`${j}_${task.referendumId}_${task.action}`}
                    handleIntervalToggle={handleIntervalToggle}
                    handleIntervalNativeCheckbox={handleIntervalNativeCheckbox}
                    handleChangeIntervalDuration={handleChangeIntervalDuration}
                    handleIntervalOneShot={handleIntervalOneShot}
                    handleRemoveIntervalSubscription={
                      handleRemoveIntervalSubscription
                    }
                    isTaskDisabled={isIntervalTaskDisabled}
                    task={task}
                  />
                ))}
              </div>
            </AccordionPanel>
          </AccordionItem>
        )
      )}
    </Accordion>
  );

  return (
    <>
      <ControlsWrapper $sticky={true}>
        <div className="left">
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => setSection(0)}
          />
          {typeClicked === 'account' ? (
            <div
              className="tooltip-trigger-element"
              data-tooltip-text={ellipsisFn(maybeAccountAddress || '', 16)}
              onMouseMove={() =>
                setTooltipTextAndOpen(
                  ellipsisFn(maybeAccountAddress || '', 16),
                  'bottom'
                )
              }
            >
              <SortControlLabel label={breadcrumb} />
            </div>
          ) : (
            <SortControlLabel label={breadcrumb} />
          )}
        </div>
        <div className="right">
          <SortControlLabel label={'Subscription On / Off'} noBorder={true} />
        </div>
      </ControlsWrapper>

      <AccountsWrapper>
        {/* Render separate accordions for account and chain subscription tasks. */}
        {typeClicked === 'account' && renderSubscriptionTasks()}
        {typeClicked === 'chain' && renderSubscriptionTasks()}
        {typeClicked === 'interval' && renderIntervalSubscriptionTasks()}
      </AccountsWrapper>
    </>
  );
};
