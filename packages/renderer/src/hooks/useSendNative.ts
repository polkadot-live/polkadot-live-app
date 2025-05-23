// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ConfigRenderer,
  formatDecimal,
  getAddressChainId,
  getSpendableBalance,
} from '@polkadot-live/core';
import { chainUnits } from '@polkadot-live/consts/chains';
import { ellipsisFn, unitToPlanck } from '@w3ux/utils';
import { useEffect, useRef, useState } from 'react';

import type {
  ActionMeta,
  ExTransferKeepAliveData,
} from '@polkadot-live/types/tx';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SendRecipient } from '@ren/screens/Home/Send/types';
import type { ChangeEvent } from 'react';

const TOKEN_TRANSFER_LIMIT = 100;

interface SendNativeHook {
  fetchingSpendable: boolean;
  progress: number;
  receiver: SendRecipient | null;
  sendAmount: string;
  sender: string | null;
  senderNetwork: ChainID | null;
  spendable: bigint | null;
  summaryComplete: boolean;
  validAmount: boolean;
  getReceiverAccounts: () => (LocalAddress | LedgerLocalAddress)[];
  getSenderAccounts: () => LocalAddress[];
  getSenderAccountName: () => string;
  handleProceedClick: () => Promise<void>;
  handleResetClick: () => void;
  handleSendAmountBlur: () => void;
  handleSendAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSendAmountFocus: () => void;
  handleSenderChange: (senderAddress: string) => Promise<void>;
  proceedDisabled: () => boolean;
  setReceiver: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
}

