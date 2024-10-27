// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChrome } from '@fortawesome/free-brands-svg-icons';
import {
  faCaretRight,
  faExternalLinkAlt,
  faInfo,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContentWrapper } from '@app/screens/Wrappers';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { ActionItem } from '@app/library/components';
import { useEffect } from 'react';
import { useHelp } from '@/renderer/contexts/common/Help';
import { Scrollable } from '@/renderer/library/styles';
import { ImportMethodCard } from './Wrappers';
import type { AccountSource } from '@/types/accounts';
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
          <ImportMethodCard
            onClick={(e) => handleClick(e, 'vault')}
            className="methodCard"
          >
            <div>
              <div>
                <PolkadotVaultSVG
                  className="logo vault"
                  style={{ height: '2rem', width: 'fit-content' }}
                />
                <div>
                  <div className="label">
                    <h1>Polkadot Vault</h1>
                    <div
                      className="help-icon stay"
                      onClick={() => {
                        openHelp('help:import:vault');
                      }}
                    >
                      <FontAwesomeIcon icon={faInfo} transform={'shrink-2'} />
                    </div>
                  </div>
                  <a
                    className="link stay"
                    href={`https://vault.novasama.io/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    signer.parity.io
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      transform="shrink-6"
                    />
                  </a>
                </div>
              </div>
              <div className="caret">
                <FontAwesomeIcon icon={faCaretRight} />
              </div>
            </div>
          </ImportMethodCard>

          {/* Ledger */}
          <ImportMethodCard
            className="methodCard"
            onClick={(e) => handleClick(e, 'ledger')}
          >
            <div>
              <div style={{ paddingTop: '0.2rem' }}>
                <LedgerLogoSVG
                  className="logo mono"
                  style={{ height: '2rem', width: 'fit-content' }}
                />
                <div>
                  <div className="label">
                    <h1>Ledger</h1>
                    <div
                      className="help-icon stay"
                      onClick={() => {
                        openHelp('help:import:ledger');
                      }}
                    >
                      <FontAwesomeIcon icon={faInfo} transform={'shrink-2'} />
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
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
                  </div>
                </div>
              </div>
              <div className="caret">
                <FontAwesomeIcon icon={faCaretRight} />
              </div>
            </div>
          </ImportMethodCard>

          {/* Read-only */}
          <ImportMethodCard
            className="methodCard"
            onClick={(e) => handleClick(e, 'read-only')}
          >
            <div>
              <div>
                <FontAwesomeIcon
                  icon={faCircleDot}
                  className="logo mono"
                  style={{ width: 'fit-content', fontSize: '1.8rem' }}
                />
                <div>
                  <div className="label">
                    <h1>Read Only</h1>
                    <div
                      className="help-icon stay"
                      onClick={() => {
                        openHelp('help:import:readOnly');
                      }}
                    >
                      <FontAwesomeIcon icon={faInfo} transform={'shrink-2'} />
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: 'var(--text-color-secondary)' }}>
                      Track any address.
                    </span>
                  </div>
                </div>
              </div>
              <div className="caret">
                <FontAwesomeIcon icon={faCaretRight} />
              </div>
            </div>
          </ImportMethodCard>
        </div>
      </ContentWrapper>
    </Scrollable>
  );
};
