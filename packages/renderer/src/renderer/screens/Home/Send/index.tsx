// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../../theme/variables';

import { chainCurrency, chainUnits } from '@ren/config/chains';
import { Identicon, MainHeading } from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect, useRef, useState } from 'react';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import { getAddressChainId } from '@app/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { AddButton, FlexRow, InputWrapper } from './Wrappers';
import {
  CopyButtonWithTooltip,
  FlexColumn,
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
import { getSpendableBalance } from '@ren/utils/AccountUtils';
import { getBalanceText } from '@ren/utils/TextUtils';

import BigNumber from 'bignumber.js';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChangeEvent } from 'react';
import type { AddressWithTooltipProps, SendAccordionValue } from './types';

/**
 * Address with tooltip component.
 */
const AddressWithTooltip = ({ theme, address }: AddressWithTooltipProps) => (
  <UI.TooltipRx style={{ fontSize: '0.9rem ' }} theme={theme} text={address}>
    <span style={{ cursor: 'default' }}>{ellipsisFn(address, 12)}</span>
  </UI.TooltipRx>
);

/** Send component. */
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
  const [receiver, setReceiver] = useState<null | string>(null);
  const [senderNetwork, setSenderNetwork] = useState<ChainID | null>(null);

  const [sendAmount, setSendAmount] = useState<string>('0');
  const [spendable, setSpendable] = useState<BigNumber | null>(null);
  const [validAmount, setValidAmount] = useState(true);

  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<SendAccordionValue[]>([
    'section-sender',
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [estimatedFee, setEstimatedFee] = useState<string>('');

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
   * Sender value changed callback.
   */
  const handleSenderChange = async (senderAddress: string) => {
    const chainId = getAddressChainId(senderAddress);
    setSender(senderAddress);
    setSenderNetwork(chainId);

    const result = await getSpendableBalance(senderAddress, chainId);
    setSpendable(result);

    // Reset other send fields.
    setReceiver(null);
    setSendAmount('0');
  };

  /**
   * Send amount changed callback.
   */
  const handleSendAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val === '' || val === '0') {
      setSendAmount(val === '' ? '' : val);
      setValidAmount(true);
    } else if (!isNaN(Number(val))) {
      setSendAmount(val === '' ? '' : val);

      // Preliminary checks.
      if (!spendable) {
        setValidAmount(false);
        return;
      }

      // Check if send amount is less than spendable amount.
      const units = chainUnits(senderNetwork!);
      const amountAsUnit = new BigNumber(val);
      const spendableAsUnit = planckToUnit(spendable!, units);
      setValidAmount(spendableAsUnit.gte(amountAsUnit));
    } else {
      setValidAmount(false);
    }
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
    const targetSources: AccountSource[] = ['vault'];
    let result: LocalAddress[] = [];

    for (const source of targetSources) {
      const addresses = addressMap.get(source);
      if (!addresses || addresses.length === 0) {
        continue;
      }
      result = result.concat(addresses as LocalAddress[]);
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
    !validAmount;

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

  const emptySenders = getSenderAccounts().length === 0;
  const emptyReceivers = getReceiverAccounts().length === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '1rem',
        padding: '2rem 1rem',
      }}
    >
      <MainHeading>Send</MainHeading>

      <div style={{ marginBottom: '1rem' }}>
        <ProgressBar value={progress} max={100} />
      </div>

      <UI.AccordionWrapper>
        <Accordion.Root
          className="AccordionRoot"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          type="multiple"
          value={accordionValue}
          onValueChange={(val) =>
            setAccordionValue(val as SendAccordionValue[])
          }
        >
          {/** Sender Section */}
          <Accordion.Item className="AccordionItem" value="section-sender">
            <UI.AccordionTrigger narrow={true}>
              <TriggerContent label="Sender" complete={sender !== null} />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <SelectBox
                  disabled={emptySenders}
                  value={sender || ''}
                  ariaLabel="Sender"
                  placeholder="Select Sender"
                  onValueChange={async (val) => await handleSenderChange(val)}
                >
                  {getSenderAccounts().map(({ name: accountName, address }) => (
                    <UI.SelectItem key={`sender-${address}`} value={address}>
                      <div className="innerRow">
                        <div>
                          <Identicon value={address} size={20} />
                        </div>
                        <div>{accountName}</div>
                      </div>
                    </UI.SelectItem>
                  ))}
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
                          <AddressWithTooltip theme={theme} address={sender} />
                          <CopyButtonWithTooltip
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

          {/** Receiver Section */}
          <Accordion.Item className="AccordionItem" value="section-receiver">
            <UI.AccordionTrigger narrow={true}>
              <TriggerContent label="Receiver" complete={receiver !== null} />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <SelectBox
                  disabled={emptyReceivers}
                  value={receiver || ''}
                  ariaLabel="Receiver"
                  placeholder="Select Receiver"
                  onValueChange={(val) => setReceiver(val)}
                >
                  {getReceiverAccounts().map(
                    ({ name: accountName, address }) => (
                      <UI.SelectItem
                        key={`receiver-${address}`}
                        value={address}
                      >
                        <div className="innerRow">
                          <div>
                            <Identicon value={address} size={20} />
                          </div>
                          <div>{accountName}</div>
                        </div>
                      </UI.SelectItem>
                    )
                  )}
                </SelectBox>
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
                            address={receiver}
                          />
                          <CopyButtonWithTooltip
                            theme={theme}
                            onCopyClick={async () =>
                              await handleClipboardCopy(receiver)
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
          <Accordion.Item className="AccordionItem" value="section-send-amount">
            <UI.AccordionTrigger narrow={true}>
              <TriggerContent
                label="Send Amount"
                complete={
                  sendAmount !== '0' && sendAmount !== '' && validAmount
                }
              />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <InputWrapper
                  style={{
                    border: `solid 1px ${validAmount ? 'transparent' : '#6a2727'}`,
                  }}
                >
                  <input
                    type="number"
                    disabled={!sender || !senderNetwork}
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
              <TriggerContent label="Summary" complete={false} />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <InfoPanel label={'Network:'}>{senderNetwork || '-'}</InfoPanel>

                {/** Sender */}
                <InfoPanel label={'Sender:'}>
                  {!sender ? (
                    '-'
                  ) : (
                    <FlexRow>
                      <AddressWithTooltip theme={theme} address={sender} />
                      <CopyButtonWithTooltip
                        theme={theme}
                        onCopyClick={async () =>
                          await handleClipboardCopy(sender)
                        }
                      />
                    </FlexRow>
                  )}
                </InfoPanel>

                {/** Receiver */}
                <InfoPanel label={'Receiver:'}>
                  {!receiver ? (
                    '-'
                  ) : (
                    <FlexRow>
                      <AddressWithTooltip theme={theme} address={receiver} />
                      <CopyButtonWithTooltip
                        theme={theme}
                        onCopyClick={async () =>
                          await handleClipboardCopy(receiver)
                        }
                      />
                    </FlexRow>
                  )}
                </InfoPanel>

                {/** Send Amount */}
                <InfoPanel label={'Send Amount:'}>
                  {sendAmount === '0' || sendAmount === '' || !validAmount
                    ? '-'
                    : `${sendAmount} ${chainCurrency(senderNetwork!)}`}
                </InfoPanel>

                {/** Estimated Fee */}
                <InfoPanel label={'Estimated Fee:'}>
                  {estimatedFee === ''
                    ? '-'
                    : `${estimatedFee} ${chainCurrency(senderNetwork!)}`}
                </InfoPanel>

                <AddButton
                  onClick={() => console.log('Add')}
                  disabled={proceedDisabled()}
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    transform={'shrink-4'}
                  />
                  <span>Proceed</span>
                </AddButton>
              </FlexColumn>
            </UI.AccordionContent>
          </Accordion.Item>
        </Accordion.Root>
      </UI.AccordionWrapper>
    </div>
  );
};
