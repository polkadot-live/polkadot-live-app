// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import type { ModalAnimationProps } from '../types';

/**
 * @name ModalMotionTwoSection
 * @summary Two section wrapper with motion animation.
 */
export const ModalMotionTwoSection = ({
  children,
  ...rest
}: ModalAnimationProps) => (
  <motion.div className="modal-motion-two-sections" {...rest}>
    {children}
  </motion.div>
);
