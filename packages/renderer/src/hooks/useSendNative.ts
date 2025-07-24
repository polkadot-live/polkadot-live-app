// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ConfigRenderer,
  formatDecimal,
  getSpendableBalance,
} from '@polkadot-live/core';
import { chainUnits, getSendChains } from '@polkadot-live/consts/chains';
import { ellipsisFn, unitToPlanck } from '@w3ux/utils';
import { useEffect, useState } from 'react';

import type {
  ActionMeta,
  ExTransferKeepAliveData,
} from '@polkadot-live/types/tx';
import type {
  AccountSource,
  ImportedGenericAccount,
  SendAccount,
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
  sender: SendAccount | null;
  spendable: bigint | null;
  summaryComplete: boolean;
  validAmount: boolean;
  handleProceedClick: () => Promise<void>;
  handleResetClick: () => void;
  handleSendAmountBlur: () => void;
  handleSendAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSendAmountFocus: () => void;
  handleSenderChange: (senderAccount: SendAccount) => void;
  proceedDisabled: () => boolean;
  setReceiver: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  setSender: React.Dispatch<React.SetStateAction<SendAccount | null>>;
  senderAccounts: SendAccount[];
  recipientAccounts: SendAccount[];
  setRecipientFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const useSendNative = (): SendNativeHook => {
  /**
   * Addresses fetched from main process.
   */
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, SendAccount[]>()
  );

  const [sender, setSender] = useState<SendAccount | null>(null);
  const [receiver, setReceiver] = useState<SendRecipient | null>(null);
  const [recipientFilter, setRecipientFilter] = useState('');
  const [updateSender, setUpdateSender] = useState(false);
  const [updateRecipients, setUpdateRecipients] = useState(false);

  /**
   * Return all addresses capable of signing extrinsics.
   */
  const getSenderAccounts = (
    accountMap?: Map<AccountSource, SendAccount[]>
  ): SendAccount[] => {
    const map = accountMap ? accountMap : addressMap;
    let result: SendAccount[] = [];

    const sources: AccountSource[] = ['ledger', 'vault', 'wallet-connect'];
    for (const source of sources) {
      const accounts = map.get(source);
      if (!accounts || accounts.length === 0) {
        continue;
      }

      // NOTE: Disable Polkadot transfers in alpha releases.
      const supportedChains = getSendChains();
      const filtered: SendAccount[] = accounts
        .filter(({ chainId }) => supportedChains.includes(chainId))
        .map((en) => ({ ...en, source }));

      result = result.concat(filtered);
    }

    return result.sort((a, b) => a.alias.localeCompare(b.alias));
  };

  /**
   * Return all addresses for receiver address list.
   */
  const getRecipientAccounts = (
    accountMap?: Map<AccountSource, SendAccount[]>
  ): SendAccount[] => {
    const map = accountMap ? accountMap : addressMap;
    let result: SendAccount[] = [];
    for (const addresses of map.values()) {
      result = result.concat(addresses);
    }

    // Filter accounts on sender address network.
    return (
      result
        .filter(({ chainId }) => {
          if (!sender) {
            return getSendChains().includes(chainId);
          } else {
            return chainId === sender.chainId;
          }
        })
        // NOTE: Disable Polkadot transfers in alpha releases.
        .filter(({ chainId }) => !chainId.startsWith('Polkadot'))
        // Don't include sender in list.
        .filter(({ address }) => address !== sender?.address)
        .sort((a, b) => a.alias.localeCompare(b.alias))
    );
  };

  const [senderAccounts, setSenderAccounts] = useState<SendAccount[]>([]);
  const [recipientAccounts, setRecipientAccounts] = useState<SendAccount[]>([]);

  const [progress, setProgress] = useState(0);
  const [sendAmount, setSendAmount] = useState<string>('0');

  const [fetchingSpendable, setFetchingSpendable] = useState(false);
  const [spendable, setSpendable] = useState<bigint | null>(null);
  const [validAmount, setValidAmount] = useState(true);

  const [summaryComplete, setSummaryComplete] = useState(false);

  /**
   * Handle proceed click.
   */
  const handleProceedClick = async () => {
    if (!(sender && receiver)) {
      return;
    }

    // NOTE: Disable Polkadot transfers in alpha releases.
    if (!getSendChains().includes(sender.chainId)) {
      return;
    }

    setSummaryComplete(true);

    // Data for action meta.
    const senderObj = getSenderAccounts().find(
      ({ address }) => address === sender.address
    )!;

    const recipientObj = {
      address: receiver.address,
      accountName:
        receiver.managed && receiver.accountName
          ? receiver.accountName
          : ellipsisFn(receiver.address, 5),
    };

    const sendAmountPlanck: string = unitToPlanck(
      formatDecimal(sendAmount),
      chainUnits(sender.chainId)
    ).toString();

    // Specific data for transfer extrinsic.
    const balanceData: ExTransferKeepAliveData = {
      recipientAddress: recipientObj.address,
      recipientAccountName: recipientObj.accountName,
      sendAmount: sendAmountPlanck,
    };

    // Action meta.
    const actionMeta: ActionMeta = {
      accountName: senderObj.alias,
      source: senderObj.source,
      action: 'balances_transferKeepAlive',
      from: sender.address,
      pallet: 'balances',
      method: 'transferKeepAlive',
      chainId: sender.chainId,
      data: JSON.stringify(balanceData),
      args: [recipientObj.address, sendAmountPlanck],
    };

    // Send extrinsic to action window.
    window.myAPI.relaySharedState('extrinsic:building', true);
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
    setUpdateSender(true);

    setReceiver(null);
    setSpendable(null);
    setValidAmount(true);
    setSendAmount('0');
  };

  /**
   * Sender value changed callback.
   */
  const handleSenderChange = (senderAccount: SendAccount) => {
    setSender({ ...senderAccount });
    setUpdateSender(true);
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
    if (!(sender !== null && spendable !== null)) {
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
      const amount = truncateDecimals(tmp, sender.chainId);
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
      const units = chainUnits(sender.chainId);
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
    !getSendChains().includes(sender.chainId) ||
    !validAmount ||
    summaryComplete;

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
      const map = new Map<AccountSource, SendAccount[]>();

      for (const [source, ser] of parsedMap.entries()) {
        const parsed: ImportedGenericAccount[] = JSON.parse(ser);
        const addresses = parsed
          .map(({ encodedAccounts }) =>
            Object.values(encodedAccounts).map((en) => en)
          )
          .flat();

        const accounts = addresses.map((en) => ({ ...en, source }));
        map.set(source, accounts);
      }

      setAddressMap(map);

      // Set sender and receiver accounts.
      setSenderAccounts(getSenderAccounts(map));
      setRecipientAccounts(getRecipientAccounts(map));
    };

    fetch();
  }, []);

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

  /**
   * Update state when sender change is triggered.
   */
  useEffect(() => {
    if (!updateSender) {
      return;
    }

    // Function to get sender's spendable balance.
    const getSpendable = () => {
      if (sender === null) {
        return;
      }

      const { address, chainId } = sender;
      setFetchingSpendable(true);
      getSpendableBalance(address, chainId).then((result) => {
        setSpendable(result);
        setFetchingSpendable(false);
      });
    };

    // Setup state when new sender set.
    if (sender !== null) {
      setSendAmount('0');
      setValidAmount(true);

      setReceiver(null);
      setRecipientFilter('');
      getSpendable();
    }

    // Update recipients list state.
    setUpdateRecipients(true);
    setUpdateSender(false);
  }, [updateSender]);

  /**
   * Update recipient accounts list when triggered.
   */
  useEffect(() => {
    if (!updateRecipients) {
      return;
    }

    const accounts = getRecipientAccounts();
    sender === null
      ? setRecipientAccounts(accounts)
      : setRecipientAccounts(
          accounts.filter(({ chainId }) => chainId === sender.chainId)
        );

    setUpdateRecipients(false);
  }, [updateRecipients]);

  /**
   * Update recipient accounts list when filter changes (only in recipients dialog).
   */
  useEffect(() => {
    const accounts = getRecipientAccounts();
    if (recipientFilter === '') {
      setRecipientAccounts([...accounts]);
    } else {
      const filtered = accounts.filter(({ address }) =>
        address.startsWith(recipientFilter)
      );
      setRecipientAccounts(filtered);
    }
  }, [recipientFilter]);

  return {
    fetchingSpendable,
    progress,
    receiver,
    sendAmount,
    sender,
    spendable,
    summaryComplete,
    validAmount,
    handleProceedClick,
    handleResetClick,
    handleSendAmountBlur,
    handleSendAmountChange,
    handleSendAmountFocus,
    handleSenderChange,
    proceedDisabled,
    setReceiver,
    setSender,
    senderAccounts,
    recipientAccounts,
    setRecipientFilter,
  };
};
