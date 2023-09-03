import './index.scss';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(<>
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron application.</p>
</>);
