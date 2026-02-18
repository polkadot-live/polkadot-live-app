// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ButtonHelp,
  ButtonMonoInvert,
  ButtonPrimaryInvert,
} from '../../../kits/buttons';
import { HardwareStatusBarWrapper } from './Wrapper';
import type { HardwareStatusBarProps } from './types';

export const HardwareStatusBar = ({
  handleCancel,
  handleDone,
  show,
  help,
  Icon,
  inProgress,
  text,
}: HardwareStatusBarProps) => {
  const { helpKey, handleHelp } = help || {};

  return (
    <HardwareStatusBarWrapper
      initial="hidden"
      animate={show ? 'show' : undefined}
      variants={{
        hidden: { bottom: -50 },
        show: {
          bottom: 0,
          transition: {
            staggerChildren: 0.01,
          },
        },
      }}
      transition={{
        duration: 2,
        type: 'spring',
        bounce: 0.4,
      }}
    >
      <div className="inner">
        <section>
          <div style={{ width: '2rem', height: '2rem' }} className="icon">
            <Icon />
          </div>
          <div className="text">
            <h3>
              {text}
              {help && (
                <ButtonHelp
                  marginLeft
                  onClick={() => {
                    if (typeof handleHelp === 'function' && helpKey) {
                      handleHelp(helpKey);
                    }
                  }}
                  background="secondary"
                />
              )}
            </h3>
          </div>
        </section>
        <section>
          {inProgress ? (
            <ButtonMonoInvert
              text={'Cancel'}
              onClick={() =>
                typeof handleCancel === 'function' && handleCancel()
              }
            />
          ) : (
            <ButtonPrimaryInvert
              text={'Done'}
              onClick={() => {
                if (typeof handleDone === 'function') {
                  handleDone();
                }
              }}
            />
          )}
        </section>
      </div>
    </HardwareStatusBarWrapper>
  );
};
