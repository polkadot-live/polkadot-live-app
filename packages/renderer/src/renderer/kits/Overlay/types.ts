// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '@ren/renderer/types';
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

export type CanvasScrollProps = ModalAnimationProps & {
  // the maximum width of the canvas.
  size?: 'lg' | 'xl';
  // allow scrolling.
  scroll?: boolean;
};

export type ModalContentProps = ModalAnimationProps & {
  // include canvas styling.
  canvas?: boolean;
};
