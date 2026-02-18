// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useConnections,
  useHelp,
  useSettingFlags,
} from '@polkadot-live/contexts';
import { ButtonMonoInvert, EllipsisSpinner, Switch } from '@polkadot-live/ui';
import { SettingWrapper } from './Wrappers';
import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';
import type { SettingProps } from './types';

export const Setting = ({ setting }: SettingProps) => {
  const { title, settingType, helpKey } = setting;
  const { cacheGet } = useConnections();
  const { openHelp } = useHelp();
  const { getSwitchState, handleSwitchToggle, handleAnalytics, handleSetting } =
    useSettingFlags();

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
    handleAnalytics?.(setting);
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
        <button
          type="button"
          className="icon-wrapper"
          onClick={() => openHelp(helpKey)}
        >
          <FontAwesomeIcon icon={faInfo} transform={'shrink-1'} />
        </button>
        <span className="text-ellipsis">{title}</span>
      </div>
      <div className="right">
        {settingType === 'switch' ? (
          <span style={{ scale: '0.83' }}>
            <Switch
              size="sm"
              type="primary"
              isOn={getSwitchState(setting)}
              handleToggle={() => handleSwitchToggleOuter()}
            />
          </span>
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
