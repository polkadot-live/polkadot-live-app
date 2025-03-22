// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as Styles from '@polkadot-live/ui/styles';
import * as themeVariables from '../../../../theme/variables';
import * as Icons from '@radix-ui/react-icons';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect, useRef, useState } from 'react';
import type { SendRecipient } from '..';

// TODO: Move to ui library
import {
  DialogContent,
  DialogTrigger,
} from '@app/screens/OpenGov/Referenda/Dialogs/Wrappers';
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
import { checkAddress } from '@polkadot/util-crypto';
import type { DialogRecipientProps } from './types';
import type { ChangeEvent } from 'react';
import type { ChainID } from '@polkadot-live/types/chains';

export const DialogRecipient = ({
  addresses,
  chainId,
  recipient,
  sender,
  setReceiver,
}: DialogRecipientProps) => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const [isOpen, setIsOpen] = useState(false);
  const [isInputValid, setIsInputValid] = useState(false);
  const [inputVal, setInputVal] = useState<SendRecipient>({
    address: '',
    accountName: null,
    managed: false,
  });

  const [filteredAddresses, setFilteredAddresses] = useState(addresses);
  const allAddresses = useRef(addresses);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    setTrigger(true);
  }, []);

  useEffect(() => {
    if (trigger) {
      if (recipient !== null) {
        setInputVal({ ...recipient });
        setFilteredAddresses((pv) =>
          pv.filter(({ address }) => address.startsWith(recipient.address))
        );
      }
      setTrigger(false);
    }
  }, [trigger]);

  const ChainPrefix = new Map<ChainID, number>([
    ['Polkadot', 0],
    ['Kusama', 2],
    ['Westend', 42],
  ]);

  /**
   * Util to validate an address.
   */
  const validateAddressInput = () => {
    const targetPrefixes: number[] =
      chainId === null
        ? [...ChainPrefix.values()]
        : [ChainPrefix.get(chainId)!];

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
   * Handle input change.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Trim any whitespace.
    const val = event.target.value.trim();

    const managed = allAddresses.current.find(
      ({ address }) => address.toLowerCase() === val.toLowerCase()
    )
      ? true
      : false;

    setInputVal((pv) => ({ ...pv, address: val, managed }));
    setIsInputValid(validateAddressInput());

    val === ''
      ? setFilteredAddresses(allAddresses.current)
      : setFilteredAddresses(
          allAddresses.current.filter(({ address }) =>
            address.toLowerCase().startsWith(val.toLowerCase())
          )
        );
  };

  /**
   * Handle clicking a listed address.
   */
  const handleAddressClick = (clickedAddress: string, accountName: string) => {
    setIsInputValid(validateAddressInput());

    if (inputVal.address === clickedAddress) {
      setInputVal({ address: '', accountName: null, managed: false });
      setFilteredAddresses(allAddresses.current);
      setReceiver(null);
      return;
    }

    setInputVal({ address: clickedAddress, accountName, managed: true });
    setFilteredAddresses((pv) =>
      pv.filter(({ address }) => address.startsWith(clickedAddress))
    );
  };

  /**
   * Handle clicking the confirm button.
   */
  const handleConfirmClick = () => {
    setReceiver({ ...inputVal });
    setIsOpen(false);
  };

  /**
   * Validate input whenever it changes.
   */
  useEffect(() => {
    setIsInputValid(validateAddressInput());
  }, [inputVal]);

  /**
   * Update address list when sender changes.
   */
  useEffect(() => {
    allAddresses.current = addresses;
    setFilteredAddresses(addresses);
    setInputVal({ address: '', accountName: '', managed: false });
    setIsInputValid(false);
  }, [sender]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger $theme={theme}>
        <TriggerButton $theme={theme}>
          {recipient === null || recipient.address === '' ? (
            <span style={{ textAlign: 'left', flex: 1 }}>Select Recipient</span>
          ) : (
            <SelectedAddressItem $theme={theme}>
              <Styles.FlexRow $gap={'1.25rem'} style={{ width: '100%' }}>
                <div style={{ minWidth: 'fit-content' }}>
                  <Identicon value={recipient.address} fontSize="1.9rem" />
                </div>
                <Styles.FlexColumn
                  $rowGap={'0.5rem'}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <h3>
                    {recipient.accountName !== null
                      ? recipient.accountName
                      : ellipsisFn(recipient.address, 8)}
                  </h3>
                </Styles.FlexColumn>
              </Styles.FlexRow>
            </SelectedAddressItem>
          )}
          <Icons.ChevronDownIcon />
        </TriggerButton>
      </DialogTrigger>
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Icons.Cross2Icon />
          </Dialog.Close>

          <Styles.FlexColumn $rowGap={'1.5rem'}>
            <Styles.FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">Recipient</Dialog.Title>

              <Dialog.Description className="Dialog__Description">
                <Styles.FlexColumn
                  $rowGap={'0.75rem'}
                  style={{ marginTop: '1rem' }}
                >
                  <div>
                    <span style={{ margin: '0.5rem 0' }}>
                      Enter an address or select one from the list.
                    </span>
                  </div>
                  {/** Input */}
                  <Styles.FlexRow $gap={'0.5rem'}>
                    <Styles.FlexRow $gap={'0'} style={{ flex: 1 }}>
                      <InputIdenticonWrapper
                        style={{ backgroundColor: theme.backgroundPrimary }}
                      >
                        <Identicon value={inputVal.address} fontSize="1.5rem" />
                      </InputIdenticonWrapper>
                      <InputWrapper $theme={theme} style={{ flex: 1 }}>
                        <input
                          disabled={false}
                          placeholder="Input Address"
                          onChange={(e) => handleChange(e)}
                          value={inputVal.address}
                          //onFocus={() => handleFocus()}
                          //onBlur={() => handleBlur()}
                        />
                      </InputWrapper>
                    </Styles.FlexRow>

                    <ConfirmBtn
                      role="button"
                      className={`${validateAddressInput() && 'valid'} ${!isInputValid && 'disabled'}`}
                      $theme={theme}
                      onClick={() => isInputValid && handleConfirmClick()}
                    >
                      <Icons.CheckIcon />
                    </ConfirmBtn>
                  </Styles.FlexRow>

                  <AddressesWrapper $theme={theme}>
                    <div className="Container">
                      {filteredAddresses.length > 0 ? (
                        filteredAddresses.map(
                          ({ name: accountName, address }) => (
                            <AddressItem
                              role="button"
                              selected={inputVal.address === address}
                              onClick={() =>
                                handleAddressClick(address, accountName)
                              }
                              $theme={theme}
                              key={`recipient-${address}`}
                            >
                              <Styles.FlexRow
                                $gap={'1.25rem'}
                                style={{ width: '100%' }}
                              >
                                <div style={{ minWidth: 'fit-content' }}>
                                  <Identicon
                                    value={address}
                                    fontSize="1.9rem"
                                  />
                                </div>
                                <Styles.FlexColumn
                                  $rowGap={'0.5rem'}
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  <h3 className="text-ellipsis">
                                    {accountName}
                                  </h3>
                                  <h4 className="text-ellipsis">
                                    {ellipsisFn(address, 12)}
                                  </h4>
                                </Styles.FlexColumn>
                                {inputVal.address === address && (
                                  <span className="ClearBtn">
                                    <Icons.Cross1Icon />
                                  </span>
                                )}
                              </Styles.FlexRow>
                            </AddressItem>
                          )
                        )
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
              </Dialog.Description>
            </Styles.FlexColumn>
            <Dialog.Close className="Dialog__Button">Close</Dialog.Close>
          </Styles.FlexColumn>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
