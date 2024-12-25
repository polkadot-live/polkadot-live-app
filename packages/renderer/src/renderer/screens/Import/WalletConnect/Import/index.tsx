// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import {
  ButtonPrimaryInvert,
  ButtonText,
} from '@polkadot-live/ui/kits/buttons';
import { ContentWrapper } from '../../../Wrappers';
import { Scrollable } from '@polkadot-live/ui/styles';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';

/** Temp */
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import type { AnyData } from 'packages/types/src';

const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
const WC_RELAY_URL = 'wss://relay.walletconnect.com';
const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

interface ImportProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Import = ({ setSection, setShowImportUi }: ImportProps) => {
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
        <UI.SortControlLabel label="Import Wallet Connect Accounts" />

        {/*
        <ButtonText
          iconLeft={faCaretRight}
          text={'Wallet Connect Accounts'}
          disabled={false}
          onClick={() => setShowImportUi(false)}
        />
        */}

        <ButtonText
          iconLeft={faCaretRight}
          text={'Wallet Connect Accounts'}
          disabled={false}
          onClick={async () => await initWc()}
        />
      </UI.ControlsWrapper>

      {/** Content */}
      <ContentWrapper style={{ padding: '1rem 2rem 0', marginTop: '1rem' }}>
        <span>Content...</span>
      </ContentWrapper>
    </Scrollable>
  );
};
