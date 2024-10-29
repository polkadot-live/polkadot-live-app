// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChrome } from '@fortawesome/free-brands-svg-icons';
import {
  faExternalLinkAlt,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';
import { ContentWrapper } from '@app/screens/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavCard } from '@/renderer/library/components/Cards';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { ActionItem } from '@app/library/components';
import { useEffect } from 'react';
import { Scrollable } from '@/renderer/library/styles';
import type { AccountSource } from '@/types/accounts';
import type { HomeProps } from './types';

export const Home = ({ setSection, setSource }: HomeProps) => {
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
    <Scrollable
      $footerHeight={0}
      $headerHeight={0}
      style={{ paddingTop: 0, paddingBottom: 20 }}
    >
      <ContentWrapper>
        {/* Hardware */}
        <ActionItem text={'Import Accounts'} style={{ marginTop: '1.75rem' }} />
        <div className="grid-wrapper">
          {/* Vault */}
          <NavCard
            title={'Polkadot Vault'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'vault')
            }
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

          {/* Ledger */}
          <NavCard
            title={'Ledger'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'ledger')
            }
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

          {/* Read-only */}
          <NavCard
            title={'Read Only'}
            onClick={(e: React.MouseEvent<HTMLElement>) =>
              handleClick(e, 'read-only')
            }
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
        </div>
      </ContentWrapper>
    </Scrollable>
  );
};
