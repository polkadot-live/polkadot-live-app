// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { ButtonMonoInvert } from '../kits/buttons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

/**
 * @name FadeInWrapper
 * @summary Fades in elements when provided flag is true.
 */
export const FadeInWrapper = ({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) =>
  show && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, easings: ['easeOut'] }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );

/**
 * @name NoAccounts
 * @summary Button rendered when no accounts are imported.
 */
export const NoAccounts = ({ onClick }: { onClick: () => void }) => (
  <NoAccountsWrapper>
    <h4>No accounts imported.</h4>
    <ButtonMonoInvert
      lg
      text="Manage Accounts"
      iconLeft={faLink}
      onClick={() => onClick()}
    />
  </NoAccountsWrapper>
);

/**
 * @name NoOpenGov
 * @summary Button rendered when no OpenGov subscriptions are active.
 */
export const NoOpenGov = ({ onClick }: { onClick: () => void }) => (
  <NoAccountsWrapper>
    <h4>No OpenGov subscriptions added.</h4>
    <ButtonMonoInvert
      lg
      text="Explore OpenGov"
      iconLeft={faLink}
      onClick={() => onClick()}
    />
  </NoAccountsWrapper>
);

const NoAccountsWrapper = styled.div`
  color: var(--text-color-primary);
  background-color: var(--background-primary);
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
  align-items: center;
  margin: 0.75rem 1rem;
  padding: 2rem;
  border-radius: 0.375rem;

  button {
    z-index: 1;
    padding: 0.5rem 1.75rem !important;
  }
  h4 {
    text-align: center;
  }
`;