export const useSendNative = (): SendNativeHook => {
  /**
   * Addresses fetched from main process.
   */
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, (LocalAddress | LedgerLocalAddress)[]>()
  );
  const addressMapRef = useRef<typeof addressMap>(addressMap);
  const [updateCache, setUpdateCache] = useState(false);
  const [progress, setProgress] = useState(0);

  const [sender, setSender] = useState<null | string>(null);
  const [receiver, setReceiver] = useState<null | SendRecipient>(null);
  const [senderNetwork, setSenderNetwork] = useState<ChainID | null>(null);
  const [sendAmount, setSendAmount] = useState<string>('0');

  const [fetchingSpendable, setFetchingSpendable] = useState(false);
  const [spendable, setSpendable] = useState<bigint | null>(null);
  const [validAmount, setValidAmount] = useState(true);

  const [summaryComplete, setSummaryComplete] = useState(false);

  /**
   * Handle proceed click.
   */
  const handleProceedClick = async () => {
    if (!(senderNetwork && sender && receiver)) {
      return;
    }

    // NOTE: Disable Polkadot transfers in alpha releases.
    if (senderNetwork === 'Polkadot') {
      return;
    }

    setSummaryComplete(true);

    // Data for action meta.
    const senderObj = getSenderAccounts().find(
      ({ address }) => address === sender
    )!;

    const recipientObj = {
      address: receiver.address,
      accountName:
        receiver.managed && receiver.accountName
          ? receiver.accountName
          : ellipsisFn(receiver.address, 8),
    };

    const sendAmountPlanck: string = unitToPlanck(
      formatDecimal(sendAmount),
      chainUnits(senderNetwork)
    ).toString();

    // Specific data for transfer extrinsic.
    const balanceData: ExTransferKeepAliveData = {
      recipientAddress: recipientObj.address,
      recipientAccountName: recipientObj.accountName,
      sendAmount: sendAmountPlanck,
    };

    // Action meta.
    const actionMeta: ActionMeta = {
      accountName: senderObj.name,
      source: senderObj.source,
      action: 'balances_transferKeepAlive',
      from: sender,
      pallet: 'balances',
      method: 'transferKeepAlive',
      chainId: senderNetwork,
      data: JSON.stringify(balanceData),
      args: [recipientObj.address, sendAmountPlanck],
    };

    // Send extrinsic to action window.
    window.myAPI.relaySharedState('isBuildingExtrinsic', true);
    const extrinsicsViewOpen = await window.myAPI.isViewOpen('action');

    if (!extrinsicsViewOpen) {
      // Relay init task to extrinsics window after its DOM has loaded.
      window.myAPI.openWindow('action', {
        windowId: 'action',
        task: 'action:init',
        serData: JSON.stringify(actionMeta),
      });

      // Analytics.
      window.myAPI.umamiEvent('window-open-extrinsics', {
        action: `send-transfer-keep-alive`,
      });
    } else {
      window.myAPI.openWindow('action');

      // Send init task directly to extrinsics window if it's already open.
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:init',
        data: JSON.stringify(actionMeta),
      });
    }
  };

  /**
   * Handle clicking the reset button.
   */
  const handleResetClick = () => {
    setSender(null);
    setSenderNetwork(null);
    setReceiver(null);
    setSpendable(null);
    setValidAmount(true);
    setSendAmount('0');
  };

  /**
   * Sender value changed callback.
   */
  const handleSenderChange = async (senderAddress: string) => {
    setFetchingSpendable(true);

    const chainId = getAddressChainId(senderAddress);
    setSender(senderAddress);
    setSenderNetwork(chainId);

    const result = await getSpendableBalance(senderAddress, chainId);
    setSpendable(result);
    setFetchingSpendable(false);

    // Reset other send fields.
    setReceiver(null);
    setSendAmount('0');
    setValidAmount(true);
  };

  /**
   * Utility to truncate a send amount to the network's allowable decimal places.
   */
  const truncateDecimals = (amount: string, chainId: ChainID): string => {
    const decimals = chainUnits(chainId);
    const [integerPart, decimalPart] = amount.split('.');

    if (!decimalPart) {
      return integerPart;
    }

    const truncatedDecimal = decimalPart.slice(0, decimals);
    return `${integerPart}.${truncatedDecimal}`;
  };

  /**
   * Removes leading zeros from a numeric string but keeps a single zero if a decimal follows.
   */
  const removeLeadingZeros = (value: string): string => {
    // Remove unnecessary leading zeros.
    let cleaned = value.replace(/^0+(?=\d)/, '');

    // If the first character is ".", prepend "0"
    if (cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }

    // Ensure empty string returns "0"
    return cleaned || '0';
  };

  /**
   * Send amount changed callback.
   */
  const handleSendAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;

    // Check for sender network and spendable flag.
    if (!(senderNetwork !== null && spendable !== null)) {
      setValidAmount(false);
      return;
    }
    // Check for zero values.
    if (val === '' || val === '0') {
      setSendAmount(val);
      setValidAmount(true);
      return;
    }
    if (!isNaN(Number(val))) {
      // Truncate to network's allowable decimal places and remove any leading zeros.
      const tmp: string = removeLeadingZeros(val);
      const amount = truncateDecimals(tmp, senderNetwork);
      setSendAmount(amount);

      // Check for negative value.
      if (Number(amount) < 0) {
        setSendAmount(amount);
        setValidAmount(false);
        return;
      }

      // NOTE: Limit send amount to 100 tokens in alpha releases.
      if (Number(amount) > TOKEN_TRANSFER_LIMIT) {
        setSendAmount(amount);
        setValidAmount(false);
        return;
      }

      // Check if send amount is less than spendable amount.
      const units = chainUnits(senderNetwork);
      const amountAsPlanck = unitToPlanck(amount, units);
      setValidAmount(spendable >= amountAsPlanck);
      return;
    }

    setValidAmount(false);
  };

  /**
   * Remove zero when send amount field focused.
   */
  const handleSendAmountFocus = () => {
    if (sendAmount === '0') {
      setSendAmount('');
    }
  };

  /**
   * Add zero when send amount field blurred and empty.
   */
  const handleSendAmountBlur = () => {
    if (sendAmount === '') {
      setSendAmount('0');
    }
  };

  /**
   * Return all addresses capable of signing extrinsics.
   */
  const getSenderAccounts = () => {
    const targetSources: AccountSource[] = ['vault', 'wallet-connect'];
    let result: LocalAddress[] = [];

    for (const source of targetSources) {
      const addresses = addressMap.get(source);
      if (!addresses || addresses.length === 0) {
        continue;
      }

      // NOTE: Disable Polkadot transfers in alpha releases.
      const filtered = (addresses as LocalAddress[]).filter(
        ({ address }) => getAddressChainId(address) !== 'Polkadot'
      );

      result = result.concat(filtered);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  };

  /**
   * Return all addresses for receiver address list.
   */
  const getReceiverAccounts = () => {
    let result: (LocalAddress | LedgerLocalAddress)[] = [];
    for (const addresses of addressMap.values()) {
      result = result.concat(addresses);
    }

    // Filter accounts on sender address network.
    return (
      result
        .filter(({ address }) => {
          if (!senderNetwork) {
            return true;
          } else {
            return getAddressChainId(address) === senderNetwork;
          }
        })
        // NOTE: Disable Polkadot transfers in alpha releases.
        .filter(({ address }) => getAddressChainId(address) !== 'Polkadot')
        // Don't include sender in list.
        .filter(({ address }) => address !== sender)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  /**
   * Conditions to enable the proceed button.
   */
  const proceedDisabled = () =>
    sender === null ||
    receiver === null ||
    sendAmount === '0' ||
    sendAmount === '' ||
    // NOTE: Limit token transfers to 100 tokens in alpha releases.
    (!isNaN(Number(sendAmount)) && Number(sendAmount) > TOKEN_TRANSFER_LIMIT) ||
    // NOTE: Disable Polkadot transfers in alpha releases.
    senderNetwork === 'Polkadot' ||
    !validAmount ||
    summaryComplete;

  /**
   * Utility for getting sender and receiver account names.
   */
  const getSenderAccountName = () =>
    !sender
      ? '-'
      : getSenderAccounts().find(({ address }) => address === sender)?.name ||
        ellipsisFn(sender, 12);

  /**
   * Fetch stored addresss from main when component loads.
   */
  useEffect(() => {
    const fetch = async () => {
      const serialized = (await window.myAPI.rawAccountTask({
        action: 'raw-account:getAll',
        data: null,
      })) as string;

      const parsedMap = new Map<AccountSource, string>(JSON.parse(serialized));

      for (const [source, ser] of parsedMap.entries()) {
        switch (source) {
          case 'vault':
          case 'read-only':
          case 'wallet-connect': {
            const parsed: LocalAddress[] = JSON.parse(ser);
            addressMapRef.current.set(source, parsed);
            setUpdateCache(true);
            break;
          }
          case 'ledger': {
            const parsed: LedgerLocalAddress[] = JSON.parse(ser);
            addressMapRef.current.set(source, parsed);
            setUpdateCache(true);
            break;
          }
          default: {
            continue;
          }
        }
      }
    };

    fetch();
  }, []);

  /**
   * Mechanism for updating address map state from an async process.
   */
  useEffect(() => {
    if (updateCache) {
      setAddressMap(addressMapRef.current);
      setUpdateCache(false);
    }
  }, [updateCache]);

  /**
   * Control summary complete flag.
   */
  useEffect(() => {
    setSummaryComplete(false);
  }, [sender, receiver, sendAmount]);

  /**
   * Progress bar controller.
   */
  useEffect(() => {
    let conditions = 0;

    sender && (conditions += 1);
    receiver && (conditions += 1);
    sendAmount !== '0' && sendAmount !== '' && validAmount && (conditions += 1);

    switch (conditions) {
      case 1: {
        setProgress(100 / 3);
        break;
      }
      case 2: {
        setProgress((100 / 3) * 2);
        break;
      }
      case 3: {
        setProgress(100);
        break;
      }
      default: {
        setProgress(0);
        break;
      }
    }
  }, [sender, receiver, sendAmount]);

  return {
    fetchingSpendable,
    progress,
    receiver,
    sendAmount,
    sender,
    senderNetwork,
    spendable,
    summaryComplete,
    validAmount,
    getReceiverAccounts,
    getSenderAccounts,
    getSenderAccountName,
    handleProceedClick,
    handleResetClick,
    handleSendAmountBlur,
    handleSendAmountChange,
    handleSendAmountFocus,
    handleSenderChange,
    proceedDisabled,
    setReceiver,
  };
};
