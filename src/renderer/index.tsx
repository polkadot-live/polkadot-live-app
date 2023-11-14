// Basic app styles.
import './index.scss';

// Network themes.
import '@polkadot-cloud/core/accent/polkadot-relay.css';

// Default template fonts.
import '@polkadot-cloud/core/theme/default/fonts/index.css';
// Default template theme.
import '@polkadot-cloud/core/theme/default/index.css';

// Polkadot Cloud core styles.
import '@polkadot-cloud/core/css/styles/index.css';

import { Providers } from './Providers';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(<Providers />);
