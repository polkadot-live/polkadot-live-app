// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '@/renderer/types';
import type { AnimationProps } from 'framer-motion';

export type ModalAnimationProps = ComponentBase & AnimationProps;

export type ModalConnectItemProps = ComponentBase & {
  // whether the item can be connected to.
  canConnect?: boolean;
};

export type ModalSectionProps = ComponentBase & {
  // the type of window (tab | carousel).
  type: 'tab' | 'carousel';
};
