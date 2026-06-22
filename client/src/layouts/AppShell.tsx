import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';

export default function AppShell() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
