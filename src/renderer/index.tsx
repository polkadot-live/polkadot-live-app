// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Providers } from './Providers';
import { createRoot } from 'react-dom/client';

// Network themes.
import '@polkadot-cloud/core/accent/polkadot-relay.css';

// App styles.
import './theme/theme.css';
import './theme/index.css';

// Library styles.
import './library/Buttons/buttons.scss';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
const root = createRoot(rootElement);

root.render(<Providers />);
