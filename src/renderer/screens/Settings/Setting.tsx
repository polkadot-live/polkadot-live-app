// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { Switch } from '@/renderer/library/Switch';
import { useState } from 'react';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import type { SettingProps } from './types';

export const Setting = (setting: SettingProps) => {
  const { title, enabled, settingType } = setting;
  const [isToggled, setIsToggled] = useState(enabled);

  return (
    <SettingWrapper>
      <div className="left">
        <div className="icon-wrapper">
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
            handleToggle={() => {
              setIsToggled(!isToggled);
            }}
          />
        ) : (
          <ButtonMonoInvert
            iconLeft={setting.buttonIcon}
            text={setting.buttonText || ''}
            iconTransform="shrink-2"
          />
        )}
      </div>
    </SettingWrapper>
  );
};
