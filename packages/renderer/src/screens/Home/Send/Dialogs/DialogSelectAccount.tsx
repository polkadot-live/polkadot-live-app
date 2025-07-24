// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as Styles from '@polkadot-live/ui/styles';
import * as Icons from '@radix-ui/react-icons';

import { useConnections } from '@ren/contexts/common';
import { useEffect, useState } from 'react';
import { checkAddress } from '@polkadot/util-crypto';
import { Identicon } from '@polkadot-live/ui/components';
import { ellipsisFn } from '@w3ux/utils';
import {
  AddressesWrapper,
  AddressItem,
  ConfirmBtn,
  InputIdenticonWrapper,
  InputWrapper,
  SelectedAddressItem,
  TriggerButton,
} from './Wrappers';

import type { DialogSelectAccountProps } from './types';
import type { ChangeEvent } from 'react';
import type { ChainID } from '@polkadot-live/types/chains';
import type { SendRecipient } from '../types';
import type { SendAccount } from '@polkadot-live/types/accounts';

interface DynamicTriggerProps {
  accountRole: 'recipient' | 'sender';
  recipient: SendRecipient | null;
  sender: SendAccount | null;
}

const DynamicTrigger = ({
  accountRole,
  recipient,
  sender,
}: DynamicTriggerProps) => {
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  let sendAccount: SendAccount | SendRecipient | null;
  let accountNotSet: boolean;
  let notSetMessage: string;
  let label = '';

  switch (accountRole) {
    case 'recipient': {
      sendAccount = recipient;
      accountNotSet = recipient === null || recipient?.address === '';
      notSetMessage = 'Select Recipient';

      if (recipient) {
        const { accountName, address } = recipient;
        label = accountName !== null ? accountName : ellipsisFn(address, 5);
      }
      break;
    }
    case 'sender': {
      sendAccount = sender;
      accountNotSet = sender === null;
      notSetMessage = 'Select Sender';

      if (sender) {
        label = sender.alias;
      }
      break;
    }
  }

  return accountNotSet ? (
    <span style={{ textAlign: 'left', flex: 1 }}>{notSetMessage}</span>
  ) : (
    <SelectedAddressItem
      className={!getOnlineMode() ? 'disable' : ''}
      $theme={theme}
    >
      <Styles.FlexRow $gap={'1.25rem'} style={{ width: '100%' }}>
        <div className="identicon" style={{ minWidth: 'fit-content' }}>
          <Identicon value={sendAccount!.address} fontSize="1.9rem" />
        </div>
        <Styles.FlexColumn $rowGap={'0.5rem'} style={{ flex: 1, minWidth: 0 }}>
          <h3>{label}</h3>
        </Styles.FlexColumn>
      </Styles.FlexRow>
    </SelectedAddressItem>
  );
};

