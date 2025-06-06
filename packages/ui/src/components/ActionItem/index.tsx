// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Wrapper } from './Wrapper';
import type { ActionItemProps } from './types';

/**
 * @name ActionItem
 * @summary A call to action item as a header.
 * @param {string} text - The text to display.
 */
export const ActionItem = ({
  style,
  text,
  toggled,
  disabled,
  onToggle,
  inactive = false,
  inlineButton,
  showIcon = true,
}: ActionItemProps) => {
  const [toggle, setToggle] = useState<boolean | undefined>(toggled);

  useEffect(() => setToggle(toggled), [toggled]);
  return (
    <Wrapper
      style={{
        ...style,
        opacity: inactive ? 0.3 : 1,
      }}
    >
      {showIcon && toggled === undefined && (
        <FontAwesomeIcon icon={faChevronRight} transform="shrink-6" />
      )}

      {showIcon && toggled && (
        <button
          type="button"
          className="toggle"
          disabled={disabled}
          onClick={() => {
            if (typeof onToggle === 'function') {
              onToggle(!toggle);
            }
            setToggle(!toggle);
          }}
        >
          {toggle && <FontAwesomeIcon icon={faCheck} transform="shrink-3" />}
        </button>
      )}
      {text}
      {inlineButton && <span>{inlineButton}</span>}
    </Wrapper>
  );
};
