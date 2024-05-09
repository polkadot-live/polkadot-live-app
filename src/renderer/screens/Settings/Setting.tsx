// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { Switch } from '@/renderer/library/Switch';
import { useHelp } from '@/renderer/contexts/Help';
import { useState } from 'react';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import type { SettingProps } from './types';

export const Setting = ({ setting, handleSetting }: SettingProps) => {
  const { title, enabled, settingType, helpKey } = setting;
  const [isToggled, setIsToggled] = useState(enabled);

  const { openHelp } = useHelp();

  /// Handle a setting switch toggle.
  const handleSwitchToggle = () => {
    setIsToggled(!isToggled);
    handleSetting(setting);
  };

  /// Handle a setting button click.
  const handleButtonClick = () => {
    handleSetting(setting);
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
            isOn={isToggled}
            handleToggle={() => handleSwitchToggle()}
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
