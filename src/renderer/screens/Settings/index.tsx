// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { HeaderWrapper } from '@app/screens/Wrappers';
import { ContentWrapper, HeadingWrapper } from './Wrappers';
import { Setting } from './Setting';
import { SettingsList } from '@/config/settings';
import { useState } from 'react';
import type { SettingItem } from './types';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/pro-solid-svg-icons';

export const Settings: React.FC = () => {
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
                <HeadingWrapper>
                  <AccordionHeader>
                    <div
                      className="flex"
                      style={i !== 0 ? { marginTop: '0.5rem' } : {}}
                    >
                      <div className="left">
                        <div className="icon-wrapper">
                          {accordionActiveIndices.includes(i) ? (
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
                        <h5>{category}</h5>
                      </div>
                    </div>
                  </AccordionHeader>
                </HeadingWrapper>
                <AccordionPanel>
                  <div className="flex-column" style={{ padding: '0 0.75rem' }}>
                    {settings.map(
                      (
                        { title, enabled, settingType, buttonText, buttonIcon },
                        j
                      ) => (
                        <Setting
                          key={j}
                          title={title}
                          enabled={enabled}
                          settingType={settingType}
                          buttonText={buttonText}
                          buttonIcon={buttonIcon}
                        />
                      )
                    )}
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
