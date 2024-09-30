// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AnalyticsController } from '@/controller/renderer/AnalyticsController';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { Switch } from '@/renderer/library/Switch';
import { useHelp } from '@/renderer/contexts/common/Help';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { useSettingFlags } from '@/renderer/contexts/settings/SettingFlags';
import type { SettingProps } from './types';

export const Setting = ({ setting, handleSetting }: SettingProps) => {
  const { title, settingType, helpKey } = setting;

  const { openHelp } = useHelp();
  const { getSwitchState, handleSwitchToggle } = useSettingFlags();

  /// Handle a setting switch toggle.
  const handleSwitchToggleOuter = () => {
    handleSwitchToggle(setting);
    handleSetting(setting);
  };

  /// Handle a setting button click.
  const handleButtonClick = () => {
    handleSetting(setting);

    // Handle analytics.
    switch (setting.action) {
      case 'settings:execute:exportData': {
        AnalyticsController.umamiTrack('backup-export');
        break;
      }
      case 'settings:execute:importData': {
        AnalyticsController.umamiTrack('backup-import');
        break;
      }
    }
  };

  return (
    <SettingWrapper>
      <div className="left">
        <div className="icon-wrapper" onClick={() => openHelp(helpKey)}>
          <FontAwesomeIcon icon={faInfo} transform={'shrink-1'} />
        </div>
        <span>{title}</span>
      </div>
      <div className="right">
        {settingType === 'switch' ? (
          <Switch
            size="sm"
            type="primary"
            isOn={getSwitchState(setting)}
            handleToggle={() => handleSwitchToggleOuter()}
          />
        ) : (
          <ButtonMonoInvert
            iconLeft={setting.buttonIcon}
            text={setting.buttonText || ''}
            iconTransform="shrink-2"
            onClick={() => handleButtonClick()}
          />
        )}
      </div>
    </SettingWrapper>
  );
};
