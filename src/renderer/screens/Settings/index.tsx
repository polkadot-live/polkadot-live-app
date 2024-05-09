// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { HeaderWrapper } from '@app/screens/Wrappers';
import { ContentWrapper } from './Wrappers';
import { Setting } from './Setting';
import { SettingsList } from '@/config/settings';

export const Settings: React.FC = () => {
  console.log('Settings opened...');

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
        <div className="flex-column" style={{ padding: '0 0.75rem' }}>
          {SettingsList.map(
            ({ title, enabled, settingType, buttonText, buttonIcon }, i) => (
              <Setting
                key={i}
                title={title}
                enabled={enabled}
                settingType={settingType}
                buttonText={buttonText}
                buttonIcon={buttonIcon}
              />
            )
          )}
        </div>
      </ContentWrapper>
    </>
  );
};
