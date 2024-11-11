// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@ren/renderer/contexts/common/Help';
import { NavCardWrapper } from './NavCard.styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faInfo } from '@fortawesome/free-solid-svg-icons';
import type { NavCardProps } from './types';

export const NavCard = ({
  // TItle of the card.
  title,
  // Handler when clicking the card.
  onClick,
  // Help content to display on clicking the info button.
  helpKey,
  // Markup rendered in logo container.
  childrenLogo,
  // Markup rendered in the card subtitle container.
  childrenSubtitle,
  // Styles to apply to the logo container.
  styleLogoCont,
}: NavCardProps) => {
  const { openHelp } = useHelp();

  return (
    <NavCardWrapper className="methodCard" onClick={onClick}>
      <div>
        <div>
          <div style={{ ...styleLogoCont, minHeight: '28px' }}>
            {childrenLogo}
          </div>
          <div>
            <div className="label">
              <h1>{title}</h1>
              {helpKey && (
                <div
                  className="help-icon stay"
                  onClick={() => {
                    openHelp(helpKey);
                  }}
                >
                  <FontAwesomeIcon icon={faInfo} transform={'shrink-2'} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex' }}>{childrenSubtitle}</div>
          </div>
        </div>
        <div className="caret">
          <FontAwesomeIcon icon={faCaretRight} />
        </div>
      </div>
    </NavCardWrapper>
  );
};

export const NavCardThin = ({
  // TItle of the card.
  title,
  // Handler when clicking the card.
  onClick,
  // Markup rendered in logo container.
  childrenLogo,
  // Markup rendered in the card subtitle container.
  childrenSubtitle,
  // Styles to apply to the logo container.
  styleLogoCont,
}: NavCardProps) => (
  <NavCardWrapper $thin={true} className="methodCard" onClick={onClick}>
    <div>
      <div>
        <div className="thin-content">
          <div style={{ minHeight: '26px', ...styleLogoCont }}>
            {childrenLogo}
          </div>
          <h1>{title}</h1>
        </div>
        <div style={{ display: 'flex' }}>{childrenSubtitle}</div>
      </div>
      <div className="caret">
        <FontAwesomeIcon icon={faCaretRight} />
      </div>
    </div>
  </NavCardWrapper>
);
