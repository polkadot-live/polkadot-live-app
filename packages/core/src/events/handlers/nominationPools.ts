// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSs58Prefix } from '@polkadot-live/consts/chains';
import { encodeRecord } from '@polkadot-live/encoder';
import { handleEvent } from '../../callbacks/utils';
import { getBalanceText } from '../../library';
import { makeChainEvent, notifyTitle } from './utils';
import type { PalletNominationPoolsEvent } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { WhoMeta } from '../types';

export const handleNominationPoolsEvent = (
  chainId: ChainID,
  osNotify: boolean,
  palletEvent: PalletNominationPoolsEvent,
  whoMeta?: WhoMeta,
) => {
  try {
    handleEvent({
      action: 'events:persist',
      data: {
        event: getNominationPoolsChainEvent(chainId, palletEvent, whoMeta),
        notification: getNominationPoolsNotification(
          chainId,
          palletEvent,
          whoMeta,
        ),
        showNotification: { isOneShot: false, isEnabled: osNotify },
      },
    });
  } catch (err) {
    console.error(err, palletEvent);
  }
};

export const getNominationPoolsPalletScopedAccountsFromEvent = (
  chainId: ChainID,
  palletEvent: PalletNominationPoolsEvent,
): string[] => {
  const { name: eventName, data: miscData } = palletEvent;
  const ss58Prefix = getSs58Prefix(chainId);
  switch (eventName) {
    case 'Bonded':
    case 'PaidOut':
    case 'Unbonded':
    case 'Withdrawn':
    case 'MemberRemoved': {
      return [miscData.member.address(ss58Prefix).toString()];
    }
    default:
      return [];
  }
};

