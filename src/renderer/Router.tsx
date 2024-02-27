// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyJson } from '@/types/misc';
import { MainInterfaceWrapper } from '@app/Wrappers';
//import { useAccountState } from '@app/contexts/AccountState';
import { useAddresses } from '@app/contexts/Addresses';
import { Overlay } from '@app/library/Overlay';
import { Tooltip } from '@app/library/Tooltip';
import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Action } from '@app/screens/Action';
import { Home } from '@app/screens/Home';
import { Import } from '@app/screens/Import';
import { useTheme } from 'styled-components';
import type { ChainID } from '@/types/chains';
import type { FlattenedAccounts } from '@/types/accounts';
import { useSubscriptions } from './contexts/Subscriptions';
import type { SubscriptionTask } from '@/types/subscriptions';
import { useManage } from '@app/screens/Home/Manage/provider';
import { useOnlineStatus } from './contexts/OnlineStatus';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { setAddresses } = useAddresses();
  //const { setAccountStateKey } = useAccountState();

  const { setChainSubscriptions, setAccountSubscriptions } = useSubscriptions();
  const { setRenderedSubscriptions } = useManage();
  const { setOnline } = useOnlineStatus();

  useEffect(() => {
    // handle initial responses to populate state from store.
    window.myAPI.reportImportedAccounts((_: Event, accounts: string) => {
      const parsed: FlattenedAccounts = new Map(JSON.parse(accounts));
      setAddresses(parsed);
      setRenderedSubscriptions({ type: '', tasks: [] });
    });

    //window.myAPI.reportAccountState(
    //  (
    //    _: Event,
    //    chain: ChainID,
    //    address: string,
    //    key: string,
    //    value: AnyJson
    //  ) => {
    //    setAccountStateKey(chain, address, key, value);
    //  }
    //);

    window.myAPI.reportOnlineStatus((_: Event, status: boolean) => {
      console.log(`Online status STATE received: ${status}`);
      setOnline(status);
    });

    window.myAPI.reportChainSubscriptionState(
      (_: Event, serialized: AnyJson) => {
        const parsed = new Map<ChainID, SubscriptionTask[]>(
          JSON.parse(serialized)
        );

        setChainSubscriptions(parsed);
      }
    );

    window.myAPI.reportAccountSubscriptionsState(
      (_: Event, serialized: AnyJson) => {
        const parsed = new Map<string, SubscriptionTask[]>(
          JSON.parse(serialized)
        );

        setAccountSubscriptions(parsed);
      }
    );
  }, []);

  return (
    <MainInterfaceWrapper className={`theme-polkadot theme-${mode}`}>
      <Overlay />
      <Tooltip />
      <Routes>
        <Route path={'import'} element={<Import />} />
        <Route path={'action'} element={<Action />} />
        <Route path={'/'} element={<Home />} />
      </Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => (
  <HashRouter basename="/">
    <RouterInner />
  </HashRouter>
);
export default Router;
