// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonMonoInvert } from '@polkadot-cloud/react';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { Header } from '@app/library/Header';
import LedgerLogoSVG from '@polkadot-cloud/assets/extensions/svg/ledger.svg?react';
import { SplashWrapper } from '../Wrappers';
import type { SplashProps } from '../types';
import { determineStatusFromCodes } from './Utils';

export const Splash = ({ statusCodes, setSection }: SplashProps) => {
  return (
    <>
      <Header showMenu />
      <BodyInterfaceWrapper $maxHeight>
        <SplashWrapper>
          <div className="icon">
            <LedgerLogoSVG style={{ transform: 'scale(0.7)' }} opacity={0.25} />
          </div>

          <div className="content">
            <h1>
              {!statusCodes.length
                ? 'Checking...'
                : determineStatusFromCodes(statusCodes, false).title}
            </h1>
            <h4>{determineStatusFromCodes(statusCodes, false).subtitle}</h4>

            <div className="btns">
              <ButtonMonoInvert
                lg
                text="Back"
                iconLeft={faAngleLeft}
                onClick={() => setSection(0)}
              />
            </div>
          </div>
        </SplashWrapper>
      </BodyInterfaceWrapper>
    </>
  );
};
