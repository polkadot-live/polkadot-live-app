// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { Switch } from '@/renderer/library/Switch';
import { useState } from 'react';

interface SettingProps {
  title: string;
  enabled: boolean;
}

export const Setting = ({ title, enabled }: SettingProps) => {
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
        <Switch
          size="sm"
          type="primary"
          isOn={isToggled}
          handleToggle={() => {
            setIsToggled(!isToggled);
          }}
        />
      </div>
    </SettingWrapper>
  );
};
