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
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InfoCard } from '../../Ledger/Import/Wrappers';
import type { AnyData } from 'packages/types/src';
import type { ChainID } from 'packages/types/src/chains';

const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
const WC_RELAY_URL = 'wss://relay.walletconnect.com';
const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

interface ImportProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

// Note: Duplicate of `Ledger/Import/Wrappers/LedgerAddressRow`.
export const WcNetworkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 1.15rem 1.5rem;

  > .addressInfo {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    > h2 {
      margin: 0;
      padding: 0;
      font-size: 1.1rem;
    }
    > span {
      color: var(--text-color-secondary);
    }
  }

  .imported {
    color: var(--text-color-secondary);
    font-size: 1rem;
  }
`;

// Note: Duplicate of `Ledger/Import/Wrappers/CheckboxRoot`.
const CheckboxRoot = styled(Checkbox.Root).attrs<{ $theme: AnyData }>(
  (props) => ({
    $theme: props.$theme,
  })
)`
  background-color: var(--background-surface);
  border: 1px solid var(--border-subtle);
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px var(--black-a7);
  transition: background-color 0.2s ease-out;

  &:disabled {
    filter: brightness(0.9);
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: var(--background-secondary-color);
  }
  .CheckboxIndicator {
    color: var(--violet-11);
  }
`;

interface WcSelectNetwork {
  caipId: string;
  ChainIcon: AnyData;
  chainId: ChainID;
  selected: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
  const { wcAddresses } = useAddresses();
  const { darkMode } = useConnections();

  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(Array.from({ length: 3 }, (_, index) => index));

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

  // Instantiate a universal provider using the projectId created for your app.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        {/*
        <ButtonText
          iconLeft={faCaretRight}
          text={'Wallet Connect Accounts'}
          disabled={false}
          onClick={async () => await initWc()}
        />
        */}
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
          {/* Select Networks */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Select Networks"
              itemIndex={0}
              wide={true}
            />
            <UI.AccordionPanel>
              <ItemsColumn>
                <InfoCard style={{ margin: '0' }}>
                  <span>
                    <FontAwesomeIcon
                      icon={faCircleDot}
                      transform={'shrink-3'}
                    />
                    Select which network addresses to fetch.
                  </span>
                </InfoCard>
                {wcNetworks.map(({ chainId, selected, ChainIcon }, i) => (
                  <WcNetworkRow key={i}>
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
                  </WcNetworkRow>
                ))}
              </ItemsColumn>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/* Create WalletConnect Session */}
          <UI.AccordionItem>
            <UI.AccordionCaretHeader
              title="Establish Session"
              itemIndex={1}
              wide={true}
            />
            <UI.AccordionPanel>
              <InfoCard style={{ margin: '0' }}>
                <span>
                  <FontAwesomeIcon icon={faCircleDot} transform={'shrink-3'} />
                  Open WalletConnect modal and establish a session with a
                  wallet.
                </span>
              </InfoCard>
            </UI.AccordionPanel>
          </UI.AccordionItem>

          {/* Import Addresses */}
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
              <p></p>
            </UI.AccordionPanel>
          </UI.AccordionItem>
        </UI.Accordion>
      </ContentWrapper>
    </Scrollable>
  );
};
