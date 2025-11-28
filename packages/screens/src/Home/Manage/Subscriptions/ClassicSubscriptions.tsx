// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import { useEffect, useState } from 'react';
import {
  useApiHealth,
  useConnections,
  useContextProxy,
  useManage,
  useSubscriptions,
} from '@polkadot-live/contexts';
import { Header } from './Header';
import {
  FlexColumn,
  FlexRow,
  ItemsColumn,
} from '@polkadot-live/styles/wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { ClassicSubscription } from './ClassicSubscription';
import type { ClassicSubscriptionsProps } from './types';
import type { SubscriptionTask, TaskCategory } from '@polkadot-live/types';

export const ClassicSubscriptions = ({
  typeClicked,
  section,
  updateAccordionValue,
  setSection,
}: ClassicSubscriptionsProps) => {
  const { useCtx } = useContextProxy();
  const { isConnecting } = useCtx('BootstrappingCtx')();
  const { hasConnectionIssue } = useApiHealth();
  const { cacheGet, getOnlineMode } = useConnections();
  const { getCategorised, renderedSubscriptions } = useManage();
  const { toggleCategoryTasks } = useSubscriptions();
  const isImportingData = cacheGet('backup:importing');

  // Map category name to its global toggle state.
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

  // Categorised tasks state.
  const [categorisedTasks, setCategorisedTasks] = useState(
    new Map<TaskCategory, SubscriptionTask[]>(getCategorised())
  );

  // Accordion state.
  const [accordionValueAccounts, setAccordionValueAccounts] = useState<
    string | undefined
  >(undefined);

  const [accordionValueChains, setAccordionValueChains] = useState<
    string | undefined
  >(undefined);

  // Handle toggling a subscription task group switch.
  const handleGroupSwitch = async (category: TaskCategory) => {
    const isOn = getCategoryToggles().get(category) || false;
    await toggleCategoryTasks(category, isOn);
  };

  // Utils.
  const getDisabled = (task: SubscriptionTask) => {
    const apiFailed = hasConnectionIssue(task.chainId);
    const isOffline = !getOnlineMode();
    return isOffline || isConnecting || isImportingData || apiFailed
      ? true
      : false;
  };

  // Re-cache categorised tasks when subscription data changes.
  useEffect(() => {
    setCategorisedTasks(getCategorised());
    if (section === 1 && renderedSubscriptions.type == '') {
      setSection(0);
    } else if (typeClicked === 'chain') {
      setAccordionValueChains('Chain');
    }
  }, [renderedSubscriptions]);

  // Close accordion items by default.
  useEffect(() => {
    if (updateAccordionValue) {
      if (typeClicked === 'account') {
        setAccordionValueAccounts(undefined);
      }
    }
  }, [updateAccordionValue]);

  return (
    <>
      <Header label="Classic" />
      <FlexColumn>
        <UI.AccordionWrapper style={{ margin: '1rem 0' }}>
          <Accordion.Root
            className="AccordionRoot"
            collapsible={true}
            type="single"
            value={
              typeClicked === 'account'
                ? accordionValueAccounts
                : accordionValueChains
            }
            onValueChange={(val) =>
              typeClicked === 'account'
                ? setAccordionValueAccounts(val as string)
                : setAccordionValueChains(val as string)
            }
          >
            <FlexColumn $rowGap="2px">
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
                          <span style={{ scale: '0.83' }}>
                            <UI.Switch
                              size="sm"
                              type="primary"
                              isOn={getCategoryToggles().get(category) || false}
                              disabled={getDisabled(tasks[0])}
                              handleToggle={async () =>
                                await handleGroupSwitch(category)
                              }
                            />
                          </span>
                        </div>
                      </FlexRow>
                    )}
                    <UI.AccordionContent transparent={true} topGap={'2px'}>
                      <ItemsColumn>
                        {tasks
                          .sort((a, b) => a.label.localeCompare(b.label))
                          .map((task: SubscriptionTask) => (
                            <ClassicSubscription
                              key={`${category}-${task.action}`}
                              task={task}
                              getDisabled={getDisabled}
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
