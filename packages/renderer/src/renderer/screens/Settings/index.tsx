// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import { ContentWrapper } from './Wrappers';
import { Setting } from './Setting';
import { SettingsList } from '@ren/config/settings';
import { useEffect, useState } from 'react';
import { Config as ConfigSettings } from '@ren/config/processes/settings';
import { useDebug } from '@app/hooks/useDebug';
import { useSettingsMessagePorts } from '@app/hooks/useSettingsMessagePorts';
import { FlexColumn, Scrollable } from '@polkadot-live/ui/styles';
import { ItemsColumn } from '../Home/Manage/Wrappers';
import type { OsPlatform, SettingItem } from '@polkadot-live/types/settings';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { TriggerHeader } from '../Action/Wrappers';

export const Settings: React.FC = () => {
  // Set up port communication for `settings` window.
  useSettingsMessagePorts();
  useDebug(window.myAPI.getWindowId());

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] =
    useState<string>('settings-General');

  const [osPlatform, setOsPlatform] = useState<OsPlatform | null>(null);

  useEffect(() => {
    const initOsPlatform = async () => {
      const platform = await window.myAPI.getOsPlatform();
      setOsPlatform(platform as OsPlatform);
    };
    initOsPlatform();
  }, []);

  /**
   * Return a map of settings organised by their category.
   */
  const getSortedSettings = () => {
    const map = new Map<string, SettingItem[]>();

    // Exit early if platform hasn't been set.
    if (!osPlatform) {
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
      if (!setting.platforms.includes(osPlatform as OsPlatform)) {
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

    return map;
  };

  /**
   * Handle a setting action. Send port message to main renderer.
   */
  const handleSetting = (setting: SettingItem) => {
    ConfigSettings.portSettings.postMessage({
      task: String(setting.action),
      data: {
        setting,
      },
    });
  };

  return (
    <Scrollable $footerHeight={4} style={{ paddingTop: 0, paddingBottom: 0 }}>
      <ContentWrapper>
        <UI.AccordionWrapper $onePart={true}>
          <Accordion.Root
            className="AccordionRoot"
            type="single"
            value={accordionValue}
            onValueChange={(val) => setAccordionValue(val)}
          >
            <FlexColumn>
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
                      <TriggerHeader>{category}</TriggerHeader>
                    </UI.AccordionTrigger>
                    <UI.AccordionContent transparent={true}>
                      <ItemsColumn>
                        {settings.map((setting, j) => (
                          <Setting
                            key={j}
                            setting={setting}
                            handleSetting={handleSetting}
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

        {/* Workspaces Accordion Item */}
        {/* <Workspaces /> */}
      </ContentWrapper>
    </Scrollable>
  );
};
