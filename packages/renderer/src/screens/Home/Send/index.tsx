// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { FlexColumn, FlexRow } from '@polkadot-live/ui/styles';

import { chainCurrency } from '@polkadot-live/consts/chains';
import { Identicon, MainHeading } from '@polkadot-live/ui/components';
import { useConnections } from '@ren/contexts/common';
import { useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionButton, InputWrapper } from './Wrappers';
import { formatDecimal, getBalanceText } from '@polkadot-live/core';
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

import { useSendNative } from '@ren/hooks/useSendNative';
import { DialogRecipient } from './Dialogs';
import type { SendAccordionValue } from './types';
import type { ChainID } from '@polkadot-live/types/chains';

export const Send: React.FC = () => {
  const { getOnlineMode } = useConnections();
  const {
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
  } = useSendNative();

  /**
   * Addresses fetched from main process.
   */
  const { getTheme } = useConnections();
  const theme = getTheme();

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<SendAccordionValue[]>([
    'section-sender',
  ]);

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
   * Handle copy to clickboard.
   */
  const handleClipboardCopy = async (text: string) =>
    await window.myAPI.copyToClipboard(text);

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
                tokens on <b>Kusama</b> and <b>Westend Asset Hub</b> networks.
              </div>
            </FlexColumn>
          </UI.InfoCard>

          <div>
            <ProgressBar value={progress} max={100} />
          </div>
        </FlexColumn>
      </FlexColumn>

      <FlexColumn $rowGap={'0'}>
        {!getOnlineMode() && (
          <UI.OfflineWarning
            text={'Disabled in offline mode'}
            style={{ margin: '0 0 1.25rem 0.25rem' }}
          />
        )}
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
                      disabled={emptySenders || !getOnlineMode()}
                      ariaLabel="Sender"
                      placeholder="Select Sender"
                      onValueChange={async (val) => {
                        const [chainId, address] = val.split(':', 2);
                        await handleSenderChange(address, chainId as ChainID);
                      }}
                    >
                      {getSenderAccounts().map((enAccount) => (
                        <UI.SelectItem
                          key={`sender-${enAccount.chainId}-${enAccount.address}`}
                          value={`${enAccount.chainId}:${enAccount.address}`}
                        >
                          <div className="innerRow">
                            <div>
                              <Identicon
                                value={enAccount.address}
                                fontSize={'2.1rem'}
                              />
                            </div>
                            <div>{enAccount.alias}</div>
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
              <Accordion.Item
                className="AccordionItem"
                value="section-receiver"
              >
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
                        disabled={
                          !sender ||
                          !senderNetwork ||
                          fetchingSpendable ||
                          !getOnlineMode()
                        }
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
                        !(sendAmount === '0' || sendAmount === '') &&
                        validAmount
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
                            ellipsisFn(receiver.address, 5)
                          }
                        />
                      )}
                    </InfoPanel>

                    {/** Send Amount */}
                    <InfoPanel label={'Send Amount:'}>
                      {sendAmount === '0' || sendAmount === '' || !validAmount
                        ? '-'
                        : `${formatDecimal(sendAmount)} ${chainCurrency(senderNetwork!)}`}
                    </InfoPanel>

                    <FlexRow $gap={'0.5rem'}>
                      <ActionButton
                        style={{ flex: 1 }}
                        $backgroundColor={'var(--button-background-secondary)'}
                        onClick={() => {
                          handleResetClick();
                          setAccordionValue(['section-sender']);
                        }}
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
                          icon={
                            summaryComplete ? FA.faCheck : FA.faChevronRight
                          }
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
    </FlexColumn>
  );
};
