// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { TooltipRx } from '../TooltipRx';
import { CopyButtonWrapper } from './CopyButton.styles';
import type { CopyButtonProps } from './types';

/**
 * @name CopyButton
 * @summary Copy button with tooltip component.
 */
export const CopyButton = ({
  theme,
  onCopyClick,
  defaultText = 'Copy Address',
  clickedText = 'Copied!',
  iconFontSize,
}: CopyButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>(defaultText);

  return (
    <TooltipRx
      theme={theme}
      open={open}
      text={text}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setText(defaultText);
        }
      }}
    >
      <CopyButtonWrapper
        $fontSize={iconFontSize}
        onClick={async () => {
          await onCopyClick();
          setText(clickedText);
          setOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faCopy} transform={'shrink-2'} />
      </CopyButtonWrapper>
    </TooltipRx>
  );
};
