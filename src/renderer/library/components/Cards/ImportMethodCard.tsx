// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@/renderer/contexts/common/Help';
import { ImportMethodCardWrapper } from './ImportMethodCard.styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faInfo } from '@fortawesome/free-solid-svg-icons';
import type { AnyFunction } from '@/types/misc';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';

interface ImportMethodCardProps {
  // TItle of the card.
  title: string;
  // Handler when clicking the card.
  onClick: AnyFunction;
  // Help content to display on clicking the info button.
  helpKey: HelpItemKey;
  // Markup rendered in logo container.
  childrenLogo: React.ReactNode;
  // Markup rendered in the card subtitle container.
  childrenSubtitle: React.ReactNode;
  // Styles to apply to the logo container.
  styleLogoCont?: React.CSSProperties;
}

export const ImportMethodCard = ({
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
}: ImportMethodCardProps) => {
  const { openHelp } = useHelp();

  return (
    <ImportMethodCardWrapper className="methodCard" onClick={onClick}>
      <div>
        <div style={{ ...styleLogoCont }}>
          {childrenLogo}
          <div>
            <div className="label">
              <h1>{title}</h1>
              <div
                className="help-icon stay"
                onClick={() => {
                  openHelp(helpKey);
                }}
              >
                <FontAwesomeIcon icon={faInfo} transform={'shrink-2'} />
              </div>
            </div>
            <div style={{ display: 'flex' }}>{childrenSubtitle}</div>
          </div>
        </div>
        <div className="caret">
          <FontAwesomeIcon icon={faCaretRight} />
        </div>
      </div>
    </ImportMethodCardWrapper>
  );
};
