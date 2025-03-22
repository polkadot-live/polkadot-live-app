// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as themeVariables from '../../../theme/variables';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';

import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { chainCurrency, chainUnits } from '@ren/config/chains';
import { Identicon, MainHeading } from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect, useRef, useState } from 'react';
import { ellipsisFn, unitToPlanck } from '@w3ux/utils';
import { getAddressChainId } from '@app/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionButton, InputWrapper } from './Wrappers';
import { getSpendableBalance } from '@ren/utils/AccountUtils';
import { getBalanceText } from '@ren/utils/TextUtils';
import {
  AccountNameWithTooltip,
  AddressWithTooltip,
  InfoPanel,
  InfoPanelSingle,
  NextStepArrow,
  ProgressBar,
  SelectBox,
  TriggerContent,
} from './SendHelpers';

import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type {
  ActionMeta,
  ExTransferKeepAliveData,
} from '@polkadot-live/types/tx';
import type BigNumber from 'bignumber.js';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChangeEvent } from 'react';
import type { SendAccordionValue, SendRecipient } from './types';
import { DialogRecipient } from './Dialogs';

const TOKEN_TRANSFER_LIMIT = 100;

export const Send: React.FC = () => {
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
  const [spendable, setSpendable] = useState<BigNumber | null>(null);
  const [validAmount, setValidAmount] = useState(true);

  const [summaryComplete, setSummaryComplete] = useState(false);

  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<SendAccordionValue[]>([
    'section-sender',
  ]);

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
      sendAmount.toString(),
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
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);
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
    setAccordionValue(['section-sender']);
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
      const bnAmountAsPlanck = unitToPlanck(amount, units);
      setValidAmount(spendable.gte(bnAmountAsPlanck));
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
   * Handle copy to clickboard.
   */
  const handleClipboardCopy = async (text: string) =>
    await window.myAPI.copyToClipboard(text);

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
   * Handle clicking a green next step arrow.
   */
  const handleNextStep = (completed: SendAccordionValue) => {
    switch (completed) {
      case 'section-sender': {
        setAccordionValue(['section-receiver']);
        break;
      }
      case 'section-receiver': {
        setAccordionValue(['section-send-amount']);
        break;
      }
      case 'section-send-amount': {
        setAccordionValue(['section-summary']);
        break;
      }
    }
  };

  /**
   * Utility for getting sender and receiver account names.
   */
  const getSenderAccountName = () =>
    !sender
      ? '-'
      : getSenderAccounts().find(({ address }) => address === sender)?.name ||
        ellipsisFn(sender, 12);

  const emptySenders = getSenderAccounts().length === 0;
  const emptyReceivers = getReceiverAccounts().length === 0;

  return (
    <FlexColumn style={{ padding: '2rem 1rem' }}>
      <MainHeading>Send</MainHeading>

      <FlexColumn $rowGap={'0.5rem'} style={{ marginBottom: '1rem' }}>
        <UI.InfoCard icon={FA.faInfoCircle} style={{ marginTop: '0' }}>
          <FlexColumn>
            <div>Send native tokens to a recipient on the same network.</div>
          </FlexColumn>
        </UI.InfoCard>

        <FlexColumn $rowGap={'0.5rem'}>
          <UI.InfoCard
            icon={FA.faWarning}
            style={{ color: 'var(--accent-warning)', marginTop: '0' }}
          >
            <FlexColumn>
              <div
                style={{ lineHeight: '1.5rem', color: 'var(--accent-warning)' }}
              >
                This alpha release supports native transfers of up to <b>100</b>{' '}
                tokens on <b>Kusama</b> and <b>Westend</b> networks.
              </div>
            </FlexColumn>
          </UI.InfoCard>

          <div>
            <ProgressBar value={progress} max={100} />
          </div>
        </FlexColumn>
      </FlexColumn>

      <UI.AccordionWrapper $onePart={true}>
        <Accordion.Root
          className="AccordionRoot"
          type="multiple"
          value={accordionValue}
          onValueChange={(val) =>
            setAccordionValue(val as SendAccordionValue[])
          }
        >
          <FlexColumn $rowGap={'1.25rem'}>
            {/** Sender Section */}
            <Accordion.Item className="AccordionItem" value="section-sender">
              <UI.AccordionTrigger narrow={true}>
                <TriggerContent label="Sender" complete={sender !== null} />
              </UI.AccordionTrigger>
              <UI.AccordionContent narrow={true}>
                <FlexColumn $rowGap={'2px'}>
                  <SelectBox
                    disabled={emptySenders}
                    value={sender || ''}
                    ariaLabel="Sender"
                    placeholder="Select Sender"
                    onValueChange={async (val) => await handleSenderChange(val)}
                  >
                    {getSenderAccounts().map(
                      ({ name: accountName, address }) => (
                        <UI.SelectItem
                          key={`sender-${address}`}
                          value={address}
                        >
                          <div className="innerRow">
                            <div>
                              <Identicon value={address} fontSize={'2.1rem'} />
                            </div>
                            <div>{accountName}</div>
                          </div>
                        </UI.SelectItem>
                      )
                    )}
                  </SelectBox>

                  {emptySenders ? (
                    <InfoPanelSingle>
                      <span style={{ color: 'var(--accent-warning)' }}>
                        No managed accounts are capable of signing extrinsics
                      </span>
                    </InfoPanelSingle>
                  ) : (
                    <InfoPanelSingle>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.8rem',
                          alignItems: 'center',
                        }}
                      >
                        {!sender ? (
                          <span style={{ opacity: '0.5' }}>
                            No account selected
                          </span>
                        ) : (
                          <>
                            <AddressWithTooltip
                              theme={theme}
                              address={sender}
                            />
                            <UI.CopyButton
                              theme={theme}
                              onCopyClick={async () =>
                                await handleClipboardCopy(sender)
                              }
                            />
                          </>
                        )}
                      </div>
                    </InfoPanelSingle>
                  )}
                  <NextStepArrow
                    complete={sender !== null}
                    onClick={() => handleNextStep('section-sender')}
                  />
                </FlexColumn>
              </UI.AccordionContent>
            </Accordion.Item>

            {/** Recipient Section */}
            <Accordion.Item className="AccordionItem" value="section-receiver">
              <UI.AccordionTrigger narrow={true}>
                <TriggerContent
                  label="Recipient"
                  complete={receiver !== null}
                />
              </UI.AccordionTrigger>
              <UI.AccordionContent narrow={true}>
                <FlexColumn $rowGap={'2px'}>
                  {/** Dialog */}
                  <DialogRecipient
                    addresses={getReceiverAccounts()}
                    recipient={receiver}
                    chainId={senderNetwork}
                    sender={sender}
                    setReceiver={setReceiver}
                  />

                  {emptyReceivers ? (
                    <InfoPanelSingle>
                      <span style={{ color: 'var(--accent-warning)' }}>
                        No managed accounts found on this network
                      </span>
                    </InfoPanelSingle>
                  ) : (
                    <InfoPanelSingle>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.8rem',
                          alignItems: 'center',
                        }}
                      >
                        {!receiver ? (
                          <span style={{ opacity: '0.5' }}>
                            No account selected
                          </span>
                        ) : (
                          <>
                            <AddressWithTooltip
                              theme={theme}
                              address={receiver.address}
                            />
                            <UI.CopyButton
                              theme={theme}
                              onCopyClick={async () =>
                                await handleClipboardCopy(receiver.address)
                              }
                            />
                          </>
                        )}
                      </div>
                    </InfoPanelSingle>
                  )}
                  <NextStepArrow
                    complete={receiver !== null}
                    onClick={() => handleNextStep('section-receiver')}
                  />
                </FlexColumn>
              </UI.AccordionContent>
            </Accordion.Item>

            {/** Send Amount Section */}
            <Accordion.Item
              className="AccordionItem"
              value="section-send-amount"
            >
              <UI.AccordionTrigger narrow={true}>
                <TriggerContent
                  label="Send Amount"
                  loading={fetchingSpendable}
                  complete={
                    sendAmount !== '0' && sendAmount !== '' && validAmount
                  }
                />
              </UI.AccordionTrigger>
              <UI.AccordionContent narrow={true}>
                <FlexColumn $rowGap={'2px'}>
                  <InputWrapper
                    style={{
                      border: `solid 1px ${validAmount ? 'transparent' : '#6a2727'}`,
                    }}
                  >
                    <input
                      type="number"
                      disabled={!sender || !senderNetwork || fetchingSpendable}
                      value={sendAmount}
                      onChange={(e) => handleSendAmountChange(e)}
                      onFocus={() => handleSendAmountFocus()}
                      onBlur={() => handleSendAmountBlur()}
                    />
                    <span>
                      {senderNetwork ? chainCurrency(senderNetwork) : '-'}
                    </span>
                  </InputWrapper>
                  <InfoPanel label={'Spendable Balance:'}>
                    {spendable && senderNetwork
                      ? getBalanceText(spendable, senderNetwork)
                      : '-'}
                  </InfoPanel>
                  <NextStepArrow
                    complete={
                      !(sendAmount === '0' || sendAmount === '') && validAmount
                    }
                    onClick={() => handleNextStep('section-send-amount')}
                  />
                </FlexColumn>
              </UI.AccordionContent>
            </Accordion.Item>

            {/** Summary Section */}
            <Accordion.Item className="AccordionItem" value="section-summary">
              <UI.AccordionTrigger narrow={true}>
                <TriggerContent label="Summary" complete={summaryComplete} />
              </UI.AccordionTrigger>
              <UI.AccordionContent narrow={true}>
                <FlexColumn $rowGap={'2px'}>
                  <InfoPanel label={'Network:'}>
                    {senderNetwork || '-'}
                  </InfoPanel>

                  {/** Sender */}
                  <InfoPanel label={'Sender:'}>
                    {!sender ? (
                      '-'
                    ) : (
                      <AccountNameWithTooltip
                        theme={theme}
                        address={sender}
                        accountName={getSenderAccountName()}
                      />
                    )}
                  </InfoPanel>

                  {/** Receiver */}
                  <InfoPanel label={'Recipient:'}>
                    {!receiver ? (
                      '-'
                    ) : (
                      <AccountNameWithTooltip
                        theme={theme}
                        address={receiver.address}
                        accountName={
                          receiver.accountName ||
                          ellipsisFn(receiver.address, 8)
                        }
                      />
                    )}
                  </InfoPanel>

                  {/** Send Amount */}
                  <InfoPanel label={'Send Amount:'}>
                    {sendAmount === '0' || sendAmount === '' || !validAmount
                      ? '-'
                      : `${sendAmount} ${chainCurrency(senderNetwork!)}`}
                  </InfoPanel>

                  <FlexRow $gap={'0.5rem'}>
                    <ActionButton
                      style={{ flex: 1 }}
                      $backgroundColor={'var(--button-background-secondary)'}
                      onClick={() => handleResetClick()}
                      disabled={false}
                    >
                      <FontAwesomeIcon
                        icon={FA.faBurst}
                        transform={'shrink-4'}
                      />
                      <span>Reset</span>
                    </ActionButton>
                    <ActionButton
                      style={{ flex: 3 }}
                      $backgroundColor={'var(--button-pink-background)'}
                      onClick={async () => await handleProceedClick()}
                      disabled={proceedDisabled()}
                    >
                      <FontAwesomeIcon
                        icon={summaryComplete ? FA.faCheck : FA.faChevronRight}
                        transform={'shrink-4'}
                      />
                      <span>{summaryComplete ? 'Completed' : 'Proceed'}</span>
                    </ActionButton>
                  </FlexRow>
                </FlexColumn>
              </UI.AccordionContent>
            </Accordion.Item>
          </FlexColumn>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </FlexColumn>
  );
};
