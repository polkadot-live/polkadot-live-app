// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../../theme/variables';
import {
  ActionItem,
  Identicon,
  MainHeading,
} from '@polkadot-live/ui/components';
import { useConnections } from '@app/contexts/common/Connections';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { getSelectNetworkData } from '@ren/config/chains';
import { useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCopy } from '@fortawesome/free-solid-svg-icons';
import { AddButton, InputWrapper } from './Wrappers';
import type { ActionItemSendProps, SelectBoxProps } from './types';

/** Action item component */
const ActionItemSend = ({ text }: ActionItemSendProps) => (
  <ActionItem
    text={text}
    style={{
      fontSize: '1.1rem',
      color: 'var(--text-color-secondary)',
    }}
  />
);

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
  const { darkMode } = useConnections();
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Polkadot');
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');

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

      {/** Network Section */}
      <div style={{ display: 'none' }}>
        <ActionItemSend text={'Network'} />
        <SelectBox
          value={selectedNetwork}
          ariaLabel="Network"
          placeholder="Select Network"
          onValueChange={(val) => setSelectedNetwork(val)}
        >
          {getSelectNetworkData(darkMode).map(
            ({ network, ledgerId, ChainIcon, iconWidth, iconFill }) => (
              <UI.SelectItem key={ledgerId} value={network}>
                <div className="innerRow">
                  <div>
                    <ChainIcon
                      width={iconWidth}
                      fill={iconFill}
                      style={{
                        marginLeft: network === 'Polkadot' ? '2px' : '0',
                      }}
                    />
                  </div>
                  <div>{network}</div>
                </div>
              </UI.SelectItem>
            )
          )}
        </SelectBox>
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
              <ChevronDownIcon className="AccordionChevron" aria-hidden />
              <h4>Sender</h4>
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
                      <span>{ellipsisFn(sender, 12)}</span>
                      <FontAwesomeIcon icon={faCopy} transform={'shrink-2'} />
                    </div>
                  }
                />
              </FlexColumn>
            </UI.AccordionContent>
          </Accordion.Item>

          {/** Receiver Section */}
          <Accordion.Item className="AccordionItem" value="section-receiver">
            <UI.AccordionTrigger narrow={true}>
              <ChevronDownIcon className="AccordionChevron" aria-hidden />
              <h4>Receiver</h4>
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
                      <span>{ellipsisFn(receiver, 12)}</span>
                      <FontAwesomeIcon icon={faCopy} transform={'shrink-2'} />
                    </div>
                  }
                />
              </FlexColumn>
            </UI.AccordionContent>
          </Accordion.Item>

          {/** Send Amount Section */}
          <Accordion.Item className="AccordionItem" value="section-send-amount">
            <UI.AccordionTrigger narrow={true}>
              <ChevronDownIcon className="AccordionChevron" aria-hidden />
              <h4>Send Amount</h4>
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
              </FlexColumn>
            </UI.AccordionContent>
          </Accordion.Item>

          {/** Summary Section */}
          <Accordion.Item className="AccordionItem" value="section-summary">
            <UI.AccordionTrigger narrow={true}>
              <ChevronDownIcon className="AccordionChevron" aria-hidden />
              <h4>Summary</h4>
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