export const DialogSelectAccount = ({
  accounts,
  accountRole,
  recipient,
  sender,
  setReceiver,
  setSender,
  handleSenderChange,
  setRecipientFilter,
}: DialogSelectAccountProps) => {
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isInputValid, setIsInputValid] = useState(false);
  const [inputVal, setInputVal] = useState<SendRecipient | SendAccount>({
    address: '',
    accountName: null,
    managed: false,
    chainId: sender?.chainId || 'Westend Asset Hub',
  });

  const ChainPrefix = new Map<ChainID, number>([
    ['Kusama Relay', 2],
    ['Westend Asset Hub', 42],
  ]);

  /**
   * Util to validate an address.
   */
  const validateAddressInput = () => {
    let targetChain: ChainID | null = null;
    if (accountRole === 'recipient') {
      targetChain = sender?.chainId || null;
    } else {
      targetChain = (inputVal as SendAccount).chainId;
    }

    const targetPrefixes: number[] = targetChain
      ? [ChainPrefix.get(targetChain!)!]
      : [...ChainPrefix.values()];

    for (const prefix of targetPrefixes) {
      const result = checkAddress(inputVal.address, prefix);

      if (result !== null) {
        const [isValid] = result;

        if (isValid) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Handle input change (only for recipients list).
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value.trim();
    const managed = accounts.find(({ address }) => address === val)
      ? true
      : false;

    setRecipientFilter(val);
    setInputVal({
      accountName: ellipsisFn(val, 5),
      address: val,
      chainId: sender?.chainId || 'Westend Asset Hub',
      managed,
    } as SendRecipient);

    setIsInputValid(validateAddressInput());
  };

  /**
   * Handle clicking a listed address.
   */
  const handleAddressClick = (account: SendAccount) => {
    const { address, alias, chainId: cid } = account;
    setIsInputValid(validateAddressInput());

    // TODO: Enable setInputValue(null)
    if (inputVal.address === address) {
      // Un-select.
      setInputVal({
        address: '',
        accountName: null,
        managed: false,
        chainId: cid,
      });

      accountRole === 'recipient' && setReceiver(null);
      accountRole === 'sender' && setSender(null);
    } else {
      // Set selected.
      if (accountRole === 'recipient') {
        setInputVal({
          address,
          accountName: alias,
          managed: true,
          chainId: cid,
        } as SendRecipient);
      } else {
        setInputVal({ ...account } as SendAccount);
      }
    }
  };

  /**
   * Handle clicking the confirm button.
   */
  const handleConfirmClick = () => {
    accountRole === 'recipient' &&
      setReceiver({ ...inputVal } as SendRecipient);
    accountRole === 'sender' &&
      handleSenderChange({ ...inputVal } as SendAccount);
    setIsOpen(false);
  };

  /**
   * Returns whether confirm button is enabled.
   */
  const isConfirmEnabled = (): boolean => {
    if (accountRole === 'recipient') {
      return validateAddressInput();
    } else {
      if (inputVal.address !== '') {
        return validateAddressInput();
      } else {
        return false;
      }
    }
  };

  /**
   * Set input value to selected account when dialog is re-opened.
   */
  useEffect(() => {
    if (isOpen) {
      switch (accountRole) {
        case 'recipient': {
          if (recipient !== null) {
            setInputVal({ ...recipient });
          }
          break;
        }
        case 'sender': {
          if (sender !== null) {
            setInputVal({ ...sender });
          }
          break;
        }
      }
    }
  }, [isOpen]);

  /**
   * Reset recipient input value when sender changes.
   */
  useEffect(() => {
    if (accountRole === 'recipient') {
      setInputVal({
        address: '',
        accountName: null,
        managed: false,
        chainId: sender?.chainId || 'Westend Asset Hub',
      });
    }
  }, [sender]);

  /**
   * Validate input whenever it changes.
   */
  useEffect(() => {
    setIsInputValid(validateAddressInput());
  }, [inputVal]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(val) => getOnlineMode() && setIsOpen(val)}
    >
      {/** Trigger */}
      <Styles.DialogTrigger $theme={theme}>
        <TriggerButton
          $theme={theme}
          className={!getOnlineMode() ? 'disable' : ''}
        >
          {/** Render Recipient or Sender Trigger */}
          <DynamicTrigger
            accountRole={accountRole}
            recipient={recipient}
            sender={sender}
          />

          <Icons.ChevronDownIcon />
        </TriggerButton>
      </Styles.DialogTrigger>

      {/** Dialog Content */}
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <Styles.DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Icons.Cross2Icon />
          </Dialog.Close>

          <Styles.FlexColumn $rowGap={'1.5rem'}>
            <Styles.FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                {accountRole.charAt(0).toUpperCase() + accountRole.slice(1)}
              </Dialog.Title>

              <Styles.FlexColumn $rowGap={'0.75rem'}>
                <Dialog.Description>
                  <span style={{ color: theme.textColorSecondary }}>
                    {accountRole === 'recipient' &&
                      'Enter an address or select one from the list.'}
                    {accountRole === 'sender' &&
                      'Select an address from the list.'}
                  </span>
                </Dialog.Description>

                {/** Input */}
                <Styles.FlexRow $gap={'0.5rem'}>
                  <Styles.FlexRow $gap={'0'} style={{ flex: 1 }}>
                    <InputIdenticonWrapper
                      style={{ backgroundColor: theme.backgroundPrimary }}
                    >
                      <Identicon value={inputVal.address} fontSize="1.5rem" />
                    </InputIdenticonWrapper>
                    <InputWrapper
                      className="AddressInput"
                      $theme={theme}
                      style={{ flex: 1 }}
                      disabled={accountRole === 'sender'}
                      placeholder={
                        accountRole === 'recipient'
                          ? 'Input Address'
                          : 'Select Sender'
                      }
                      onChange={(e) => handleChange(e)}
                      value={inputVal.address}
                    />
                  </Styles.FlexRow>

                  <ConfirmBtn
                    className={`${isConfirmEnabled() ? 'valid' : ''}`}
                    disabled={!isConfirmEnabled()}
                    $theme={theme}
                    onClick={() => isInputValid && handleConfirmClick()}
                  >
                    <Icons.CheckIcon />
                  </ConfirmBtn>
                </Styles.FlexRow>

                <AddressesWrapper $theme={theme}>
                  <div className="Container">
                    {accounts.length > 0 ? (
                      accounts.map((a) => {
                        const selected =
                          inputVal?.address === a.address &&
                          inputVal?.chainId === a.chainId;

                        return (
                          <AddressItem
                            role="button"
                            selected={selected}
                            onClick={() => handleAddressClick(a)}
                            $theme={theme}
                            key={`${accountRole}-${a.address}`}
                          >
                            <Styles.FlexRow
                              $gap={'1.25rem'}
                              style={{ width: '100%' }}
                            >
                              <div style={{ minWidth: 'fit-content' }}>
                                <Identicon
                                  value={a.address}
                                  fontSize="1.9rem"
                                />
                              </div>
                              <Styles.FlexColumn
                                $rowGap={'0.5rem'}
                                style={{ flex: 1, minWidth: 0 }}
                              >
                                <h3 className="text-ellipsis">{a.alias}</h3>
                                <h4 className="text-ellipsis">
                                  {ellipsisFn(a.address, 12)}
                                </h4>
                              </Styles.FlexColumn>
                              {selected && (
                                <span className="ClearBtn">
                                  <Icons.Cross1Icon />
                                </span>
                              )}
                            </Styles.FlexRow>
                          </AddressItem>
                        );
                      })
                    ) : (
                      <Styles.FlexRow>
                        <span
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            color: theme.textColorSecondary,
                          }}
                        >
                          No addresses match input.
                        </span>
                      </Styles.FlexRow>
                    )}
                  </div>
                </AddressesWrapper>
              </Styles.FlexColumn>
            </Styles.FlexColumn>
            <Dialog.Close className="Dialog__Button">Close</Dialog.Close>
          </Styles.FlexColumn>
        </Styles.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
