// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../../theme/variables';

import { chainCurrency } from '@ren/config/chains';
import { Identicon, MainHeading } from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useEffect, useRef, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { getAddressChainId } from '@app/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faChevronRight,
  faCircleCheck,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import {
  AddButton,
  InputWrapper,
  NextStepArrowWrapper,
  ProgressBarWrapper,
} from './Wrappers';

import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ChangeEvent } from 'react';
import type { SelectBoxProps, SendAccordionValue } from './types';

/** Progress bar component */
const ProgressBar = ({ value, max }: { value: number; max: number }) => {
  const percentage = (value / max) * 100;

  return (
    <ProgressBarWrapper>
      <div className="progress-fill" style={{ width: `${percentage}%` }} />
    </ProgressBarWrapper>
  );
};

/** Select box wrapper */
const SelectBox = ({
  children,
  ariaLabel,
  placeholder,
  value,
  onValueChange,
}: SelectBoxProps) => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <UI.SelectTrigger $theme={theme} aria-label={ariaLabel}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="SelectIcon">
          <ChevronDownIcon />
        </Select.Icon>
      </UI.SelectTrigger>
      <Select.Portal>
        <UI.SelectContent $theme={theme} position="popper" sideOffset={3}>
          <Select.ScrollUpButton className="SelectScrollButton">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="SelectViewport">
            <Select.Group>{children}</Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="SelectScrollButton">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </UI.SelectContent>
      </Select.Portal>
    </Select.Root>
  );
};

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
    }
  }, [updateCache]);

  /**
   * Progress bar controller.
   */
  useEffect(() => {
    let conditions = 0;

    sender && (conditions += 1);
    receiver && (conditions += 1);
    sendAmount !== '0' && sendAmount !== '' && (conditions += 1);

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
  const handleSenderChange = (senderAddress: string) => {
    setSender(senderAddress);
    setSenderNetwork(getAddressChainId(senderAddress));

    // Reset other send fields.
    setReceiver(null);
    setSendAmount('0');
  };

  /**
   * Send amount changed callback.
   */
  const handleSendAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val === '' || !isNaN(Number(val))) {
      setSendAmount(val === '' ? '' : val);
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
    sendAmount === '';

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
        {/** TODO: defaultValue, onValueChange */}
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
                  value={sender || ''}
                  ariaLabel="Sender"
                  placeholder="Select Sender"
                  onValueChange={(val) => handleSenderChange(val)}
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
                <InfoPanel
                  label={'Sending Address:'}
                  Content={
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.8rem',
                        alignItems: 'center',
                      }}
                    >
                      {!sender ? (
                        <span>-</span>
                      ) : (
                        <>
                          <span>{ellipsisFn(sender, 12)}</span>
                          <FontAwesomeIcon
                            icon={faCopy}
                            transform={'shrink-2'}
                          />
                        </>
                      )}
                      <span></span>
                    </div>
                  }
                />
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
                <InfoPanel
                  label={'Receiving Address:'}
                  Content={
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.8rem',
                        alignItems: 'center',
                      }}
                    >
                      {!receiver ? (
                        <span>-</span>
                      ) : (
                        <>
                          <span>{ellipsisFn(receiver, 12)}</span>
                          <FontAwesomeIcon
                            icon={faCopy}
                            transform={'shrink-2'}
                          />
                        </>
                      )}
                    </div>
                  }
                />
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
                complete={sendAmount !== '0' && sendAmount !== ''}
              />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <InputWrapper>
                  <input
                    type="number"
                    disabled={!sender}
                    value={sendAmount}
                    defaultValue={'0'}
                    onChange={(e) => handleSendAmountChange(e)}
                    onFocus={() => handleSendAmountFocus()}
                    onBlur={() => handleSendAmountBlur()}
                  />
                  <span>DOT</span>
                </InputWrapper>
                <InfoPanel label={'Spendable Balance:'} Content={'100 DOT'} />
                <NextStepArrow
                  complete={!(sendAmount === '0' || sendAmount === '')}
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
                <InfoPanel label={'Network:'} Content={senderNetwork || '-'} />
                <InfoPanel
                  label={'Sender:'}
                  Content={!sender ? '-' : ellipsisFn(sender!, 12)}
                />
                <InfoPanel
                  label={'Receiver:'}
                  Content={!receiver ? '-' : ellipsisFn(receiver, 12)}
                />
                <InfoPanel
                  label={'Send Amount:'}
                  Content={
                    sendAmount === '0'
                      ? '-'
                      : `${sendAmount} ${chainCurrency(senderNetwork!)}`
                  }
                />
                <InfoPanel
                  label={'Estimated Fee:'}
                  Content={
                    estimatedFee === ''
                      ? '-'
                      : `${estimatedFee} ${chainCurrency(senderNetwork!)}`
                  }
                />
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

const FlexColumn = ({ children }: { children: React.ReactNode }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    {children}
  </section>
);

const InfoPanel = ({
  label,
  Content,
}: {
  label: string;
  Content: React.ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      fontSize: '1rem',
      padding: '1rem',
      backgroundColor: 'var(--background-surface)',
      border: '0.375rem',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        opacity: '0.85',
      }}
    >
      <span style={{ flex: 1, color: 'var(--text-color-secondary)' }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-color-primary)' }}>{Content}</span>
    </div>
  </div>
);

const TriggerContent = ({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) => (
  <>
    <ChevronDownIcon className="AccordionChevron" aria-hidden />
    <h4 style={{ flex: 1 }}>{label}</h4>
    <div className="right">
      <FontAwesomeIcon
        style={
          complete
            ? { color: 'var(--accent-success)' }
            : { color: 'inherit', opacity: '0.25' }
        }
        icon={faCircleCheck}
        transform={'grow-4'}
      />
    </div>
  </>
);

const NextStepArrow = ({
  complete,
  onClick,
}: {
  complete: boolean;
  onClick: () => void;
}) => (
  <NextStepArrowWrapper $complete={complete}>
    <button disabled={!complete} onClick={() => onClick()}>
      <FontAwesomeIcon icon={faCaretDown} transform={'shrink-6'} />
    </button>
  </NextStepArrowWrapper>
);
