// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/styles/wrappers';
import { Setting } from './Setting';
import { SettingsList } from '@polkadot-live/consts/settings';
import { useState } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useContextProxy } from '@polkadot-live/contexts';
import type { OsPlatform, SettingItem } from '@polkadot-live/types/settings';
import type { SettingsProps } from './types';

export const Settings = ({ platform }: SettingsProps) => {
  const { useCtx } = useContextProxy();
  const { openHelp } = useCtx('HelpCtx')();

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] =
    useState<string>('settings-General');

  /**
   * Return a map of settings organised by their category.
   */
  const getSortedSettings = () => {
    const map = new Map<string, SettingItem[]>();

    // Exit early if platform hasn't been set.
    if (!platform) {
      return map;
    }

    // Insert categories in a desired order.
    for (const category of [
      'General',
      'Subscriptions',
      'Extrinsics',
      'Backup',
    ]) {
      map.set(category, []);
    }
    // Populate map.
    for (const setting of SettingsList) {
      if (!setting.platforms.includes(platform as OsPlatform)) {
        continue;
      }
      const category = setting.category;
      map.has(category)
        ? map.set(category, [...map.get(category)!, { ...setting }])
        : map.set(category, [{ ...setting }]);
    }
    // Sort by label.
    for (const [category, settings] of map.entries()) {
      map.set(
        category,
        settings.sort((a, b) => a.title.localeCompare(b.title))
      );
    }
    // Remove any empty categories.
    for (const [key, value] of map.entries()) {
      if (!value.length) {
        map.delete(key);
      }
    }
    return map;
  };

  return (
    <UI.ScrollableMax>
      <Styles.PadWrapper>
        <Styles.FlexColumn>
          <UI.ActionItem showIcon={false} text="Application Settings" />
          <UI.AccordionWrapper $onePart={true}>
            <Accordion.Root
              className="AccordionRoot"
              type="single"
              value={accordionValue}
              onValueChange={(val) => setAccordionValue(val)}
            >
              <Styles.FlexColumn>
                {Array.from(getSortedSettings().entries()).map(
                  ([category, settings]) => (
                    <Accordion.Item
                      key={`settings_${category}`}
                      className="AccordionItem"
                      value={`settings-${category}`}
                    >
                      <UI.AccordionTrigger narrow={true}>
                        <ChevronDownIcon
                          className="AccordionChevron"
                          aria-hidden
                        />
                        <UI.TriggerHeader>{category}</UI.TriggerHeader>
                      </UI.AccordionTrigger>
                      <UI.AccordionContent transparent={true}>
                        <Styles.ItemsColumn>
                          {settings.map((setting, j) => (
                            <Setting key={j} setting={setting} />
                          ))}
                        </Styles.ItemsColumn>
                      </UI.AccordionContent>
                    </Accordion.Item>
                  )
                )}
              </Styles.FlexColumn>
            </Accordion.Root>
          </UI.AccordionWrapper>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
