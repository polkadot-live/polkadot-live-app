// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChrome, faReadme, faUsb } from '@fortawesome/free-brands-svg-icons';
import {
  faExternalLinkAlt,
  faKeyboard,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContentWrapper } from '@app/screens/Wrappers';
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react';
import VaultLogoSVG from '@app/svg/polkadotVaultLogo.svg?react';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { ButtonHelp } from '@/renderer/kits/Buttons/ButtonHelp';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ButtonText } from '@/renderer/kits/Buttons/ButtonText';
import { ActionItem } from '@/renderer/library/ActionItem';
import { ModalConnectItem } from '@/renderer/kits/Overlay/structure/ModalConnectItem';
import { ModalHardwareItem } from '@/renderer/kits/Overlay/structure/ModalHardwareItem';
import { useHelp } from '@/renderer/contexts/common/Help';
import type { HomeProps } from './types';

export const Home = ({ setSection, setSource }: HomeProps) => {
  const { openHelp } = useHelp();

  return (
    <ContentWrapper>
      {/* Hardware */}
      <ActionItem
        text={'Hardware or Read Only'}
        style={{ marginTop: '1.75rem' }}
      />
      <div className="grid-wrapper">
        <ModalConnectItem>
          <ModalHardwareItem>
            <div className="body">
              <div className="status">
                <ButtonHelp
                  onClick={() => {
                    openHelp('help:import:vault');
                  }}
                />
              </div>
              <div className="row">
                <PolkadotVaultSVG className="logo vault" />
              </div>
              <div className="row">
                <VaultLogoSVG className="svg-title" />
              </div>
              <div className="row margin">
                <ButtonMonoInvert
                  text="Manage"
                  onClick={() => {
                    setSource('vault');
                    setSection(1);
                  }}
                  iconLeft={faQrcode}
                  iconTransform="shrink-1"
                />
              </div>
            </div>
            <div className="foot">
              <a
                className="link"
                href={`https://signer.parity.io/`}
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
          </ModalHardwareItem>
        </ModalConnectItem>
        <ModalConnectItem>
          <ModalHardwareItem>
            <div className="body">
              <div className="status">
                <ButtonHelp
                  onClick={() => {
                    openHelp('help:import:ledger');
                  }}
                />
              </div>
              <div className="row">
                <LedgerLogoSVG className="logo mono" />
              </div>
              <div className="row">
                <ButtonText
                  text="BETA"
                  disabled
                  marginRight
                  style={{ opacity: 0.5 }}
                />
                <ButtonText
                  text="Chrome / Brave"
                  disabled
                  iconLeft={faChrome}
                  style={{ opacity: 0.5 }}
                />
              </div>
              <div className="row margin">
                <ButtonMonoInvert
                  text="USB"
                  onClick={() => {
                    setSource('ledger');
                    setSection(1);
                  }}
                  iconLeft={faUsb}
                  iconTransform="shrink-1"
                />
              </div>
            </div>
            <div className="foot">
              <a
                className="link"
                href={`https://ledger.com`}
                target="_blank"
                rel="noreferrer"
              >
                ledger.com
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  transform="shrink-6"
                />
              </a>
            </div>
          </ModalHardwareItem>
        </ModalConnectItem>

        {/* Read-only*/}
        <ModalConnectItem>
          <ModalHardwareItem>
            <div className="body">
              <div className="status">
                <ButtonHelp
                  onClick={() => {
                    openHelp('help:import:readOnly');
                  }}
                />
              </div>
              <div className="row">
                <FontAwesomeIcon icon={faReadme} className="logo mono" />
              </div>
              <div className="row">
                <ButtonText
                  text="Read Only"
                  disabled
                  marginRight
                  style={{ opacity: 0.5 }}
                />
              </div>
              <div className="row margin" style={{ marginBottom: '0.75rem' }}>
                <ButtonMonoInvert
                  text="Manage"
                  onClick={() => {
                    setSource('read-only');
                    setSection(1);
                  }}
                  iconLeft={faKeyboard}
                  iconTransform="shrink-1"
                />
              </div>
              <div className="foot"></div>
            </div>
          </ModalHardwareItem>
        </ModalConnectItem>
      </div>
    </ContentWrapper>
  );
};
