// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Providers } from './Providers';
import { createRoot } from 'react-dom/client';

// Library styles.
import '@polkadot-live/ui/scss/buttons/index.scss';
import '@polkadot-live/ui/scss/overlay/index.scss';

// Network themes.
import '@polkadot-live/styles/accents/polkadot-relay.css';

// App styles.
import '@polkadot-live/styles/theme/theme.scss';
import '@polkadot-live/styles/theme/index.scss';
import '@polkadot-live/styles/partials/utils.scss';
import '@polkadot-live/styles/partials/dialog.scss';

createRoot(document.getElementById('root')!).render(<Providers />);
