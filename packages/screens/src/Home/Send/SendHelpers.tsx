// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Select from '@radix-ui/react-select';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/styles/wrappers';
import { useConnections } from '@polkadot-live/contexts';
import { ellipsisFn } from '@w3ux/utils';
import { PuffLoader } from 'react-spinners';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { NextStepArrowWrapper, ProgressBarWrapper } from './Wrappers';
import type {
  AccountNameWithTooltipProps,
  AddressWithTooltipProps,
  SelectBoxProps,
} from './types';

/**
 * @name AddressWithTooltip
 * @summary Address with tooltip component.
 */
export const AddressWithTooltip = ({
  theme,
  address,
}: AddressWithTooltipProps) => (
  <UI.TooltipRx style={{ fontSize: '0.9rem ' }} theme={theme} text={address}>
    <span style={{ cursor: 'default' }}>{ellipsisFn(address, 12)}</span>
  </UI.TooltipRx>
);

/**
 * @name AccountNameWithTooltip
 * @summary Account name with tooltip component.
 */
export const AccountNameWithTooltip = ({
  theme,
  address,
  accountName,
  copyToClipboard,
}: AccountNameWithTooltipProps) => (
  <Styles.FlexRow $gap={'0.75rem'}>
    <UI.TooltipRx theme={theme} text={ellipsisFn(address, 12)}>
      <span>
        <UI.Identicon value={address} fontSize="1.5rem" />
      </span>
    </UI.TooltipRx>
    <span style={{ cursor: 'default' }}>{accountName}</span>
    <UI.CopyButton theme={theme} onCopyClick={() => copyToClipboard(address)} />
  </Styles.FlexRow>
);

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
      backgroundColor: 'var(--background-primary)',
      borderRadius: '0.375rem',
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
 * @deprecated
 */
export const SelectBox = ({
  children,
  ariaLabel,
  placeholder,
  disabled = false,
  onValueChange,
}: SelectBoxProps) => {
  const { getTheme } = useConnections();
  const theme = getTheme();

  return (
    <Select.Root
      disabled={disabled}
      onValueChange={(val) => onValueChange(val)}
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
  loading = false,
}: {
  label: string;
  complete: boolean;
  loading?: boolean;
}) => (
  <>
    <ChevronDownIcon className="AccordionChevron" aria-hidden />
    <h4 style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span>{label}</span>
      <PuffLoader
        loading={loading}
        size={16}
        color={'var(--text-color-secondary)'}
      />
    </h4>

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
