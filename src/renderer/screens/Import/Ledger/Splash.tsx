// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import LedgerLogoSVG from '@w3ux/extension-assets/Ledger.svg?react';
import { SplashWrapper } from '../Wrappers';
import { determineStatusFromCodes } from './Utils';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import type { SplashProps } from '../types';

export const Splash = ({ statusCodes, setSection }: SplashProps) => (
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
);
