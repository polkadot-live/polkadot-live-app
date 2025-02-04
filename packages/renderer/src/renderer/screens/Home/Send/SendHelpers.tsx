// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as themeVariables from '../../../theme/variables';

import { useConnections } from '@app/contexts/common/Connections';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCircleCheck,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import {
  CopyButton,
  NextStepArrowWrapper,
  ProgressBarWrapper,
} from './Wrappers';

import type { CopyButtonWithTooltipProps, SelectBoxProps } from './types';

/**
 * @name ProgressBar
 * @summary Progress bar component
 */
export const ProgressBar = ({ value, max }: { value: number; max: number }) => {
  const percentage = (value / max) * 100;

  return (
    <ProgressBarWrapper>
      <div className="progress-fill" style={{ width: `${percentage}%` }} />
    </ProgressBarWrapper>
  );
};

/**
 * @name CopyButtonWithTooltip
 * @summary Copy button with tooltip component.
 */
export const CopyButtonWithTooltip = ({
  theme,
  onCopyClick,
}: CopyButtonWithTooltipProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [text, setText] = useState<string>('Copy Address');

  return (
    <UI.TooltipRx
      theme={theme}
      open={open}
      text={text}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setText('Copy Address');
        }
      }}
    >
      <CopyButton
        onClick={async () => {
          await onCopyClick();
          setText('Copied!');
          setOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faCopy} transform={'shrink-2'} />
      </CopyButton>
    </UI.TooltipRx>
  );
};

/**
 * @name FlexColumn
 * @summary Simple flex column layout helper.
 */
export const FlexColumn = ({ children }: { children: React.ReactNode }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    {children}
  </section>
);

/**
 * @name InfoPanel
 * @summary Panel with left and right sections to display useful information to the user.
 */
export const InfoPanel = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      fontSize: '1rem',
      padding: '1rem',
      backgroundColor: 'var(--background-surface)',
      border: '0.375rem',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        opacity: '0.85',
      }}
    >
      <span style={{ flex: 1, color: 'var(--text-color-secondary)' }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-color-primary)' }}>{children}</span>
    </div>
  </div>
);

/**
 * @name InfoPanelSingle
 * @summary Simple panel that accepts arbitrary markup.
 */
export const InfoPanelSingle = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      fontSize: '1rem',
      padding: '1rem',
      backgroundColor: 'var(--background-surface)',
      border: '0.375rem',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0.85',
      }}
    >
      <span style={{ color: 'var(--text-color-secondary)' }}>{children}</span>
    </div>
  </div>
);

/**
 * @name NextStepArrow
 * @summary Round arrow button to transition to send UI next step.
 */
export const NextStepArrow = ({
  complete,
  onClick,
}: {
  complete: boolean;
  onClick: () => void;
}) => (
  <NextStepArrowWrapper $complete={complete}>
    <button disabled={!complete} onClick={() => onClick()}>
      <FontAwesomeIcon icon={faCaretDown} transform={'shrink-6'} />
    </button>
  </NextStepArrowWrapper>
);

/**
 * @name SelectBox
 * @summary Radix UI select box wrapper.
 */
export const SelectBox = ({
  children,
  ariaLabel,
  placeholder,
  value,
  disabled = false,
  onValueChange,
}: SelectBoxProps) => {
  const { darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  return (
    <Select.Root
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
    >
      <UI.SelectTrigger $theme={theme} aria-label={ariaLabel}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="SelectIcon">
          <ChevronDownIcon />
        </Select.Icon>
      </UI.SelectTrigger>
      <Select.Portal>
        <UI.SelectContent $theme={theme} position="popper" sideOffset={3}>
          <Select.ScrollUpButton className="SelectScrollButton">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="SelectViewport">
            <Select.Group>{children}</Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="SelectScrollButton">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </UI.SelectContent>
      </Select.Portal>
    </Select.Root>
  );
};

/**
 * @name TriggerContent
 * @summary Content for the Radix UI accordion trigger section.
 */
export const TriggerContent = ({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) => (
  <>
    <ChevronDownIcon className="AccordionChevron" aria-hidden />
    <h4 style={{ flex: 1 }}>{label}</h4>
    <div className="right">
      <FontAwesomeIcon
        style={
          complete
            ? { color: 'var(--accent-success)' }
            : { color: 'inherit', opacity: '0.25' }
        }
        icon={faCircleCheck}
        transform={'grow-4'}
      />
    </div>
  </>
);
