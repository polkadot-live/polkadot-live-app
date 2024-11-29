// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { forwardRef } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import { Scrollable } from '@polkadot-live/ui/styles';
import {
  ActionItem,
  ControlsWrapper,
  Identicon,
  SortControlLabel,
} from '@polkadot-live/ui/components';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { ContentWrapper } from '../../../Wrappers';
import {
  faCaretLeft,
  faCheckCircle,
  faCircleInfo,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@ren/renderer/contexts/common/Connections';
import { determineStatusFromCodes } from '../Utils';
import { ItemsColumn } from '@ren/renderer/screens/Home/Manage/Wrappers';
import type { AnyData } from 'packages/types/src';

/** Theme Imports */
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import * as themeVariables from '../../../../theme/variables';
import {
  CheckboxRoot,
  ConnectButton,
  InfoCard,
  LedgerAddressRow,
  SelectTrigger,
  SelectContent,
} from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ellipsisFn } from '@w3ux/utils';

export const Import = ({
  setSection,
  statusCodes,
  handleGetLedgerAddress,
}: AnyData) => {
  const networkData = [
    { network: 'Polkadot', ledgerId: 'dot' },
    { network: 'Kusama', ledgerId: 'kusama' },
  ];

  /// Handle select network change.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNetwork = event.target.value;

    console.log(`Selected: ${selectedNetwork}`);
  };

  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const mockAddresses = [
    '5CDKFFKebuBT7T7Sni7eWMrRsrXGVtauYH81VKBYk2dgjKS1',
    '5DaL7GbMtvA7EPSPd22TLB8vKMt6CLpsaDG5a3nKgW41wNaN',
    '5DCctuZNnfqH8j9wL34vmL9ywrqRJz4vXPoyG8HYA5QAdR9H',
    '5HnC3oCrcTwVZ6RxGVrnNHgtH2EgQTeVAHs4VfvDwRaRZQHx',
    '5EvLYdMDKFUSysxUHXEuDx4geWKFCTrtGLHUwmcBPapbMsvB',
  ];

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
      {/** Breadcrump */}
      <ControlsWrapper $padWrapper={true} $padButton={false}>
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => setSection(0)}
        />
        <SortControlLabel label="Import Ledger Address" />
      </ControlsWrapper>

      <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
        {/** Choose Network */}
        <ActionItem text={'Connect Ledger'} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Select.Root>
            <SelectTrigger $theme={theme} aria-label="Network">
              <Select.Value placeholder="Select Network" />
              <Select.Icon>
                <ChevronDownIcon />
              </Select.Icon>
            </SelectTrigger>
            <Select.Portal>
              <SelectContent $theme={theme} position="popper" sideOffset={3}>
                <Select.ScrollUpButton className="SelectScrollButton">
                  <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="SelectViewport">
                  <Select.Group>
                    {networkData.map(({ network, ledgerId }) => (
                      <SelectItem key={ledgerId} value={ledgerId}>
                        {network}
                      </SelectItem>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton className="SelectScrollButton">
                  <ChevronDownIcon />
                </Select.ScrollDownButton>
              </SelectContent>
            </Select.Portal>
          </Select.Root>

          <ConnectButton onClick={() => handleGetLedgerAddress()}>
            Connect
          </ConnectButton>
        </div>

        {/** Status Message */}
        {statusCodes.length > 0 && (
          <InfoCard>
            <span className="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {determineStatusFromCodes(statusCodes, false).title}
            </span>
          </InfoCard>
        )}

        <InfoCard>
          <span>
            <FontAwesomeIcon icon={faCheckCircle} />
            Connect a Ledger device to this computer with a USB cable.
          </span>
          <span>
            <FontAwesomeIcon icon={faCheckCircle} />
            Unlock the Ledger device and open the Polkadot app.
          </span>
          <span>
            <FontAwesomeIcon icon={faCheckCircle} />
            Select a network and click on the <b>Connect</b> button above.
          </span>
        </InfoCard>

        <ActionItem
          text={'Select Addresses to Import'}
          style={{ marginTop: '2.5rem' }}
        />

        <InfoCard style={{ marginBottom: '0.75rem' }}>
          <span>
            <FontAwesomeIcon icon={faCircleInfo} />
            Connect a Ledger device to list its derived addresses.
          </span>
        </InfoCard>

        <ItemsColumn>
          {mockAddresses.map((address, i) => (
            <LedgerAddressRow key={address}>
              <Identicon value={address} size={32} />
              <div className="addressInfo">
                <h2>Ledger Account {i + 1}</h2>
                <span>{ellipsisFn(address, 12)}</span>
              </div>
              <CheckboxRoot $theme={theme} className="CheckboxRoot" id="c1">
                <Checkbox.Indicator className="CheckboxIndicator">
                  <CheckIcon />
                </Checkbox.Indicator>
              </CheckboxRoot>
            </LedgerAddressRow>
          ))}
        </ItemsColumn>
      </ContentWrapper>
    </Scrollable>
  );
};

const SelectItem = forwardRef(function SelectItem(
  { children, className, ...props }: AnyData,
  forwardedRef
) {
  return (
    <Select.Item
      className={`SelectItem ${className}`}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});
