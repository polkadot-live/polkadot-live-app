// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChrome, faUsb } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ActionItem,
  ButtonHelp,
  ButtonMonoInvert,
  ButtonText,
  ModalConnectItem,
  ModalHardwareItem,
} from '@polkadot-cloud/react';
import type { AnyFunction } from '@/types/misc';
import { DragClose } from '@app/library/DragClose';
import { ContentWrapper } from '@app/screens/Wrappers';
import PolkadotVaultSVG from '@polkadot-cloud/assets/extensions/svg/polkadotvault.svg?react';
import VaultLogoSVG from '@app/svg/polkadotVaultLogo.svg?react';
import LedgerLogoSVG from '@polkadot-cloud/assets/extensions/svg/ledger.svg?react';

export const Home = ({
  setSection,
  setSource,
}: {
  setSection: AnyFunction;
  setSource: AnyFunction;
}) => {
  return (
    <>
      <DragClose windowName="import" />
      <ContentWrapper>
        <h3>Manage Accounts</h3>
        <ActionItem text={'Hardware'} style={{ marginTop: '1.75rem' }} />
        <div style={{ display: 'flex' }}>
          <ModalConnectItem>
            <ModalHardwareItem>
              <div className="body">
                <div className="status">
                  <ButtonHelp
                    onClick={() => {
                      /* Empty */
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
                  href={`https://$signer.parity.io`}
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
                      /* Empty */
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
        </div>
      </ContentWrapper>
    </>
  );
};
