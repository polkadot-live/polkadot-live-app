// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccountsWrapper,
  BreadcrumbsWrapper,
  HeadingWrapper,
} from './Wrappers';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { executeOneShot } from '@/renderer/callbacks/oneshots';
import {
  faAngleLeft,
  faCaretDown,
  faCaretRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PermissionRow } from './PermissionRow';
import { Switch } from '@/renderer/library/Switch';
import { useSubscriptions } from '@/renderer/contexts/Subscriptions';
import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/renderer/contexts/OnlineStatus';
import { useManage } from './provider';
import type { AnyFunction } from '@w3ux/utils/types';
import type { PermissionsProps } from './types';
import type {
  SubscriptionTask,
  WrappedSubscriptionTasks,
} from '@/types/subscriptions';

export const Permissions = ({
  breadcrumb,
  section,
  typeClicked,
  setSection,
}: PermissionsProps) => {
  const { online: isOnline } = useOnlineStatus();
  const { updateRenderedSubscriptions, renderedSubscriptions } = useManage();
  const { updateTask, handleQueuedToggle, toggleCategoryTasks, getTaskType } =
    useSubscriptions();

  // Active accordion indices for account subscription tasks categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >([0, 1, 2]);

  // Active accordion indices for chain subscription tasks categories.
  const [accordionActiveChainIndices, setAccordionActiveChainIndices] =
    useState<number[]>([0]);

  useEffect(() => {
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    }
  }, [renderedSubscriptions]);

  /// Handle a toggle and update rendered subscription state.
  const handleToggle = async (
    cached: WrappedSubscriptionTasks,
    setNativeChecked: AnyFunction
  ) => {
    await handleQueuedToggle(cached, setNativeChecked);

    // Update rendererd subscription tasks state.
    const task = cached.tasks[0];
    task.status = task.status === 'enable' ? 'disable' : 'enable';
    updateRenderedSubscriptions(task);
  };

  /// TODO: Add `toggleable` field on subscription task type.
  /// Determine whether the toggle should be disabled based on the
  /// task and account data.
  const getDisabled = (task: SubscriptionTask) => {
    if (!isOnline) {
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
  const getCategorised = (): Map<string, SubscriptionTask[]> => {
    const { tasks } = renderedSubscriptions;

    const map = new Map<string, SubscriptionTask[]>();

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

  /// Map category name to its global toggle state.
  const getCategoryToggles = () => {
    const map = new Map<string, boolean>();

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

  /// Handle a one-shot event.
  const handleOneShot = async (
    task: SubscriptionTask,
    setOneShotProcessing: AnyFunction,
    nativeChecked: boolean
  ) => {
    setOneShotProcessing(true);

    task.enableOsNotifications = nativeChecked;
    await executeOneShot(task);

    // Wait some time to avoid the spinner snapping.
    setTimeout(() => {
      setOneShotProcessing(false);
    }, 550);
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
      {Array.from(getCategorised().entries()).map(([category, tasks], j) => (
        <AccordionItem key={`${category}_${j}`}>
          <HeadingWrapper>
            <AccordionHeader>
              <div className="flex">
                <div className="left">
                  <div className="icon-wrapper">
                    {getAccordionIndices().includes(j) ? (
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        transform={'shrink-1'}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faCaretRight}
                        transform={'shrink-1'}
                      />
                    )}
                  </div>
                  <h5>
                    <span>{category}</span>
                  </h5>
                </div>
                <div className="right">
                  <Switch
                    size="sm"
                    type="secondary"
                    isOn={getCategoryToggles().get(category) || false}
                    disabled={getDisabled(tasks[0])}
                    handleToggle={async () =>
                      await toggleCategoryTasks(
                        category,
                        getCategoryToggles().get(category) || false,
                        renderedSubscriptions,
                        updateRenderedSubscriptions
                      )
                    }
                  />
                </div>
              </div>
            </AccordionHeader>
          </HeadingWrapper>
          <AccordionPanel>
            <div style={{ padding: '0 0.75rem' }}>
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

  return (
    <>
      <BreadcrumbsWrapper>
        <ul>
          <li>
            <ButtonText
              text="Back"
              onClick={() => setSection(0)}
              iconLeft={faAngleLeft}
              iconTransform="shrink-3"
            />
          </li>
          <li>/</li>
          <li>{breadcrumb}</li>
        </ul>
      </BreadcrumbsWrapper>
      <AccountsWrapper>
        {/* Render separate accordions for account and chain subscription tasks. */}
        {typeClicked === 'account' && renderSubscriptionTasks()}
        {typeClicked === 'chain' && renderSubscriptionTasks()}
      </AccountsWrapper>
    </>
  );
};
