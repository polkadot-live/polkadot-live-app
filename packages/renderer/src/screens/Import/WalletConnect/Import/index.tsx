// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as AccordionRx from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';

import { BarLoader } from 'react-spinners';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ItemsColumn } from '@ren/screens/Home/Manage/Wrappers';
import { ChainIcon, InfoCard } from '@polkadot-live/ui/components';
import {
  faCaretLeft,
  faCaretRight,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';

/** Temp */
import { useAddresses, useWalletConnectImport } from '@ren/contexts/import';
import { useConnections } from '@ren/contexts/common';
import { useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { WcSessionButton } from './Wrappers';
import { AddressListFooter, ImportAddressRow } from '../../Wrappers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ImportProps } from './types';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { isAlreadyImported, getAccounts } = useAddresses();
  const { getOnlineMode, cacheGet, getTheme } = useConnections();
  const wcAddresses = getAccounts('wallet-connect');

  const theme = getTheme();
  const darkMode = cacheGet('mode:dark');
  const wcConnecting = cacheGet('wc:connecting');
  const wcDisconnecting = cacheGet('wc:disconnecting');
  const wcInitialized = cacheGet('wc:initialized');
  const wcSessionRestored = cacheGet('wc:session:restored');

  const {
    isImporting,
    wcFetchedAddresses,
    wcNetworks,
    getSelectedAddresses,
    handleConnect,
    handleDisconnect,
    handleFetch,
    setWcFetchedAddresses,
    handleImportProcess,
    setWcNetworks,
  } = useWalletConnectImport();

  /**
   * Accordion state.
   */
  const [accordionValue, setAccordionValue] = useState<string[]>([
    'establish-session',
    'import-addresses',
  ]);

  const getSelectedNetworkCount = () =>
    wcNetworks.filter(({ selected }) => selected).length;

  /**
   * Handle address checkbox click.
   */
  const handleSelectAddress = (
    encoded: string,
    chainId: ChainID,
    checkState: Checkbox.CheckedState
  ) => {
    setWcFetchedAddresses((prev) => {
      const updated = prev.map((data) =>
        data.encoded === encoded && data.chainId === chainId
          ? {
              ...data,
              selected:
                typeof checkState === 'string' ? false : Boolean(checkState),
            }
          : data
      );

      return updated;
    });
  };

  /**
   * Get import button label text.
   */
  const getImportLabel = () => {
    const len = getSelectedAddresses().length;
    return len === 0
      ? 'Import'
      : `Import ${len ? len : ''} Address${len === 1 ? '' : 'es'}`;
  };

  return (
    <>
      {(wcConnecting || wcDisconnecting) && (
        <BarLoader
          color={darkMode ? '#642763' : '#a772a6'}
          width={'100%'}
          height={2}
          cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
          speedMultiplier={0.75}
        />
      )}

      <Styles.PadWrapper>
        <Styles.FlexColumn $rowGap={'1.75rem'}>
          <section>
            <UI.ActionItem showIcon={false} text={'WalletConnect Accounts'} />
            {/** Bredcrumb */}
            <UI.ControlsWrapper
              $padWrapper={true}
              $padBottom={false}
              style={{ padding: '1rem 0 0 0' }}
            >
              <Styles.ResponsiveRow $smWidth="500px">
                <Styles.FlexRow>
                  <ButtonPrimaryInvert
                    className="back-btn"
                    text="Back"
                    iconLeft={faCaretLeft}
                    onClick={() => {
                      setSection(0);
                    }}
                  />
                  <UI.SortControlLabel label="Import WalletConnect Accounts" />
                </Styles.FlexRow>
                <Styles.FlexRow>
                  <ButtonText
                    iconLeft={faCaretRight}
                    text={'WalletConnect Accounts'}
                    disabled={wcAddresses.length === 0}
                    onClick={() => setShowImportUi(false)}
                  />
                </Styles.FlexRow>
              </Styles.ResponsiveRow>
            </UI.ControlsWrapper>
          </section>

          <section>
            <UI.AccordionWrapper $onePart={true}>
              <AccordionRx.Root
                className="AccordionRoot"
                type="multiple"
                value={accordionValue}
                onValueChange={(val) => setAccordionValue(val as string[])}
              >
                <Styles.FlexColumn>
                  <AccordionRx.Item
                    className="AccordionItem"
                    value={'establish-session'}
                  >
                    <UI.AccordionTrigger narrow={true}>
                      <ChevronDownIcon
                        className="AccordionChevron"
                        aria-hidden
                      />
                      <UI.TriggerHeader>Establish Session</UI.TriggerHeader>
                    </UI.AccordionTrigger>
                    <UI.AccordionContent transparent={true}>
                      {wcSessionRestored ? (
                        <Styles.FlexColumn>
                          <Styles.ResponsiveRow
                            $smWidth="600px"
                            $gap={'0.5rem'}
                          >
                            <Styles.FlexRow
                              className="SmAlignStretch"
                              $gap={'0.5rem'}
                              style={{ flex: 1 }}
                            >
                              <InfoCard
                                icon={faCircleDot}
                                iconTransform={'shrink-3'}
                                style={{ margin: '0', flex: 1 }}
                              >
                                <span>
                                  An existing session has been detected.
                                </span>
                              </InfoCard>
                            </Styles.FlexRow>
                            <Styles.FlexRow
                              className="SmAlignStart"
                              $gap={'0.5rem'}
                            >
                              {/** Connect and Disconnect Buttons */}
                              <WcSessionButton
                                disabled={
                                  !getOnlineMode() ||
                                  !wcSessionRestored ||
                                  !wcInitialized ||
                                  wcConnecting ||
                                  wcDisconnecting
                                }
                                onClick={async () => await handleDisconnect()}
                              >
                                Disconnect
                              </WcSessionButton>

                              <WcSessionButton
                                disabled={
                                  !wcSessionRestored ||
                                  !wcInitialized ||
                                  wcConnecting ||
                                  wcDisconnecting
                                }
                                onClick={() => {
                                  handleFetch();
                                  setAccordionValue(['import-addresses']);
                                }}
                              >
                                Fetch
                              </WcSessionButton>
                            </Styles.FlexRow>
                          </Styles.ResponsiveRow>
                        </Styles.FlexColumn>
                      ) : (
                        <>
                          <ItemsColumn>
                            {wcNetworks.map(({ chainId, selected }, i) => (
                              <ImportAddressRow key={i}>
                                <ChainIcon chainId={chainId} width={18} />
                                <div className="addressInfo">
                                  <h2>{chainId}</h2>
                                </div>
                                <Styles.CheckboxRoot
                                  $theme={theme}
                                  className="CheckboxRoot"
                                  id={`c${i}`}
                                  checked={selected}
                                  disabled={false}
                                  onCheckedChange={(
                                    checked: Checkbox.CheckedState
                                  ) =>
                                    setWcNetworks((prev) => {
                                      const updated = prev.map((data) =>
                                        data.chainId === chainId
                                          ? {
                                              ...data,
                                              selected:
                                                typeof checked === 'string'
                                                  ? false
                                                  : Boolean(checked),
                                            }
                                          : data
                                      );
                                      return updated;
                                    })
                                  }
                                >
                                  <Checkbox.Indicator className="CheckboxIndicator">
                                    <CheckIcon />
                                  </Checkbox.Indicator>
                                </Styles.CheckboxRoot>
                              </ImportAddressRow>
                            ))}
                          </ItemsColumn>
                          <Styles.FlexColumn style={{ marginTop: '0.5rem' }}>
                            <Styles.FlexRow $gap={'0.5rem'}>
                              <InfoCard
                                icon={faCircleDot}
                                iconTransform={'shrink-3'}
                                style={{ margin: '0', flex: 1 }}
                              >
                                <span style={{ flex: 1 }}>
                                  Select your target networks and click Connect
                                  to fetch addresses via WalletConnect.
                                </span>
                              </InfoCard>

                              {/** Connect Button */}
                              <WcSessionButton
                                disabled={
                                  getSelectedNetworkCount() === 0 ||
                                  !getOnlineMode() ||
                                  !wcInitialized ||
                                  wcConnecting
                                }
                                onClick={async () => await handleConnect()}
                              >
                                Connect
                              </WcSessionButton>
                            </Styles.FlexRow>
                          </Styles.FlexColumn>
                        </>
                      )}
                    </UI.AccordionContent>
                  </AccordionRx.Item>

                  {/** Import Addresses */}
                  <AccordionRx.Item
                    className="AccordionItem"
                    value={'import-addresses'}
                  >
                    <UI.AccordionTrigger narrow={true}>
                      <ChevronDownIcon
                        className="AccordionChevron"
                        aria-hidden
                      />
                      <UI.TriggerHeader>Import Accounts</UI.TriggerHeader>
                    </UI.AccordionTrigger>
                    <UI.AccordionContent transparent={true}>
                      {wcFetchedAddresses.length === 0 ? (
                        <InfoCard
                          icon={faCircleDot}
                          iconTransform={'shrink-3'}
                          style={{ marginTop: '0', marginBottom: '0.75rem' }}
                        >
                          <span>
                            Establish a WalletConnect session to view addresses.
                          </span>
                        </InfoCard>
                      ) : (
                        <>
                          <ItemsColumn>
                            {wcFetchedAddresses.map(
                              (
                                { chainId, encoded, publicKeyHex, selected },
                                i
                              ) => (
                                <ImportAddressRow key={`${chainId}-${encoded}`}>
                                  <div className="identicon">
                                    <UI.Identicon
                                      value={encoded}
                                      fontSize={'2.5rem'}
                                    />
                                  </div>
                                  <div className="addressInfo">
                                    <h2>
                                      {i + 1}. {chainId} Account
                                    </h2>
                                    <Styles.FlexRow $gap={'0.6rem'}>
                                      <span className="address">
                                        {ellipsisFn(encoded, 12)}
                                      </span>
                                      <span>
                                        <UI.CopyButton
                                          iconFontSize="1rem"
                                          theme={theme}
                                          onCopyClick={async () =>
                                            await window.myAPI.copyToClipboard(
                                              encoded
                                            )
                                          }
                                        />
                                      </span>
                                    </Styles.FlexRow>
                                  </div>
                                  <div className="right">
                                    {isAlreadyImported(publicKeyHex) ? (
                                      <span className="imported">Imported</span>
                                    ) : (
                                      <Styles.CheckboxRoot
                                        $theme={theme}
                                        className="CheckboxRoot"
                                        id={`${i + 1}-${chainId}`}
                                        checked={selected}
                                        disabled={false}
                                        onCheckedChange={(
                                          checked: Checkbox.CheckedState
                                        ) => {
                                          handleSelectAddress(
                                            encoded,
                                            chainId,
                                            checked
                                          );
                                        }}
                                      >
                                        <Checkbox.Indicator className="CheckboxIndicator">
                                          <CheckIcon />
                                        </Checkbox.Indicator>
                                      </Styles.CheckboxRoot>
                                    )}
                                  </div>
                                </ImportAddressRow>
                              )
                            )}
                          </ItemsColumn>

                          <AddressListFooter>
                            <div className="importBtn">
                              <button
                                disabled={
                                  isImporting ||
                                  getSelectedAddresses().length === 0
                                }
                                onClick={async () =>
                                  await handleImportProcess(setShowImportUi)
                                }
                              >
                                {getImportLabel()}
                              </button>
                            </div>
                          </AddressListFooter>
                        </>
                      )}
                    </UI.AccordionContent>
                  </AccordionRx.Item>
                </Styles.FlexColumn>
              </AccordionRx.Root>
            </UI.AccordionWrapper>
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
    </>
  );
};
