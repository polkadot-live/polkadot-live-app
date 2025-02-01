// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

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
import styled from 'styled-components';

/** Action item component */
interface ActionItemSendProps {
  text: string;
}

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
interface SelectBoxProps {
  children: React.ReactNode;
  ariaLabel: string;
  placeholder: string;
  value: string;
  onValueChange: (val: string) => void;
}

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

      {/** Sender Section */}
      <ActionItemSend text={'Sender'} />
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
              style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}
            >
              <span>{ellipsisFn(sender, 12)}</span>
              <FontAwesomeIcon icon={faCopy} transform={'shrink-2'} />
            </div>
          }
        />
      </FlexColumn>

      {/** Receiver Section */}
      <ActionItemSend text={'Receiver'} />
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

      {/** Send Amount Section */}
      <ActionItemSend text={'Send Amount'} />
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

      <ActionItemSend text={'Summary'} />
      <FlexColumn>
        <InfoPanel label={'Network:'} Content={'Polkadot'} />
        <InfoPanel label={'Estimated Fee:'} Content={'0.1 DOT'} />
        <AddButton onClick={() => console.log('Add')} disabled={false}>
          <FontAwesomeIcon icon={faChevronRight} transform={'shrink-4'} />
          <span>Proceed</span>
        </AddButton>
      </FlexColumn>
    </div>
  );
};

const AddButton = styled.button`
  background-color: var(--button-background-primary);
  margin-top: 0.4rem;

  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  color: var(--text-bright);
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-out;
  user-select: none;

  &:hover:not(:disabled) {
    filter: brightness(1.2);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background-color: var(--background-primary);
  border-radius: 0.375rem;

  input {
    padding: 0;
    color: var(--text-color-primary);
    font-size: 1.2rem;
    font-weight: 500;
    width: 100%;
    text-align: left;
  }
  span {
    color: var(--text-color-primary);
    font-size: 1.25rem;
    margin-left: 5px;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }
`;

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
      color: 'var(--text-color-secondary)',
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
      <span style={{ flex: 1 }}>{label}</span>
      <span>{Content}</span>
    </div>
  </div>
);
