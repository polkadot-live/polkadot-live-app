// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChrome } from '@fortawesome/free-brands-svg-icons';
import {
  faExternalLinkAlt,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';
import { ContentWrapper } from '@app/screens/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ActionItem,
  NavCard,
  ScrollableMax,
} from '@polkadot-live/ui/components';
import { GridTwoCol } from '@polkadot-live/ui/styles';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import WalletConnectSVG from '@w3ux/extension-assets/WalletConnect.svg?react';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { ButtonText } from '@polkadot-live/ui/kits/buttons';
import { useHelp } from '@app/contexts/common/Help';
import { useEffect } from 'react';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { HomeProps } from './types';

export const Home = ({ setSection, setSource }: HomeProps) => {
  const { openHelp } = useHelp();

  /// Handle clicking on an import method card.
  const handleClick = (
    event: React.MouseEvent<HTMLElement>,
    source: AccountSource
  ) => {
    let target = event.target as HTMLElement | null;

    // Traverse up the DOM tree and return if `stay` class found.
    while (target) {
      if (target.classList.contains('stay')) {
        return;
      }
      target = target.parentElement;
    }

    setSource(source);
    setSection(1);
  };

  useEffect(() => {
    const applyBorders = () => {
      const cards = document.querySelectorAll(
        '.methodCard'
      ) as NodeListOf<HTMLElement>;

      cards.forEach((card, i) => {
        if (i === 0) {
          card.style.borderTopLeftRadius = '0.375rem';
        } else if (i === 1) {
          card.style.borderTopRightRadius = '0.375rem';
        } else if (i === 2) {
          card.style.borderBottomLeftRadius = '0.375rem';
        } else if (i === 3) {
          card.style.borderBottomRightRadius = '0.375rem';
        }
      });
    };

    applyBorders();
  }, []);

  return (
    <ScrollableMax
      footerHeight={0}
      headerHeight={0}
      style={{ paddingTop: 0, paddingBottom: 20 }}
    >
      <ContentWrapper>
        <ActionItem
          showIcon={false}
          text={'Import Accounts'}
          style={{ marginTop: '1.75rem' }}
        />
        <GridTwoCol>
          {/* Read-only */}
          <NavCard
            title={'Read Only'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'read-only')
            }
            openHelp={openHelp}
            helpKey={'help:import:readOnly'}
            childrenLogo={
              <FontAwesomeIcon
                icon={faCircleDot}
                className="logo mono"
                style={{ width: 'fit-content', fontSize: '1.8rem' }}
              />
            }
            childrenSubtitle={
              <span style={{ color: 'var(--text-color-secondary)' }}>
                Track any address.
              </span>
            }
          />

          {/* Ledger */}
          <NavCard
            title={'Ledger'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'ledger')
            }
            openHelp={openHelp}
            helpKey={'help:import:ledger'}
            childrenLogo={
              <LedgerLogoSVG
                className="logo mono"
                style={{ height: '2rem', width: 'fit-content' }}
              />
            }
            childrenSubtitle={
              <>
                <ButtonText
                  text="BETA"
                  disabled
                  marginRight
                  style={{ opacity: 0.5, padding: 0 }}
                />
                <ButtonText
                  text="Chrome / Brave"
                  disabled
                  iconLeft={faChrome}
                  style={{ opacity: 0.5, padding: 0 }}
                />
              </>
            }
            styleLogoCont={{ paddingTop: '0.2rem' }}
          />

          {/* Vault */}
          <NavCard
            title={'Polkadot Vault'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'vault')
            }
            openHelp={openHelp}
            helpKey={'help:import:vault'}
            childrenLogo={
              <PolkadotVaultSVG
                className="logo vault"
                style={{ height: '2rem', width: 'fit-content' }}
              />
            }
            childrenSubtitle={
              <a
                className="link stay"
                href={`https://vault.novasama.io/`}
                target="_blank"
                rel="noreferrer"
              >
                vault.novasama.io
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  transform="shrink-6"
                />
              </a>
            }
          />

          {/* Wallet Connect */}
          <NavCard
            title={'Wallet Connect'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'wallet-connect')
            }
            openHelp={openHelp}
            helpKey={'help:import:walletConnect'}
            childrenLogo={
              <WalletConnectSVG
                className="logo"
                style={{ height: '2.1rem', width: 'fit-content' }}
              />
            }
            childrenSubtitle={
              <a
                className="link stay"
                href={`https://walletconnect.network//`}
                target="_blank"
                rel="noreferrer"
              >
                walletconnect.network
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  transform="shrink-6"
                />
              </a>
            }
          />
        </GridTwoCol>
      </ContentWrapper>
    </ScrollableMax>
  );
};
