// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../../theme/variables';
import { Identicon, MainHeading } from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faChevronRight,
  faCircleCheck,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { AddButton, InputWrapper, ProgressBarWrapper } from './Wrappers';
import styled from 'styled-components';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import type { SelectBoxProps } from './types';

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
    new Map<AccountSource, LocalAddress[] | LedgerLocalAddress[]>()
  );

  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [progress, setProgress] = useState(20);

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
            setAddressMap((pv) => {
              pv.set(source, parsed);
              return pv;
            });
            break;
          }
          case 'ledger': {
            const parsed: LedgerLocalAddress[] = JSON.parse(ser);
            setAddressMap((pv) => {
              pv.set(source, parsed);
              return pv;
            });
            break;
          }
          default: {
            continue;
          }
        }
      }

      console.log(addressMap);
    };

    fetch();
  }, []);

  const mockAddresses = [
    {
      accountName: 'Mock Account 1',
      address: 'MockAddress1',
    },
    {
      accountName: 'Mock Account 2',
      address: 'MockAddress2',
    },
    {
      accountName: 'Mock Account 3',
      address: 'MockAddress3',
    },
    {
      accountName: 'Mock Account 4',
      address: 'MockAddress4',
    },
    {
      accountName: 'Mock Account 5',
      address: 'MockAddress5',
    },
  ];

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
          defaultValue={['section-sender']}
        >
          {/** Sender Section */}
          <Accordion.Item className="AccordionItem" value="section-sender">
            <UI.AccordionTrigger narrow={true}>
              <TriggerContent label="Sender" complete={true} />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <SelectBox
                  value={sender}
                  ariaLabel="Sender"
                  placeholder="Select Sender"
                  onValueChange={(val) => setSender(val)}
                >
                  {mockAddresses.map(({ accountName, address }) => (
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
                      {sender === '' ? (
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
                <NextStepArrow complete={true} />
              </FlexColumn>
            </UI.AccordionContent>
          </Accordion.Item>

          {/** Receiver Section */}
          <Accordion.Item className="AccordionItem" value="section-receiver">
            <UI.AccordionTrigger narrow={true}>
              <TriggerContent label="Receiver" complete={false} />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <SelectBox
                  value={receiver}
                  ariaLabel="Receiver"
                  placeholder="Select Receiver"
                  onValueChange={(val) => setReceiver(val)}
                >
                  {mockAddresses.map(({ accountName, address }) => (
                    <UI.SelectItem key={`receiver-${address}`} value={address}>
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
                  label={'Receiving Address:'}
                  Content={
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.8rem',
                        alignItems: 'center',
                      }}
                    >
                      {receiver === '' ? (
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
                <NextStepArrow complete={false} />
              </FlexColumn>
            </UI.AccordionContent>
          </Accordion.Item>

          {/** Send Amount Section */}
          <Accordion.Item className="AccordionItem" value="section-send-amount">
            <UI.AccordionTrigger narrow={true}>
              <TriggerContent label="Send Amount" complete={false} />
            </UI.AccordionTrigger>
            <UI.AccordionContent narrow={true}>
              <FlexColumn>
                <InputWrapper>
                  <input
                    type="number"
                    disabled={false}
                    defaultValue={0}
                    onChange={(e) => console.log(e)}
                  />
                  <span>DOT</span>
                </InputWrapper>
                <InfoPanel label={'Spendable Balance:'} Content={'100 DOT'} />
                <NextStepArrow complete={false} />
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
                <InfoPanel label={'Network:'} Content={'Polkadot'} />
                <InfoPanel label={'Sender:'} Content={'Mock Account 1'} />
                <InfoPanel label={'Receiver:'} Content={'Mock Account 2'} />
                <InfoPanel label={'Send Amount:'} Content={'10 DOT'} />
                <InfoPanel label={'Estimated Fee:'} Content={'0.1 DOT'} />
                <AddButton onClick={() => console.log('Add')} disabled={false}>
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

const NextStepArrowWrapper = styled.div<{ $complete: boolean }>`
  > button {
    text-align: center;
    width: 100%;
    font-size: 2rem;
    color: ${(props) =>
      props.$complete
        ? 'var(--accent-success)'
        : 'var(--text-color-secondary)'};
    opacity: ${(props) => (props.$complete ? '1' : '0.15')};
    transition: all 0.2s ease-out;
    cursor: ${(props) => (props.$complete ? 'pointer' : 'not-allowed')};

    &:hover {
      filter: ${(props) =>
        props.$complete ? 'brightness(140%)' : 'brightness(100%)'};
    }
  }
`;

const NextStepArrow = ({ complete }: { complete: boolean }) => (
  <NextStepArrowWrapper $complete={complete}>
    <button>
      <FontAwesomeIcon icon={faCaretDown} />
    </button>
  </NextStepArrowWrapper>
);
