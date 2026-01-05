// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui';
import * as FA from '@fortawesome/free-solid-svg-icons';
import { FlexColumn, FlexRow } from '@polkadot-live/styles';
import { chainCurrency } from '@polkadot-live/consts/chains';
import { useConnections } from '@polkadot-live/contexts';
import { useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionButton, InputWrapper } from './Wrappers';
import { DialogSelectAccount, DialogSelectNetwork } from './Dialogs';
import { formatDecimal, getBalanceText } from '@polkadot-live/core';
import {
  AccountNameWithTooltip,
  AddressWithTooltip,
  InfoPanel,
  InfoPanelSingle,
  NextStepArrow,
  ProgressBar,
  TriggerContent,
} from './SendHelpers';
import type { SendAccordionValue, SendProps } from './types';

export const Send = ({
  useSendNative,
  initExtrinsic,
  fetchSendAccounts,
  getSpendableBalance,
}: SendProps) => {
  const { copyToClipboard, getOnlineMode, getTheme } = useConnections();
  const theme = getTheme();

  const {
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
  } = useSendNative(initExtrinsic, fetchSendAccounts, getSpendableBalance);
  const emptySenders = senderAccounts.length === 0;

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] =
    useState<SendAccordionValue>('section-network');

  /**
   * Handle clicking a green next step arrow.
   */
  const handleNextStep = (completed: SendAccordionValue) => {
    switch (completed) {
      case 'section-network': {
        setAccordionValue('section-sender');
        break;
      }
      case 'section-sender': {
        setAccordionValue('section-receiver');
        break;
      }
      case 'section-receiver': {
        setAccordionValue('section-send-amount');
        break;
      }
      case 'section-send-amount': {
        setAccordionValue('section-summary');
        break;
      }
    }
  };

  return (
    <FlexColumn style={{ padding: '2rem 1rem' }}>
      <UI.MainHeading>Send</UI.MainHeading>
      {!getOnlineMode() && <UI.OfflineBanner rounded={true} />}

      <FlexColumn $rowGap={'0.5rem'} style={{ marginBottom: '1rem' }}>
        <UI.ScreenInfoCard>
          <div>Send native tokens to a recipient on the same network.</div>
        </UI.ScreenInfoCard>
        <FlexColumn $rowGap={'0.5rem'}>
          <div>
            <ProgressBar value={progress} max={100} />
          </div>
        </FlexColumn>
      </FlexColumn>

      <FlexColumn $rowGap={'0'}>
        <UI.AccordionWrapper $onePart={true}>
          <Accordion.Root
            className="AccordionRoot"
            type="single"
            value={accordionValue}
            onValueChange={(val) =>
              setAccordionValue(val as SendAccordionValue)
            }
          >
            <FlexColumn $rowGap={'1.25rem'}>
              {/** Network Section */}
              <Accordion.Item className="AccordionItem" value="section-network">
                <UI.AccordionTrigger narrow={true}>
                  <TriggerContent
                    label="Network"
                    complete={sendNetwork !== null}
                  />
                </UI.AccordionTrigger>

                <UI.AccordionContent narrow={true}>
                  <FlexColumn $rowGap={'2px'}>
                    <DialogSelectNetwork
                      sendNetwork={sendNetwork}
                      setSendNetwork={setSendNetwork}
                    />
                    <NextStepArrow
                      complete={sendNetwork !== null}
                      onClick={() => handleNextStep('section-network')}
                    />
                  </FlexColumn>
                </UI.AccordionContent>
              </Accordion.Item>

              {/** Sender Section */}
              <Accordion.Item
                disabled={!sendNetwork}
                className="AccordionItem"
                value="section-sender"
              >
                <UI.AccordionTrigger
                  className={!sendNetwork ? 'disable' : undefined}
                  narrow={true}
                >
                  <TriggerContent label="Sender" complete={sender !== null} />
                </UI.AccordionTrigger>
                <UI.AccordionContent narrow={true}>
                  <FlexColumn $rowGap={'2px'}>
                    {/** Sender Dialog */}
                    <DialogSelectAccount
                      accounts={senderAccounts}
                      accountRole="sender"
                      recipient={receiver}
                      sender={sender}
                      setReceiver={setReceiver}
                      setRecipientFilter={setRecipientFilter}
                      setSender={setSender}
                      handleSenderChange={handleSenderChange}
                    />

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
                                address={sender.address}
                              />
                              <UI.CopyButton
                                theme={theme}
                                onCopyClick={async () =>
                                  copyToClipboard(sender.address)
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
                disabled={!sender}
                className="AccordionItem"
                value="section-receiver"
              >
                <UI.AccordionTrigger
                  className={!sender ? 'disable' : undefined}
                  narrow={true}
                >
                  <TriggerContent
                    label="Recipient"
                    complete={receiver !== null}
                  />
                </UI.AccordionTrigger>
                <UI.AccordionContent narrow={true}>
                  <FlexColumn $rowGap={'2px'}>
                    {/** Recipient Dialog */}
                    <DialogSelectAccount
                      accounts={recipientAccounts}
                      accountRole="recipient"
                      recipient={receiver}
                      sender={sender}
                      setReceiver={setReceiver}
                      setRecipientFilter={setRecipientFilter}
                      setSender={setSender}
                      handleSenderChange={handleSenderChange}
                    />
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
                                copyToClipboard(receiver.address)
                              }
                            />
                          </>
                        )}
                      </div>
                    </InfoPanelSingle>
                    <NextStepArrow
                      complete={receiver !== null}
                      onClick={() => handleNextStep('section-receiver')}
                    />
                  </FlexColumn>
                </UI.AccordionContent>
              </Accordion.Item>

              {/** Send Amount Section */}
              <Accordion.Item
                disabled={!receiver}
                className="AccordionItem"
                value="section-send-amount"
              >
                <UI.AccordionTrigger
                  className={!receiver ? 'disable' : undefined}
                  narrow={true}
                >
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
                          !sender || fetchingSpendable || !getOnlineMode()
                        }
                        value={sendAmount}
                        onChange={(e) => handleSendAmountChange(e)}
                        onFocus={() => handleSendAmountFocus()}
                        onBlur={() => handleSendAmountBlur()}
                      />
                      <span>
                        {sender ? chainCurrency(sender.chainId) : '-'}
                      </span>
                    </InputWrapper>
                    <InfoPanel label={'Spendable Balance:'}>
                      {spendable && sender
                        ? getBalanceText(spendable, sender.chainId)
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
              <Accordion.Item
                disabled={
                  !validAmount || sendAmount === '' || sendAmount === '0'
                }
                className="AccordionItem"
                value="section-summary"
              >
                <UI.AccordionTrigger
                  className={
                    !validAmount || sendAmount === '' || sendAmount === '0'
                      ? 'disable'
                      : undefined
                  }
                  narrow={true}
                >
                  <TriggerContent label="Summary" complete={summaryComplete} />
                </UI.AccordionTrigger>
                <UI.AccordionContent narrow={true}>
                  <FlexColumn $rowGap={'0.25rem'}>
                    <InfoPanel label={'Network:'}>
                      {sender?.chainId || '-'}
                    </InfoPanel>

                    {/** Sender */}
                    <InfoPanel label={'Sender:'}>
                      {!sender ? (
                        '-'
                      ) : (
                        <AccountNameWithTooltip
                          accountName={sender.alias}
                          address={sender.address}
                          copyToClipboard={copyToClipboard}
                          theme={theme}
                        />
                      )}
                    </InfoPanel>

                    {/** Receiver */}
                    <InfoPanel label={'Recipient:'}>
                      {!receiver ? (
                        '-'
                      ) : (
                        <AccountNameWithTooltip
                          accountName={
                            receiver.accountName ||
                            ellipsisFn(receiver.address, 5)
                          }
                          address={receiver.address}
                          copyToClipboard={copyToClipboard}
                          theme={theme}
                        />
                      )}
                    </InfoPanel>

                    {/** Send Amount */}
                    <div style={{ marginBottom: '0.25rem' }}>
                      <InfoPanel label={'Send Amount:'}>
                        {sendAmount === '0' ||
                        sendAmount === '' ||
                        !sender ||
                        !validAmount
                          ? '-'
                          : `${formatDecimal(sendAmount)} ${chainCurrency(sender.chainId)}`}
                      </InfoPanel>
                    </div>

                    <FlexRow $gap={'0.5rem'}>
                      <ActionButton
                        style={{ flex: 1 }}
                        $backgroundColor={'var(--button-background-secondary)'}
                        onClick={() => {
                          handleResetClick();
                          setAccordionValue('section-network');
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
