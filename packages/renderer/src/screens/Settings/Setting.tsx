// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { EllipsisSpinner, Switch } from '@polkadot-live/ui/components';
import { useConnections, useHelp } from '@ren/contexts/common';
import { ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
import { useSettingFlags } from '@ren/contexts/settings';
import type { SettingProps } from './types';
import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';

export const Setting = ({ setting, handleSetting }: SettingProps) => {
  const { title, settingType, helpKey } = setting;

  const { openHelp } = useHelp();
  const { getSwitchState, handleSwitchToggle } = useSettingFlags();
  const { cacheGet } = useConnections();

  /// Handle a setting switch toggle.
  const handleSwitchToggleOuter = () => {
    handleSwitchToggle(setting);
    handleSetting(setting);
  };

  /// Handle a setting button click.
  const handleButtonClick = () => {
    handleSetting(setting);

    // Handle analytics.
    switch (setting.key) {
      case 'setting:export-data': {
        window.myAPI.umamiEvent('backup-export', null);
        break;
      }
      case 'setting:import-data': {
        window.myAPI.umamiEvent('backup-import', null);
        break;
      }
    }
  };

  /// Determine if switch should be disabled.
  const getDisabled = (key: SettingKey): boolean =>
    key === 'setting:import-data' || key === 'setting:export-data'
      ? cacheGet('backup:importing')
      : false;

  /// Get specific flag for import button.
  const getImportFlag = ({ key }: SettingItem): boolean =>
    key === 'setting:import-data' && getDisabled(key);

  return (
    <SettingWrapper>
      <div className="left">
        <div className="icon-wrapper" onClick={() => openHelp(helpKey)}>
          <FontAwesomeIcon icon={faInfo} transform={'shrink-1'} />
        </div>
        <span className="text-ellipsis">{title}</span>
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
          <div style={{ position: 'relative' }}>
            <ButtonMonoInvert
              style={{
                minWidth: '100px',
                minHeight: '26px',
                border: '1px solid var(--text-color-primary) !important',
              }}
              disabled={getDisabled(setting.key)}
              iconLeft={setting.buttonIcon}
              text={getImportFlag(setting) ? '' : setting.buttonText || ''}
              iconTransform="shrink-2"
              onClick={() => handleButtonClick()}
            />

            {getImportFlag(setting) && (
              <EllipsisSpinner style={{ left: '26px', top: '10px' }} />
            )}
          </div>
        )}
      </div>
    </SettingWrapper>
  );
};
