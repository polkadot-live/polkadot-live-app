// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SettingWrapper } from './Wrappers';
import { EllipsisSpinner, Switch } from '@polkadot-live/ui/components';
import { ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
import type { SettingProps } from './types';
import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';

export const Setting = ({
  setting,
  connectionsCtx,
  helpCtx,
  settingsFlagsCtx,
}: SettingProps) => {
  const { title, settingType, helpKey } = setting;

  const { cacheGet } = connectionsCtx;
  const { openHelp } = helpCtx;
  const { getSwitchState, handleSwitchToggle, handleAnalytics, handleSetting } =
    settingsFlagsCtx;

  /**
   * Handle a setting switch toggle.
   */
  const handleSwitchToggleOuter = () => {
    handleSwitchToggle(setting);
    handleSetting(setting);
  };

  /**
   * Handle a setting button click.
   */
  const handleButtonClick = () => {
    handleSetting(setting);
    handleAnalytics && handleAnalytics(setting);
  };

  /**
   * Determine if switch should be disabled.
   */
  const getDisabled = (key: SettingKey): boolean =>
    key === 'setting:import-data' || key === 'setting:export-data'
      ? cacheGet('backup:importing')
      : false;

  /**
   * Get specific flag for import button.
   */
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
              <EllipsisSpinner style={{ left: '30px', top: '11px' }} />
            )}
          </div>
        )}
      </div>
    </SettingWrapper>
  );
};
