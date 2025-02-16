// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as AccordionRx from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '../../../../theme/variables';

import { BarLoader } from 'react-spinners';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { FlexColumn, FlexRow, Scrollable } from '@polkadot-live/ui/styles';
import { InfoCard } from '@polkadot-live/ui/components';
import {
  faCaretLeft,
  faCaretRight,
  faCircleDot,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

/** Temp */
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import { useWalletConnectImport } from '@app/contexts/import/WalletConnectImport';
import { useState } from 'react';
import { ellipsisFn } from '@w3ux/utils';
import { WcSessionButton } from './Wrappers';
import {
  AddressListFooter,
  CheckboxRoot,
  ImportAddressRow,
} from '../../Wrappers';
import type { ImportProps } from './types';
import { TriggerHeader } from '@app/screens/Action/Wrappers';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const {
    darkMode,
    getOnlineMode,
    wcSyncFlags: {
      wcConnecting,
      wcDisconnecting,
      wcInitialized,
      wcSessionRestored,
    },
  } = useConnections();

  const { isAlreadyImported, wcAddresses } = useAddresses();

  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
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
    checkState: Checkbox.CheckedState
  ) => {
    setWcFetchedAddresses((prev) => {
      const updated = prev.map((data) =>
        data.encoded === encoded
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

  /**
   * Render reusable offline warning info card.
   */
  const renderOfflineWarning = (marginTop = '0.5rem') => (
    <InfoCard
      kind={'warning'}
      icon={faExclamationTriangle}
      style={{ marginTop }}
    >
      <span>Currently offline. Please go online to enable connections.</span>
    </InfoCard>
  );

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '1rem' }}
    >
      {(wcConnecting || wcDisconnecting) && (
        <BarLoader
          color={darkMode ? '#642763' : '#a772a6'}
          width={'100%'}
          height={2}
          cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
          speedMultiplier={0.75}
        />
      )}

      {/** Bredcrumb */}
      <UI.ControlsWrapper $padWrapper={true} $padButton={false}>
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={faCaretLeft}
          onClick={() => {
            setSection(0);
          }}
        />
        <UI.SortControlLabel label="Import WalletConnect Accounts" />

        <ButtonText
          iconLeft={faCaretRight}
          text={'WalletConnect Accounts'}
          disabled={wcAddresses.length === 0}
          onClick={() => setShowImportUi(false)}
        />
      </UI.ControlsWrapper>

      <div style={{ padding: '1.5rem 1.25rem 2rem', marginTop: '1rem' }}>
        <UI.AccordionWrapper $onePart={true}>
          <AccordionRx.Root
            className="AccordionRoot"
            type="multiple"
            value={accordionValue}
            onValueChange={(val) => setAccordionValue(val as string[])}
          >
            <FlexColumn>
              <AccordionRx.Item
                className="AccordionItem"
                value={'establish-session'}
              >
                <UI.AccordionTrigger narrow={true}>
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <TriggerHeader>Establish Session</TriggerHeader>
                </UI.AccordionTrigger>
                <UI.AccordionContent transparent={true}>
                  {wcSessionRestored ? (
                    <FlexColumn>
                      {!getOnlineMode() && renderOfflineWarning('0')}
                      <FlexRow $gap={'0.5rem'}>
                        <InfoCard
                          icon={faCircleDot}
                          iconTransform={'shrink-3'}
                          style={{ margin: '0', flex: 1 }}
                        >
                          <span>An existing session has been detected.</span>
                        </InfoCard>

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
                      </FlexRow>
                    </FlexColumn>
                  ) : (
                    <>
                      <ItemsColumn>
                        {wcNetworks.map(
                          ({ chainId, selected, ChainIcon }, i) => (
                            <ImportAddressRow key={i}>
                              <ChainIcon
                                width={'20'}
                                fill={chainId === 'Polkadot' ? '#ac2461' : ''}
                              />
                              <div className="addressInfo">
                                <h2>{chainId}</h2>
                              </div>
                              <CheckboxRoot
                                $theme={theme}
                                className="CheckboxRoot"
                                id={`c${i}`}
                                checked={selected}
                                disabled={false}
                                onCheckedChange={(checked) =>
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
                              </CheckboxRoot>
                            </ImportAddressRow>
                          )
                        )}
                      </ItemsColumn>
                      <FlexColumn style={{ marginTop: '0.5rem' }}>
                        {!getOnlineMode() && renderOfflineWarning()}
                        <FlexRow $gap={'0.5rem'}>
                          <InfoCard
                            icon={faCircleDot}
                            iconTransform={'shrink-3'}
                            style={{ margin: '0', flex: 1 }}
                          >
                            <span style={{ flex: 1 }}>
                              Select your target networks and click Connect to
                              fetch addresses via WalletConnect.
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
                        </FlexRow>
                      </FlexColumn>
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
                  <ChevronDownIcon className="AccordionChevron" aria-hidden />
                  <TriggerHeader>Import Accounts</TriggerHeader>
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
                          ({ chainId, encoded, selected }, i) => (
                            <ImportAddressRow key={encoded}>
                              <UI.Identicon
                                value={encoded}
                                fontSize={'2.5rem'}
                              />
                              <div className="addressInfo">
                                <h2>
                                  {i + 1}. {chainId} Account
                                </h2>
                                <FlexRow $gap={'0.6rem'}>
                                  <span>{ellipsisFn(encoded, 12)}</span>
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
                                </FlexRow>
                              </div>
                              {isAlreadyImported(encoded) ? (
                                <span className="imported">Imported</span>
                              ) : (
                                <CheckboxRoot
                                  $theme={theme}
                                  className="CheckboxRoot"
                                  id={`${i + 1}-${chainId}`}
                                  checked={selected}
                                  disabled={false}
                                  onCheckedChange={(checked) => {
                                    handleSelectAddress(encoded, checked);
                                  }}
                                >
                                  <Checkbox.Indicator className="CheckboxIndicator">
                                    <CheckIcon />
                                  </Checkbox.Indicator>
                                </CheckboxRoot>
                              )}
                            </ImportAddressRow>
                          )
                        )}
                      </ItemsColumn>

                      <AddressListFooter>
                        <div className="importBtn">
                          <button
                            disabled={
                              isImporting || getSelectedAddresses().length === 0
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
            </FlexColumn>
          </AccordionRx.Root>
        </UI.AccordionWrapper>
      </div>
    </Scrollable>
  );
};
