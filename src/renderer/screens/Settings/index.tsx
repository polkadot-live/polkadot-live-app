// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionCaretHeader,
} from '@app/library/components';
import { ContentWrapper } from './Wrappers';
import { Setting } from './Setting';
import { SettingsList } from '@/config/settings';
import { useEffect, useState } from 'react';
import { Config as ConfigSettings } from '@/config/processes/settings';
import { useDebug } from '@/renderer/hooks/useDebug';
import { useSettingsMessagePorts } from '@/renderer/hooks/useSettingsMessagePorts';
import { Scrollable } from '@/renderer/library/styles';
import { useAppModesSyncing } from '@/renderer/hooks/useAppModesSyncing';
import { ItemsColumn } from '../Home/Manage/Wrappers';
import type { OsPlatform, SettingItem } from './types';

export const Settings: React.FC = () => {
  // Set up port communication for `settings` window.
  useSettingsMessagePorts();
  useAppModesSyncing();
  useDebug(window.myAPI.getWindowId());

  /// Active accordion indices for settings panels.
  const [accordionActiveIndices, setAccordionActiveIndices] =
    useState<number>(0);
  const [osPlatform, setOsPlatform] = useState<OsPlatform | null>(null);

  useEffect(() => {
    const initOsPlatform = async () => {
      const platform = await window.myAPI.getOsPlatform();
      setOsPlatform(platform as OsPlatform);
    };
    initOsPlatform();
  }, []);

  /// Return a map of settings organised by their category.
  const getSortedSettings = () => {
    const map = new Map<string, SettingItem[]>();

    // Exit early if platform hasn't been set.
    if (!osPlatform) {
      return map;
    }

    // Insert categories in a desired order.
    for (const category of ['General', 'Subscriptions', 'Backup']) {
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

  /// Handle a setting action.
  const handleSetting = (setting: SettingItem) => {
    // Send port message to main renderer.
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
        <Accordion
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
          gap={'0.5rem'}
          panelPadding={'0.5rem 0.25rem'}
        >
          {Array.from(getSortedSettings().entries()).map(
            ([category, settings], i) => (
              <AccordionItem key={`${category}_settings`}>
                <AccordionCaretHeader
                  title={category}
                  itemIndex={i}
                  wide={true}
                />
                <AccordionPanel>
                  <ItemsColumn>
                    {settings.map((setting, j) => (
                      <Setting
                        key={j}
                        setting={setting}
                        handleSetting={handleSetting}
                      />
                    ))}
                  </ItemsColumn>
                </AccordionPanel>
              </AccordionItem>
            )
          )}

          {/* Workspaces Accordion Item */}
          {/* <Workspaces /> */}
        </Accordion>
      </ContentWrapper>
    </Scrollable>
  );
};
