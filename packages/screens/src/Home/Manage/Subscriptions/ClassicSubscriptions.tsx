// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useApiHealth,
  useConnections,
  useContextProxy,
  useManage,
  useSubscriptions,
} from '@polkadot-live/contexts';
import { FlexColumn, FlexRow, ItemsColumn } from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { getNetworkColor } from '../../Wrappers';
import { ClassicSubscription } from './ClassicSubscription';
import { Header } from './Header';
import type { SubscriptionTask, TaskCategory } from '@polkadot-live/types';
import type { ClassicSubscriptionsProps } from './types';

export const ClassicSubscriptions = ({
  typeClicked,
  section,
  updateAccordionValue,
  clickedAccordionType,
  setClickedAccordionType,
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
        (acc, task) => (acc ? task.status === 'enable' : acc),
        true,
      );
      map.set(category, allToggled);
    }
    return map;
  };

  // Categorised tasks state.
  const [categorisedTasks, setCategorisedTasks] = useState(
    new Map<TaskCategory, SubscriptionTask[]>(getCategorised()),
  );

  // Accordion state.
  const [accordionValueChains, setAccordionValueChains] = useState<string>('');
  const [accordionValueAccounts, setAccordionValueAccounts] =
    useState<string>('');

  // Handle toggling a subscription task group switch.
  const handleGroupSwitch = async (category: TaskCategory) => {
    const isOn = getCategoryToggles().get(category) || false;
    await toggleCategoryTasks(category, isOn);
  };

  // Utils.
  const getDisabled = (task: SubscriptionTask) => {
    const apiFailed = hasConnectionIssue(task.chainId);
    const isOffline = !getOnlineMode();
    return !!(isOffline || isConnecting || isImportingData || apiFailed);
  };

  // Re-cache categorised tasks when subscription data changes.
  useEffect(() => {
    setCategorisedTasks(getCategorised());
    if (section === 1 && renderedSubscriptions.type === '') {
      setSection(0);
    } else if (typeClicked === 'chain') {
      setAccordionValueChains('Chain');
    }
  }, [renderedSubscriptions]);

  // Close accordion items by default.
  useEffect(() => {
    if (updateAccordionValue) {
      if (typeClicked === 'account') {
        setAccordionValueAccounts('');
      }
    }
  }, [updateAccordionValue]);

  useEffect(() => {
    if (clickedAccordionType === 'smart') {
      typeClicked === 'account'
        ? setAccordionValueAccounts('')
        : setAccordionValueChains('');
    }
  }, [clickedAccordionType]);

  return (
    <>
      <Header label="Storage Queries" />
      <FlexColumn>
        <UI.AccordionWrapper style={{ margin: '0.6rem 0' }}>
          <Accordion.Root
            className="AccordionRoot"
            collapsible={true}
            type="single"
            value={
              typeClicked === 'account'
                ? accordionValueAccounts
                : accordionValueChains
            }
            onValueChange={(val) => {
              typeClicked === 'account'
                ? setAccordionValueAccounts(val as string)
                : setAccordionValueChains(val as string);

              setClickedAccordionType('classic');
            }}
          >
            <FlexColumn $rowGap="0.6rem">
              {Array.from(categorisedTasks.entries()).map(
                ([category, tasks]) => (
                  <Accordion.Item
                    key={category}
                    className="AccordionItem"
                    value={category}
                  >
                    <FlexRow $gap={'2px'}>
                      <UI.AccordionTrigger narrow={true}>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        <UI.TriggerHeader>
                          <FlexRow>
                            <span style={{ flex: 1 }}>{category}</span>
                            <UI.CountSummary
                              subs={tasks}
                              badgeColor={getNetworkColor(tasks[0].chainId)}
                            />
                          </FlexRow>
                        </UI.TriggerHeader>
                      </UI.AccordionTrigger>
                      {category !== 'Chain' && (
                        <div
                          className="HeaderContentDropdownWrapper"
                          style={{ cursor: 'default' }}
                        >
                          <span style={{ scale: '0.68' }}>
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
                      )}
                    </FlexRow>
                    <UI.AccordionContent
                      transparent={true}
                      className="AccordionContentReduce"
                    >
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
                ),
              )}
            </FlexColumn>
          </Accordion.Root>
        </UI.AccordionWrapper>
      </FlexColumn>
    </>
  );
};
