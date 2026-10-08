import { createRoot } from 'react-dom/client';
import Projects from './Projects.jsx';

// React owns only this container; the rest of the portfolio stays in HTML.
const container = document.getElementById('projects-root');
createRoot(container).render(<Projects />);
