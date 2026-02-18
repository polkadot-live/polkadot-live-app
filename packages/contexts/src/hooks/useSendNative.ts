// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainUnits, getSendChains } from '@polkadot-live/consts/chains';
import { formatDecimal } from '@polkadot-live/core';
import { ellipsisFn, unitToPlanck } from '@w3ux/utils';
import { useEffect, useState } from 'react';
import {
  getRecipientAccounts,
  getSenderAccounts,
  removeLeadingZeros,
  truncateDecimals,
} from './utils';
import type {
  AccountSource,
  SendAccount,
  SendRecipient,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ActionMeta,
  ExTransferKeepAliveData,
} from '@polkadot-live/types/tx';
import type { ChangeEvent } from 'react';
import type { SendNativeHookInterface } from '../types/main';

export const useSendNative = (
  initExtrinsic: (meta: ActionMeta) => Promise<void>,
  fetchSendAccounts: () => Promise<Map<AccountSource, SendAccount[]>>,
  getSpendableBalance: (address: string, chainId: ChainID) => Promise<string>,
): SendNativeHookInterface => {
  /**
   * Addresses fetched from main process.
   */
  const [addressMap, setAddressMap] = useState(
    new Map<AccountSource, SendAccount[]>(),
  );

  const [sendNetwork, setSendNetwork] = useState<ChainID | null>(null);
  const [sender, setSender] = useState<SendAccount | null>(null);
  const [receiver, setReceiver] = useState<SendRecipient | null>(null);
  const [recipientFilter, setRecipientFilter] = useState('');
  const [updateSender, setUpdateSender] = useState(false);

  const [senderAccounts, setSenderAccounts] = useState<SendAccount[]>([]);
  const [recipientAccounts, setRecipientAccounts] = useState<SendAccount[]>([]);

  const [progress, setProgress] = useState(0);
  const [sendAmount, setSendAmount] = useState<string>('0');
  const [summaryComplete, setSummaryComplete] = useState(false);

  const [fetchingSpendable, setFetchingSpendable] = useState(false);
  const [spendable, setSpendable] = useState<bigint | null>(null);
  const [validAmount, setValidAmount] = useState(true);

  /**
   * Handle proceed click.
   */
  const handleProceedClick = async () => {
    if (!(sendNetwork && sender && receiver)) {
      return;
    }
    if (!getSendChains().includes(sendNetwork)) {
      return;
    }
    setSummaryComplete(true);

    // Data for action meta.
    const senderObj = getSenderAccounts(addressMap, sendNetwork).find(
      ({ address }) => address === sender.address,
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
      chainUnits(sendNetwork),
    ).toString();

    // Specific data for transfer extrinsic.
    const balanceData: ExTransferKeepAliveData = {
      recipientAddress: recipientObj.address,
      recipientAccountName: recipientObj.accountName,
      sendAmount: sendAmountPlanck,
    };

    // Initialize extrinsic.
    await initExtrinsic({
      accountName: senderObj.alias,
      source: senderObj.source,
      action: 'balances_transferKeepAlive',
      from: sender.address,
      pallet: 'balances',
      method: 'transferKeepAlive',
      chainId: sender.chainId,
      data: JSON.stringify(balanceData),
      args: [recipientObj.address, sendAmountPlanck],
      ledgerMeta: senderObj.ledgerMeta,
    });
  };

  /**
   * Handle clicking the reset button.
   */
  const handleResetClick = () => {
    setSendNetwork(null);
    setSender(null);
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
    if (!Number.isNaN(Number(val))) {
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
    sendNetwork === null ||
    sender === null ||
    receiver === null ||
    sendAmount === '0' ||
    sendAmount === '' ||
    Number.isNaN(Number(sendAmount)) ||
    !getSendChains().includes(sender.chainId) ||
    !validAmount ||
    summaryComplete;

  /**
   * Fetch stored addresss from main when component loads.
   */
  useEffect(() => {
    const fetch = async () => {
      const map = await fetchSendAccounts();
      setAddressMap(map);
    };
    fetch();
  }, []);

  /**
   * Sync sender and recipient accounts when send network changes.
   */
  useEffect(() => {
    setReceiver(null);
    setSender(null);
    setSendAmount('0');
    setValidAmount(true);

    if (!sendNetwork) {
      setSenderAccounts([]);
      setRecipientAccounts([]);
    } else {
      setSenderAccounts(getSenderAccounts(addressMap, sendNetwork));
      setRecipientAccounts(
        getRecipientAccounts(addressMap, sendNetwork, sender),
      );
    }
  }, [sendNetwork]);

  /**
   * Control summary complete flag.
   */
  useEffect(() => {
    setSummaryComplete(false);
  }, [sendNetwork, sender, receiver, sendAmount]);

  /**
   * Progress bar controller.
   */
  useEffect(() => {
    const steps = 4;
    let conditions = 0;
    if (sendNetwork) conditions += 1;
    if (sender) conditions += 1;
    if (receiver) conditions += 1;
    if (sendAmount !== '0' && sendAmount !== '' && validAmount) conditions += 1;
    setProgress((100 / steps) * conditions);
  }, [sendNetwork, sender, receiver, sendAmount]);

  /**
   * Update state when sender change is triggered.
   */
  useEffect(() => {
    setUpdateSender(false);
    if (!updateSender) {
      return;
    }
    if (!sender) {
      setReceiver(null);
      setRecipientAccounts([]);
      setSendAmount('0');
      setValidAmount(true);
      return;
    }
    // Update recipient acounts.
    setReceiver(null);
    setRecipientAccounts(getRecipientAccounts(addressMap, sendNetwork, sender));

    // Get sender's spendable balance.
    const { address, chainId } = sender;
    setFetchingSpendable(true);
    getSpendableBalance(address, chainId).then((result) => {
      setSpendable(BigInt(result || '0'));
      setFetchingSpendable(false);
    });

    // Reset amount input.
    setSendAmount('0');
    setValidAmount(true);
  }, [updateSender]);

  /**
   * Update recipient accounts list when filter changes (only in recipients dialog).
   */
  useEffect(() => {
    const accounts = getRecipientAccounts(addressMap, sendNetwork, sender);
    const applyFilter = recipientFilter !== '';
    !applyFilter
      ? setRecipientAccounts([...accounts])
      : setRecipientAccounts(
          accounts.filter(({ address }) => address.startsWith(recipientFilter)),
        );
  }, [recipientFilter]);

  return {
    fetchingSpendable,
    progress,
    receiver,
    recipientAccounts,
    sendAmount,
    sender,
    sendNetwork,
    senderAccounts,
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
    setRecipientFilter,
    setSender,
    setSendNetwork,
  };
};
