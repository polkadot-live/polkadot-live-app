// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import { useEffect, useState } from 'react';
import { useConnections } from '@ren/contexts/common';
import {
  useApiHealth,
  useAppSettings,
  useBootstrapping,
  useManage,
  useSubscriptions,
} from '@ren/contexts/main';
import {
  executeOneShot,
  showGroupTooltip,
  toolTipTextFor,
  AccountsController,
  SubscriptionsController,
} from '@polkadot-live/core';
import { ellipsisFn } from '@w3ux/utils';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { FlexColumn, FlexRow } from '@polkadot-live/styles/wrappers';
import { ItemsColumn } from './Wrappers';
import { PermissionRow } from './PermissionRow';
import { renderToast } from '@polkadot-live/ui/utils';
import type { AnyFunction } from '@polkadot-live/types/misc';
import type { PermissionsProps } from './types';
import type {
  SubscriptionTask,
  TaskCategory,
} from '@polkadot-live/types/subscriptions';

export const Permissions = ({
  breadcrumb,
  section,
  selectedAccount,
  tasksChainId,
  typeClicked,
  setSection,
}: PermissionsProps) => {
  const { cacheGet: settingsCacheGet } = useAppSettings();
  const showDebuggingSubscriptions = settingsCacheGet(
    'setting:show-debugging-subscriptions'
  );

  const { hasConnectionIssue } = useApiHealth();
  const { isConnecting } = useBootstrapping();
  const { cacheGet, getTheme, getOnlineMode } = useConnections();
  const { renderedSubscriptions } = useManage();
  const { handleQueuedToggle, toggleCategoryTasks, getTaskType } =
    useSubscriptions();

  const isImportingData = cacheGet('backup:importing');
  const theme = getTheme();

  /**
   * Return subscription tasks mapped by category.
   */
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

  /**
   * Categorised tasks state.
   */
  const [categorisedTasks, setCategorisedTasks] = useState(
    new Map<TaskCategory, SubscriptionTask[]>(getCategorised())
  );

  /**
   * Mechanism to trigger re-caculating the accordion value AFTER the account state is updated.
   */
  const [updateAccordionValue, setUpdateAccordionValue] = useState(false);

  /**
   * Accordion state.
   */
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

  /**
   * Go to section zero if show debugging subscriptions setting turned off.
   */
  useEffect(() => {
    !showDebuggingSubscriptions && setSection(0);
  }, [showDebuggingSubscriptions]);

  /**
   * Re-cache categorised tasks when subscription data changes.
   */
  useEffect(() => {
    setCategorisedTasks(getCategorised());
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    } else if (typeClicked === 'chain') {
      setAccordionValueChains(['Chain']);
    }
  }, [renderedSubscriptions]);

  /**
   * Trigger updating the accordion value when a new account is selected.
   */
  useEffect(() => {
    setUpdateAccordionValue(true);
  }, [selectedAccount]);

  /**
   * Close disabled subscription groups when loading account subscriptions.
   */
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

  /**
   * Handle a subscription toggle and update rendered subscription state.
   */
  const handleToggle = async (task: SubscriptionTask) => {
    await handleQueuedToggle(task);
  };

  /**
   * Handle toggling a subscription task group switch.
   */
  const handleGroupSwitch = async (category: TaskCategory) => {
    const isOn = getCategoryToggles().get(category) || false;
    await toggleCategoryTasks(category, isOn, renderedSubscriptions);
  };

  /**
   * TODO: Add `toggleable` field on subscription task type.
   * Determine whether the toggle should be disabled based on the
   * task and account data.
   */
  const getDisabled = (task: SubscriptionTask) => {
    const { action, account, chainId } = task;
    const failed = hasConnectionIssue(chainId);

    if (!getOnlineMode() || isConnecting || isImportingData || failed) {
      return true;
    } else if (action.startsWith('subscribe:account:nominationPools')) {
      return account?.nominationPoolData ? false : true;
    } else if (action.startsWith('subscribe:account:nominating')) {
      return account?.nominatingData ? false : true;
    } else {
      return false;
    }
  };

  const maybeAccountAddress =
    categorisedTasks.size > 0
      ? Array.from(categorisedTasks.values())[0][0].account?.address
      : null;

  /**
   * Map category name to its global toggle state.
   */
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

  /**
   * Handle a one-shot event for a subscription task.
   */
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
      renderToast('API timed out.', 'toast-connection', 'error', 'top-right');
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

  /**
   * Handle clicking the native checkbox.
   */
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
      SubscriptionsController.updateTaskState(task);

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

  /**
   * Utility to determine if a connection issue exists.
   */
  const showConnectionIssue = (): boolean =>
    tasksChainId ? hasConnectionIssue(tasksChainId) : false;

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
          {typeClicked === 'account' && maybeAccountAddress ? (
            <UI.TooltipRx
              text={ellipsisFn(maybeAccountAddress, 12)}
              theme={theme}
              side="bottom"
            >
              <span>
                <UI.SortControlLabel label={breadcrumb} />
              </span>
            </UI.TooltipRx>
          ) : (
            <UI.SortControlLabel label={breadcrumb} />
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

      <FlexColumn>
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
              {Array.from(categorisedTasks.entries()).map(
                ([category, tasks]) => (
                  <Accordion.Item
                    key={category}
                    className="AccordionItem"
                    value={category}
                  >
                    {/** Basic trigger for debugging. */}
                    {category === 'Chain' ? (
                      <UI.AccordionTrigger narrow={true}>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        <UI.TriggerHeader>{category}</UI.TriggerHeader>
                      </UI.AccordionTrigger>
                    ) : (
                      <FlexRow $gap={'2px'}>
                        {/** Trigger for grouped account subscriptions. */}
                        <UI.AccordionTrigger narrow={true}>
                          <ChevronDownIcon
                            className="AccordionChevron"
                            aria-hidden
                          />
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
                                <UI.Switch
                                  size="sm"
                                  type="primary"
                                  isOn={
                                    getCategoryToggles().get(category) || false
                                  }
                                  disabled={getDisabled(tasks[0])}
                                  handleToggle={async () =>
                                    await handleGroupSwitch(category)
                                  }
                                />
                              </span>
                            </UI.TooltipRx>
                          ) : (
                            <UI.Switch
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
                )
              )}
            </FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </FlexColumn>
    </>
  );
};
