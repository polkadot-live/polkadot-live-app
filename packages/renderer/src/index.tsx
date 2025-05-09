// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import { Providers } from './Providers';
import { createRoot } from 'react-dom/client';

// Package styles.
import '@theme-toggles/react/css/Classic.css';

// Network themes.
import '@ren/theme/accents/polkadot-relay.css';

// App styles.
import './theme/theme.scss';
import './theme/index.scss';
import './theme/utils.scss';
import './theme/dialog.scss';

// Library styles.
import '@polkadot-live/ui/scss/buttons/index.scss';
import '@polkadot-live/ui/scss/overlay/index.scss';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);
root.render(<Providers />);
