// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@/renderer/contexts/common/Help';
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
        <div style={{ ...styleLogoCont }}>
          {childrenLogo}
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