const getNominationPoolsNotification = (
  chainId: ChainID,
  palletEvent: PalletNominationPoolsEvent,
  whoMeta?: WhoMeta,
) => {
  const { name: eventName, data: miscData } = palletEvent;
  switch (eventName) {
    case 'Created': {
      const { poolId } = miscData;
      return {
        title: 'Created',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} created`,
      };
    }
    case 'Bonded': {
      const { poolId } = miscData;
      return {
        title: notifyTitle('Bonded', whoMeta),
        subtitle: `${chainId}`,
        body: `Member bonded to pool ${poolId}`,
      };
    }
    case 'PaidOut': {
      const { poolId, payout } = miscData;
      return {
        title: notifyTitle('Paid Out', whoMeta),
        subtitle: `${chainId}`,
        body: `Pool ${poolId} paid out ${getBalanceText(payout, chainId)}`,
      };
    }
    case 'Unbonded': {
      const { poolId, balance } = miscData;
      return {
        title: notifyTitle('Unbonded', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(balance, chainId)} unbonded from pool ${poolId}`,
      };
    }
    case 'Withdrawn': {
      const { poolId, balance } = miscData;
      return {
        title: notifyTitle('Withdrawn', whoMeta),
        subtitle: `${chainId}`,
        body: `${getBalanceText(balance, chainId)} withdrawn from pool ${poolId}`,
      };
    }
    case 'Destroyed': {
      const { poolId } = miscData;
      return {
        title: 'Destroyed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'StateChanged': {
      const { poolId, newState } = miscData;
      return {
        title: 'State Changed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} state changed to ${newState}`,
      };
    }
    case 'MemberRemoved': {
      const { poolId } = miscData;
      return {
        title: notifyTitle('Pool Member Removed', whoMeta),
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolSlashed': {
      const { poolId, balance } = miscData;
      return {
        title: 'Pool Slashed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} slashed ${getBalanceText(balance, chainId)}`,
      };
    }
    case 'UnbondingPoolSlashed': {
      const { poolId, balance } = miscData;
      return {
        title: 'Unbonding Pool Slashed',
        subtitle: `${chainId}`,
        body: `Pool ${poolId} slashed ${getBalanceText(balance, chainId)}`,
      };
    }
    case 'PoolCommissionUpdated': {
      const { poolId } = miscData;
      return {
        title: 'Pool Commission Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolCommissionChangeRateUpdated': {
      const { poolId } = miscData;
      return {
        title: 'Pool Commission Change Rate Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolCommissionClaimPermissionUpdated': {
      const { poolId } = miscData;
      return {
        title: 'Pool Commission Claim Permission Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'PoolCommissionClaimed': {
      const { poolId } = miscData;
      return {
        title: 'Pool Commission Claimed',
        subtitle: `Pool ${poolId}`,
        body: `Pool ${poolId}`,
      };
    }
    case 'MetadataUpdated': {
      const { poolId } = miscData;
      return {
        title: 'Pool Metadata Updated',
        subtitle: `${chainId}`,
        body: `Pool ${poolId}`,
      };
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};

const getNominationPoolsChainEvent = (
  chainId: ChainID,
  palletEvent: PalletNominationPoolsEvent,
  whoMeta?: WhoMeta,
) => {
  const { name: eventName, data: miscData } = palletEvent;
  const ev = makeChainEvent({ chainId, category: 'Nomination Pools' }, whoMeta);
  const ss58Prefix = getSs58Prefix(chainId);

  switch (eventName) {
    case 'Created': {
      const { depositor, poolId } = miscData;
      ev.title = 'Created';
      ev.subtitle = `Pool ${poolId} created`;
      ev.encodedInfo = encodeRecord({
        Depositor: [depositor, { ss58Prefix }],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'Bonded': {
      const { member, poolId, bonded, joined } = miscData;
      ev.title = 'Bonded';
      ev.subtitle = `${getBalanceText(bonded, chainId)} bonded to pool ${poolId}`;
      ev.encodedInfo = encodeRecord({
        Bonded: [bonded],
        Joined: [joined],
        Member: [member, { ss58Prefix }],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'PaidOut': {
      const { member, poolId, payout } = miscData;
      ev.title = 'Pool Payout';
      ev.subtitle = `Pool ${poolId} paid out ${getBalanceText(payout, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Member: [member, { ss58Prefix }],
        Payout: [payout],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'Unbonded': {
      const { member, poolId, balance, /*, points */ era } = miscData;
      ev.title = 'Unbonded';
      ev.subtitle = `${getBalanceText(balance, chainId)} unbonded from pool ${poolId}`;
      ev.encodedInfo = encodeRecord({
        Balance: [balance],
        Era: [era],
        Member: [member, { ss58Prefix }],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'Withdrawn': {
      const { member, poolId, balance /*, points */ } = miscData;
      ev.title = 'Withdrawn';
      ev.subtitle = `${getBalanceText(balance, chainId)} withdrawn from pool ${poolId}`;
      ev.encodedInfo = encodeRecord({
        Balance: [balance],
        Member: [member, { ss58Prefix }],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'Destroyed': {
      const { poolId } = miscData;
      ev.title = 'Destroyed';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({ 'Pool ID': [poolId] });
      return ev;
    }
    case 'StateChanged': {
      const { poolId, newState } = miscData;
      ev.title = 'State Changed';
      ev.subtitle = `Pool ${poolId} state changed to ${newState}`;
      ev.encodedInfo = encodeRecord({
        'Pool ID': [poolId],
        'New State': [newState],
      });
      return ev;
    }
    case 'MemberRemoved': {
      const { poolId, member, releasedBalance } = miscData;
      ev.title = 'Member Removed';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({
        Member: [member, { ss58Prefix }],
        'Pool ID': [poolId],
        'Released Balance': [releasedBalance],
      });
      return ev;
    }
    case 'PoolSlashed': {
      const { poolId, balance } = miscData;
      ev.title = 'Pool Slashed';
      ev.subtitle = `Pool ${poolId} slashed with new balance ${getBalanceText(balance, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Balance: [balance],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'UnbondingPoolSlashed': {
      const { poolId, era, balance } = miscData;
      ev.title = 'Unbonding Pool Slashed';
      ev.subtitle = `Pool ${poolId} slashed with new balance ${getBalanceText(balance, chainId)}`;
      ev.encodedInfo = encodeRecord({
        Balance: [balance],
        Era: [era],
        'Pool ID': [poolId],
      });
      return ev;
    }
    case 'PoolCommissionUpdated': {
      const { poolId /*, current */ } = miscData;
      ev.title = 'Pool Commission Updated';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({ 'Pool ID': [poolId] });
      return ev;
    }
    case 'PoolCommissionChangeRateUpdated': {
      const { poolId /*, changeRate */ } = miscData;
      ev.title = 'Pool Commission Change Rate Updated';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({ 'Pool ID': [poolId] });
      return ev;
    }
    case 'PoolCommissionClaimPermissionUpdated': {
      const { poolId /*, permission */ } = miscData;
      ev.title = 'Pool Commission Claim Permission Updated';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({ 'Pool ID': [poolId] });
      return ev;
    }
    case 'PoolCommissionClaimed': {
      const { poolId /*, commission */ } = miscData;
      ev.title = 'Pool Commission Claimed';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({ 'Pool ID': [poolId] });
      return ev;
    }
    case 'MetadataUpdated': {
      const { poolId, caller } = miscData;
      ev.title = 'Pool Metadata Updated';
      ev.subtitle = `Pool ${poolId}`;
      ev.encodedInfo = encodeRecord({
        Caller: [caller, { ss58Prefix }],
        'Pool ID': [poolId],
      });
      return ev;
    }
    default: {
      throw new Error('EventNotRecognised');
    }
  }
};
