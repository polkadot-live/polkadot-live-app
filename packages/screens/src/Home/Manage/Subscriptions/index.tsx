// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import { useEffect, useState } from 'react';
import {
  useApiHealth,
  useAppSettings,
  useChainEvents,
  useConnections,
} from '@polkadot-live/contexts';
import { ellipsisFn } from '@w3ux/utils';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { ClassicSubscriptions } from './ClassicSubscriptions';
import { SmartSubscriptions } from './SmartSubscriptions';
import type { SubscriptionsProps } from './types';

export const Subscriptions = ({
  breadcrumb,
  section,
  tasksChainId,
  typeClicked,
  setSection,
}: SubscriptionsProps) => {
  const { cacheGet: settingsCacheGet } = useAppSettings();
  const showDebuggingSubscriptions = settingsCacheGet(
    'setting:show-debugging-subscriptions'
  );

  const { hasConnectionIssue } = useApiHealth();
  const { getTheme, getOnlineMode } = useConnections();
  const { activeAccount } = useChainEvents();
  const theme = getTheme();

  // Mechanism to trigger re-caculating the accordion value after the account state is updated.
  const [updateAccordionValue, setUpdateAccordionValue] = useState(false);

  // Utility to determine if a connection issue exists.
  const showConnectionIssue = (): boolean =>
    tasksChainId ? hasConnectionIssue(tasksChainId) : false;

  // Go to section zero if show debugging subscriptions setting turned off.
  useEffect(() => {
    !showDebuggingSubscriptions && setSection(0);
  }, [showDebuggingSubscriptions]);

  // Trigger updating the accordion value when a new account is selected.
  useEffect(() => {
    setUpdateAccordionValue(true);
  }, [activeAccount]);

  // Close disabled subscription groups when loading account subscriptions.
  useEffect(() => {
    if (updateAccordionValue) {
      setUpdateAccordionValue(false);
    }
  }, [updateAccordionValue]);

  return (
    <>
      <UI.ControlsWrapper $sticky={false} style={{ marginBottom: '1.5rem' }}>
        <div className="left">
          <ButtonPrimaryInvert
            className="back-btn"
            text="Back"
            iconLeft={faCaretLeft}
            onClick={() => setSection(0)}
          />
          {typeClicked === 'account' && activeAccount ? (
            <UI.TooltipRx
              text={ellipsisFn(activeAccount.address, 12)}
              theme={theme}
              side="bottom"
            >
              <span>
                <UI.SortControlLabel label={breadcrumb} />
              </span>
            </UI.TooltipRx>
          ) : (
            <UI.SortControlLabel label={breadcrumb} />
          )}
        </div>
      </UI.ControlsWrapper>

      {/** Connection Issues */}
      {!getOnlineMode() && <UI.OfflineBanner rounded={true} />}
      {getOnlineMode() && showConnectionIssue() && (
        <UI.OfflineBanner
          rounded={true}
          text={'Reconnect chain to restore API access.'}
        />
      )}
      {/** Classic Subscriptions */}
      <ClassicSubscriptions
        typeClicked={typeClicked}
        section={section}
        updateAccordionValue={updateAccordionValue}
        setSection={setSection}
      />
      {/** Smart Subscriptions */}
      <SmartSubscriptions />
    </>
  );
};
