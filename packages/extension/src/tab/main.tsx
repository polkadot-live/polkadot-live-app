// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Network themes.
import '@polkadot-live/styles/accents/polkadot-relay.css';

// App styles.
import '@polkadot-live/styles/theme/theme.scss';
import '@polkadot-live/styles/theme/index.scss';
import '@polkadot-live/styles/partials/utils.scss';
import '@polkadot-live/styles/partials/dialog.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
