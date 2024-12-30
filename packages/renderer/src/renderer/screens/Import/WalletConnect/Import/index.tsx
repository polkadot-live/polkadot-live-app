// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '../../../../theme/variables';

import { BarLoader } from 'react-spinners';
import { CheckIcon } from '@radix-ui/react-icons';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ItemsColumn } from '@app/screens/Home/Manage/Wrappers';
import { ContentWrapper } from '../../../Wrappers';
import { Scrollable } from '@polkadot-live/ui/styles';
import {
  faCaretLeft,
  faCaretRight,
  faCircleDot,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

/** Temp */
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect, useState } from 'react';
import { useWalletConnect } from '@ren/renderer/contexts/import/WalletConnect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ellipsisFn } from '@w3ux/utils';
import { FlexRow, WcSessionButton } from './Wrappers';
import {
  AddressListFooter,
  CheckboxRoot,
  ImportAddressRow,
  InfoCard,
} from '../../Wrappers';
import type { ImportProps } from './types';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { wcAddresses } = useAddresses();
  const { darkMode, isConnected } = useConnections();

  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: 2 }, (_, index) => index));

  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const {
    connectWc,
    disconnectWcSession,
    fetchAddressesFromExistingSession,
    setWcFetchedAddresses,
    setWcNetworks,
    wcConnecting,
    wcDisconnecting,
    wcFetchedAddresses,
    wcInitialized,
    wcNetworks,
    wcSessionRestored,
  } = useWalletConnect();

  const getSelectedNetworkCount = () =>
    wcNetworks.filter(({ selected }) => selected).length;

  useEffect(() => {
    if (wcFetchedAddresses.length > 0) {
      setAccordionActiveIndices([1]);
    }
  }, [wcFetchedAddresses]);

  /**
   * Handle connect button click.
   */
  const handleConnect = async () => {
    await connectWc();
  };

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
   * Get the selected addresses to import.
   */
  const getSelectedAddresses = () =>
    wcFetchedAddresses.filter(({ selected }) => selected);

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
  const renderOfflineWarning = () => (
    <InfoCard>
      <span className="warning">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>Currently offline. Please go online to enable connections.</span>
      </span>
    </InfoCard>
  );

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
      {wcConnecting ||
        (wcDisconnecting && (
          <BarLoader
            color={darkMode ? '#642763' : '#a772a6'}
            width={'100%'}
            height={2}
            cssOverride={{ position: 'fixed', top: 0, zIndex: 99 }}
            speedMultiplier={0.75}
          />
        ))}

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

      {/** Content */}
      <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
        <UI.Accordion
          multiple
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
          gap={'1rem'}
          panelPadding={'0.75rem 0.25rem'}
        >
          {/** Establish Session */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Establish Session"
              itemIndex={0}
              wide={true}
            />
            <UI.AccordionPanel>
              <ItemsColumn>
                {wcSessionRestored ? (
                  <>
                    {!isConnected && renderOfflineWarning()}
                    <FlexRow>
                      <InfoCard style={{ margin: '0', flex: 1 }}>
                        <span>
                          <FontAwesomeIcon
                            icon={faCircleDot}
                            transform={'shrink-3'}
                          />
                          <span>An existing session has been detected.</span>
                        </span>
                      </InfoCard>

                      {/** Connect and Disconnect Buttons */}
                      <WcSessionButton
                        disabled={
                          !isConnected ||
                          !wcSessionRestored ||
                          !wcInitialized ||
                          wcConnecting ||
                          wcDisconnecting
                        }
                        onClick={async () => await disconnectWcSession()}
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
                          fetchAddressesFromExistingSession();
                          setAccordionActiveIndices([1]);
                        }}
                      >
                        Fetch
                      </WcSessionButton>
                    </FlexRow>
                  </>
                ) : (
                  <>
                    {wcNetworks.map(({ chainId, selected, ChainIcon }, i) => (
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
                    ))}

                    {!isConnected && renderOfflineWarning()}
                    <FlexRow>
                      <InfoCard style={{ margin: '0', flex: 1 }}>
                        <span>
                          <FontAwesomeIcon
                            icon={faCircleDot}
                            transform={'shrink-3'}
                          />
                          <span style={{ flex: 1 }}>
                            Select your target networks and click Connect to
                            fetch addresses via WalletConnect.
                          </span>
                        </span>
                      </InfoCard>

                      {/** Connect Button */}
                      <WcSessionButton
                        disabled={
                          getSelectedNetworkCount() === 0 ||
                          wcConnecting ||
                          !isConnected ||
                          !wcInitialized
                        }
                        onClick={async () => await handleConnect()}
                      >
                        Connect
                      </WcSessionButton>
                    </FlexRow>
                  </>
                )}
              </ItemsColumn>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/** Import Addresses */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Import Addresses"
              itemIndex={1}
              wide={true}
            />
            <UI.AccordionPanel>
              {wcFetchedAddresses.length === 0 ? (
                <InfoCard style={{ marginTop: '0', marginBottom: '0.75rem' }}>
                  <span>
                    <FontAwesomeIcon
                      icon={faCircleDot}
                      transform={'shrink-3'}
                    />
                    Establish a WalletConnect session to view addresses.
                  </span>
                </InfoCard>
              ) : (
                <>
                  <ItemsColumn>
                    {wcFetchedAddresses.map(
                      ({ chainId, encoded, selected }, i) => (
                        <ImportAddressRow key={encoded}>
                          <UI.Identicon value={encoded} size={28} />
                          <div className="addressInfo">
                            <h2>
                              {i + 1}. {chainId} Account
                            </h2>
                            <span>{ellipsisFn(encoded, 12)}</span>
                          </div>
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
                        </ImportAddressRow>
                      )
                    )}
                  </ItemsColumn>

                  <AddressListFooter>
                    <div className="importBtn">
                      <button
                        disabled={getSelectedAddresses().length === 0}
                        onClick={() => console.log('todo: import')}
                      >
                        {getImportLabel()}
                      </button>
                    </div>
                  </AddressListFooter>
                </>
              )}
            </UI.AccordionPanel>
          </UI.AccordionItem>
        </UI.Accordion>
      </ContentWrapper>
    </Scrollable>
  );
};
