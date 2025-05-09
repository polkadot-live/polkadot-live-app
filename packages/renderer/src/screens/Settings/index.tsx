// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import { Setting } from './Setting';
import { SettingsList } from '@polkadot-live/consts/settings';
import { useEffect, useState } from 'react';
import { useHelp } from '@ren/contexts/common/Help';
import { ConfigSettings } from '@polkadot-live/core';
import { useDebug } from '@ren/hooks/useDebug';
import { useSettingsMessagePorts } from '@ren/hooks/useSettingsMessagePorts';
import { ItemsColumn } from '../Home/Manage/Wrappers';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { OsPlatform, SettingItem } from '@polkadot-live/types/settings';

export const Settings: React.FC = () => {
  // Set up port communication for `settings` window.
  useSettingsMessagePorts();
  useDebug(window.myAPI.getWindowId());

  const { openHelp } = useHelp();
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
              </Styles.FlexColumn>
            </Accordion.Root>
          </UI.AccordionWrapper>
        </Styles.FlexColumn>

        {/* Workspaces Accordion Item */}
        {/* <Workspaces /> */}
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
