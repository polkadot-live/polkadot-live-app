// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as Styles from '@polkadot-live/styles';
import * as Icons from '@radix-ui/react-icons';
import { useConnections } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { getSendChains } from '@polkadot-live/consts/chains';
import { ChainIcon } from '@polkadot-live/ui';
import {
  AddressesWrapper,
  AddressItem,
  ConfirmBtn,
  InputWrapper,
  SelectedAddressItem,
  TriggerButton,
} from './Wrappers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { DialogSelectNetworkProps } from './types';

export const DialogSelectNetwork = ({
  sendNetwork,
  setSendNetwork,
}: DialogSelectNetworkProps) => {
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState<ChainID | null>(null);

  /**
   * Handle clicking the confirm button.
   */
  const handleConfirmClick = () => {
    setSendNetwork(inputVal);
    setIsOpen(false);
  };

  /**
   * Handle clicking a listed network.
   */
  const handleNetworkClick = (chainId: ChainID) => {
    inputVal === chainId ? setInputVal(null) : setInputVal(chainId);
  };

  /**
   * Set input value to selected network when dialog is re-opened.
   */
  useEffect(() => {
    if (sendNetwork) {
      setInputVal(sendNetwork);
    }
  }, [isOpen]);

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
          <SelectedAddressItem
            className={!getOnlineMode() ? 'disable' : ''}
            $theme={theme}
          >
            <Styles.FlexRow $gap={'1.25rem'} style={{ width: '100%' }}>
              {sendNetwork ? (
                <ChainIcon style={{ width: '18px' }} chainId={sendNetwork} />
              ) : (
                <span>Select Network</span>
              )}
              <h3>{sendNetwork}</h3>
            </Styles.FlexRow>
          </SelectedAddressItem>
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
                Select Network
              </Dialog.Title>

              <Styles.DialogHr $theme={theme} />

              <Styles.FlexColumn $rowGap={'0.75rem'}>
                <Dialog.Description>
                  <span style={{ color: theme.textColorSecondary }}>
                    Select a network to send assets.
                  </span>
                </Dialog.Description>

                {/** Input */}
                <Styles.FlexRow $gap={'0.5rem'}>
                  <Styles.FlexRow
                    $gap={'0'}
                    style={{
                      flex: 1,
                      backgroundColor: theme.backgroundPrimary,
                      paddingLeft: inputVal ? '1rem' : undefined,
                    }}
                  >
                    {inputVal && (
                      <ChainIcon
                        style={{ width: '20px' }}
                        chainId={inputVal!}
                      />
                    )}
                    <InputWrapper
                      className="AddressInput"
                      $theme={theme}
                      style={{ flex: 1 }}
                      disabled={true}
                      placeholder={'Select Network'}
                      value={inputVal || ''}
                    />
                  </Styles.FlexRow>
                  <ConfirmBtn
                    className={'valid'}
                    disabled={!inputVal}
                    $theme={theme}
                    onClick={() => handleConfirmClick()}
                  >
                    <Icons.CheckIcon />
                  </ConfirmBtn>
                </Styles.FlexRow>

                <AddressesWrapper $theme={theme}>
                  <div className="Container">
                    {getSendChains().map((c) => {
                      const selected = inputVal === c;
                      return (
                        <AddressItem
                          role="button"
                          onClick={() => handleNetworkClick(c)}
                          $selected={selected}
                          $theme={theme}
                          key={`select-network-${c}`}
                        >
                          <Styles.FlexRow
                            $gap={'1.25rem'}
                            style={{ width: '100%' }}
                          >
                            <ChainIcon style={{ width: '18px' }} chainId={c} />
                            <div style={{ flex: 1 }}>
                              <h3
                                style={{
                                  paddingTop: '4px',
                                  fontSize: '1.06rem',
                                }}
                                className="text-ellipsis"
                              >
                                {c}
                              </h3>
                            </div>
                            {selected && (
                              <span className="ClearBtn">
                                <Icons.Cross1Icon />
                              </span>
                            )}
                          </Styles.FlexRow>
                        </AddressItem>
                      );
                    })}
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
