// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { Switch } from '@/renderer/library/components';
import { useHelp } from '@/renderer/contexts/common/Help';
import { ButtonMonoInvert } from '@app/kits/Buttons/ButtonMonoInvert';
import { useConnections } from '@app/contexts/common/Connections';
import { useSettingFlags } from '@app/contexts/settings/SettingFlags';
import type { SettingAction, SettingItem, SettingProps } from './types';
import { EllipsisSpinner } from '@/renderer/library/components/Spinners';

export const Setting = ({ setting, handleSetting }: SettingProps) => {
  const { title, settingType, helpKey } = setting;

  const { openHelp } = useHelp();
  const { getSwitchState, handleSwitchToggle } = useSettingFlags();
  const { isImporting } = useConnections();

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
        window.myAPI.umamiEvent('backup-export', null);
        break;
      }
      case 'settings:execute:importData': {
        window.myAPI.umamiEvent('backup-import', null);
        break;
      }
    }
  };

  /// Determine if switch should be disabled.
  const getDisabled = (action: SettingAction): boolean =>
    action === 'settings:execute:importData' ||
    action === 'settings:execute:exportData'
      ? isImporting
      : false;

  /// Get specific flag for import button.
  const getImportFlag = ({ action }: SettingItem): boolean =>
    action === 'settings:execute:importData' && getDisabled(action);

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
          <div style={{ position: 'relative' }}>
            <ButtonMonoInvert
              style={{
                minWidth: '100px',
                minHeight: '26px',
                border: '1px solid var(--text-color-primary) !important',
              }}
              disabled={getDisabled(setting.action)}
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
