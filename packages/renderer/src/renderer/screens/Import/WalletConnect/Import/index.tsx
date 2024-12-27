// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as themeVariables from '../../../../theme/variables';

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
} from '@fortawesome/free-solid-svg-icons';

/** Temp */
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { useAddresses } from '@app/contexts/import/Addresses';
import { useConnections } from '@app/contexts/common/Connections';
import { useState } from 'react';
import { chainIcon } from '@ren/config/chains';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { encodeAddress } from '@polkadot/util-crypto';
import { ellipsisFn } from '@w3ux/utils';
import { FlexRow, WcSessionButton } from './Wrappers';
import {
  AddressListFooter,
  CheckboxRoot,
  ImportAddressRow,
  InfoCard,
} from '../../Wrappers';
import type { AnyData } from 'packages/types/src';
import type { ImportProps, WcFetchedAddress, WcSelectNetwork } from './types';

const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
const WC_RELAY_URL = 'wss://relay.walletconnect.com';
const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { wcAddresses } = useAddresses();
  const { darkMode } = useConnections();

  const [accordionActiveIndices, setAccordionActiveIndices] =
    useState<number>(0);

  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const [wcNetworks, setWcNetworks] = useState<WcSelectNetwork[]>([
    {
      caipId: WC_POLKADOT_CAIP_ID,
      ChainIcon: chainIcon('Polkadot'),
      chainId: 'Polkadot',
      selected: false,
    },
    {
      caipId: WC_KUSAMA_CAIP_ID,
      ChainIcon: chainIcon('Kusama'),
      chainId: 'Kusama',
      selected: false,
    },
    {
      caipId: WC_WESTEND_CAIP_ID,
      ChainIcon: chainIcon('Westend'),
      chainId: 'Westend',
      selected: false,
    },
  ]);

  // Temp: Addresses for mock UI.
  const mockAddress = '5DwLjkdKkQV6vp12Hi8773GvWAvvkjaxSeVns91u7mswS4io';
  const [receivedAddresses, setReceivedAddresses] = useState<
    WcFetchedAddress[]
  >([
    {
      chainId: 'Polkadot',
      encoded: encodeAddress(mockAddress, 0),
      substrate: mockAddress,
      selected: false,
    },
    {
      chainId: 'Kusama',
      encoded: encodeAddress(mockAddress, 2),
      substrate: mockAddress,
      selected: false,
    },
    {
      chainId: 'Westend',
      encoded: encodeAddress(mockAddress, 42),
      substrate: mockAddress,
      selected: false,
    },
  ]);

  // Instantiate a universal provider using the projectId created for your app.
  const initWc = async () => {
    try {
      const provider = await UniversalProvider.init({
        projectId: WC_PROJECT_ID,
        relayUrl: WC_RELAY_URL,
      });

      // Listen for WalletConnect events
      provider.on('session_create', (session: AnyData) => {
        console.log('Session created:', session);
      });

      provider.on('session_update', ({ topic, params }: AnyData) => {
        console.log('Session updated:', topic, params);
      });

      provider.on('session_delete', (session: AnyData) => {
        console.log('Session deleted:', session);
      });

      provider.on('connect', (event: AnyData) => {
        console.log('Connected to Wallet:', event);
      });

      provider.on('disconnect', (event: AnyData) => {
        console.log('Wallet disconnected:', event);
      });

      // Example Namespace and Sign Client connect call:
      // Note: this serves as an example where a dapp requires 3 different chain namespaces
      // (polkadot, kusama and westend). The supported methods, chains, and events
      // can all be defined by the dapp team based on the requirements of the dapp.
      const params = {
        requiredNamespaces: {
          polkadot: {
            // Sign the relevant data (either an unsigned transaction or message) and return the signature.
            methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
            chains: [
              `polkadot:${WC_POLKADOT_CAIP_ID}`,
              `polkadot:${WC_KUSAMA_CAIP_ID}`,
              `polkadot:${WC_WESTEND_CAIP_ID}`,
            ],
            events: ['chainChanged", "accountsChanged'],
          },
        },
      };

      const { uri, approval } = await provider.client.connect(params);

      // Create a standalone modal using your dapps WalletConnect projectId.
      const walletConnectModal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: WC_PROJECT_ID,
      });

      // Open the modal prompting the user to scan the QR code with their wallet app or copy
      // the URI from the modal and paste into their wallet app to begin the session creation
      // process.
      if (uri) {
        walletConnectModal.openModal({ uri });
      }

      // Await session approval from the wallet app.
      // expiry: timestamp of session expiry
      // pairingTopic: ID of pairing, attempt to connect if cached.
      // await client.connect({ pairingTopic, requiredNamespaces });
      const walletConnectSession = await approval();

      walletConnectModal.closeModal();

      // Get the accounts from the session for use in constructing transactions.
      const wcAccounts = Object.values(walletConnectSession.namespaces)
        .map((namespace) => namespace.accounts)
        .flat();

      // Grab account addresses from CAIP account formatted accounts
      const accounts = wcAccounts.map((wcAccount) => {
        const address = wcAccount.split(':')[2];
        return address;
      });

      console.log(accounts);
    } catch (error: AnyData) {
      if (error.message.includes('Proposal expired')) {
        console.warn('Proposal expired. Prompting user to retry.');
        // Optionally retry or guide the user
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

  return (
    <Scrollable
      $footerHeight={4}
      style={{ paddingTop: 0, paddingBottom: '2rem' }}
    >
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
          multiple={false}
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
          gap={'1rem'}
          panelPadding={'0.75rem 0.25rem'}
        >
          {/** Select Networks */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Select Networks"
              itemIndex={0}
              wide={true}
            />
            <UI.AccordionPanel>
              <ItemsColumn>
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
                <FlexRow>
                  <InfoCard style={{ margin: '0', flex: 1 }}>
                    <span>
                      <FontAwesomeIcon
                        icon={faCircleDot}
                        transform={'shrink-3'}
                      />
                      <span style={{ flex: 1 }}>
                        Select which network addresses to fetch and click{' '}
                        <b>Next</b>
                        to continue.
                      </span>
                    </span>
                  </InfoCard>

                  <WcSessionButton onClick={() => console.log('todo')}>
                    Next
                  </WcSessionButton>
                </FlexRow>
              </ItemsColumn>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/** Create WalletConnect Session */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Establish Session"
              itemIndex={1}
              wide={true}
            />
            <UI.AccordionPanel>
              <FlexRow>
                <InfoCard style={{ margin: '0', flex: 1 }}>
                  <span>
                    <FontAwesomeIcon
                      icon={faCircleDot}
                      transform={'shrink-3'}
                    />
                    <span style={{ flex: 1 }}>
                      Click <b>Connect</b> to establish a WalletConnect session
                      with a supported wallet.
                    </span>
                  </span>
                </InfoCard>

                <WcSessionButton onClick={async () => await initWc()}>
                  Connect
                </WcSessionButton>
              </FlexRow>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/** Import Addresses */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Import Addresses"
              itemIndex={2}
              wide={true}
            />
            <UI.AccordionPanel>
              <InfoCard style={{ marginTop: '0', marginBottom: '0.75rem' }}>
                <span>
                  <FontAwesomeIcon icon={faCircleDot} transform={'shrink-3'} />
                  Establish a WalletConnect session to view addresses.
                </span>
              </InfoCard>
              <ItemsColumn>
                {receivedAddresses.map(({ chainId, encoded, selected }, i) => (
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
                        setReceivedAddresses((prev) => {
                          const updated = prev.map((data) =>
                            data.encoded === encoded
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
                        });
                      }}
                    >
                      <Checkbox.Indicator className="CheckboxIndicator">
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </CheckboxRoot>
                  </ImportAddressRow>
                ))}
              </ItemsColumn>

              <AddressListFooter>
                <div className="importBtn">
                  <button
                    disabled={false}
                    onClick={() => console.log('todo: import')}
                  >
                    Import
                  </button>
                </div>
              </AddressListFooter>
            </UI.AccordionPanel>
          </UI.AccordionItem>
        </UI.Accordion>
      </ContentWrapper>
    </Scrollable>
  );
};
