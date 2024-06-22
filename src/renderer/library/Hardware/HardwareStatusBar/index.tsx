// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Wrapper } from './Wrapper';
import { ButtonHelp } from '../../../kits/Buttons/ButtonHelp';
import { ButtonMonoInvert } from '../../../kits/Buttons/ButtonMonoInvert';
import { ButtonPrimaryInvert } from '../../../kits/Buttons/ButtonPrimaryInvert';
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
    <Wrapper
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
    </Wrapper>
  );
};
