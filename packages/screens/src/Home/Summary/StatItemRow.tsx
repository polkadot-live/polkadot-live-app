// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useConnections, useHelp } from '@polkadot-live/contexts';
import * as Styles from '@polkadot-live/styles';
import * as UI from '@polkadot-live/ui';
import { ellipsisFn } from '@w3ux/utils';
import { StatItemRowWrapper } from './Wrappers';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FlattenedAccountData, HelpItemKey } from '@polkadot-live/types';

export const StatItemRow = ({
  kind,
  meterValue,
  helpKey,
  flattened,
  style,
  icon,
  category,
}: {
  kind: string;
  meterValue: number;
  flattened?: FlattenedAccountData;
  helpKey?: HelpItemKey;
  style?: React.CSSProperties;
  icon?: IconDefinition;
  category?: string;
}) => {
  const { openHelp } = useHelp();
  const { getTheme } = useConnections();
  const theme = getTheme();

  const mCol =
    kind === 'total'
      ? 'var(--text-color-primary)'
      : 'var(--text-color-secondary)';

  return (
    <StatItemRowWrapper style={style} $total={kind === 'total'}>
      {kind === 'total' && (
        <Styles.FlexRow>
          {helpKey && (
            <button
              type="button"
              className="left help"
              onClick={() => openHelp(helpKey)}
            >
              <FontAwesomeIcon icon={FA.faInfo} />
            </button>
          )}
          <h3 className="total">Total</h3>
          <div className="meter">
            <UI.ShiftingMeter color={mCol} value={meterValue} size={1.1} />
          </div>
        </Styles.FlexRow>
      )}
      {kind === 'account' && flattened && (
        <Styles.FlexRow>
          <div className="left">
            <UI.TooltipRx
              text={ellipsisFn(flattened.address, 12)}
              theme={theme}
            >
              <span>
                <UI.Identicon value={flattened.address} fontSize="1.5rem" />
              </span>
            </UI.TooltipRx>
          </div>
          <h3>{flattened.name}</h3>
          <div className="meter">
            <UI.ShiftingMeter color={mCol} value={meterValue} size={1.1} />
          </div>
        </Styles.FlexRow>
      )}
      {kind === 'referenda' && (
        <Styles.FlexRow>
          <div className="left">
            <FontAwesomeIcon icon={FA.faComments} transform={'grow-1'} />
          </div>
          <h3>Referenda</h3>
          <div className="meter">
            <UI.ShiftingMeter color={mCol} value={meterValue} size={1.1} />
          </div>
        </Styles.FlexRow>
      )}
      {kind === 'chainEvent' && (
        <Styles.FlexRow>
          <div className="left">
            <FontAwesomeIcon icon={FA.faCheckDouble} transform={'grow-1'} />
          </div>
          <h3>Chain Events</h3>
          <div className="meter">
            <UI.ShiftingMeter color={mCol} value={meterValue} size={1.1} />
          </div>
        </Styles.FlexRow>
      )}
      {kind === 'event' && (
        <Styles.FlexRow>
          <div className="left">
            {icon && (
              <FontAwesomeIcon
                style={{
                  color: 'var(--text-color-secondary)',
                  opacity: '0.4',
                }}
                icon={icon}
              />
            )}
          </div>
          <h3>{category || 'Unknown'}</h3>
          <div className="meter">
            <UI.ShiftingMeter color={mCol} value={meterValue} size={1.1} />
          </div>
        </Styles.FlexRow>
      )}
      {kind === 'import' && (
        <Styles.FlexRow>
          <div className="left">
            <FontAwesomeIcon
              style={{
                color: 'var(--accent-secondary)',
                opacity: '0.45',
              }}
              icon={FA.faCircleDot}
              transform={'shrink-6'}
            />
          </div>
          <h3>{category || 'Unknown'}</h3>
          <div className="meter">
            <UI.ShiftingMeter color={mCol} value={meterValue} size={1.1} />
          </div>
        </Styles.FlexRow>
      )}
    </StatItemRowWrapper>
  );
};
