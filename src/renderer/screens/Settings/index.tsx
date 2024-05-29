// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { DragClose } from '@/renderer/library/DragClose';
import { HeaderWrapper } from '@app/screens/Wrappers';
import { ContentWrapper } from './Wrappers';
import { Setting } from './Setting';
import { SettingsList } from '@/config/settings';
import { useState } from 'react';
import { Config as ConfigSettings } from '@/config/processes/settings';
import { useSettingsMessagePorts } from '@/renderer/hooks/useSettingsMessagePorts';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import type { SettingItem } from './types';

export const Settings: React.FC = () => {
  // Set up port communication for `settings` window.
  useSettingsMessagePorts();

  /// Active accordion indices for settings panels.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >([0, 1]);

  /// Return a map of settings organised by their category.
  const getSortedSettings = () => {
    const map = new Map<string, SettingItem[]>();

    // Insert categories in a desired order.
    for (const category of ['General', 'Backup']) {
      map.set(category, []);
    }

    // Populate map.
    for (const setting of SettingsList) {
      const category = setting.category;
      map.has(category)
        ? map.set(category, [...map.get(category)!, { ...setting }])
        : map.set(category, [{ ...setting }]);
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
    <>
      {/* Header */}
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="settings" />
          <h3>Settings</h3>
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        <Accordion
          multiple
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
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
                  <div
                    className="flex-column"
                    style={{ padding: '0 0.75rem', marginBottom: '1.5rem' }}
                  >
                    {settings.map((setting, j) => (
                      <Setting
                        key={j}
                        setting={setting}
                        handleSetting={handleSetting}
                      />
                    ))}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            )
          )}
        </Accordion>
      </ContentWrapper>
    </>
  );
};
