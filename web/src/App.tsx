import { Suspense, lazy } from 'react';
import { StatusScreen } from './components/StatusScreen';
import { Landing } from './landing/Landing';
import { NotFound } from './pages/NotFound';
import { usePath } from './router';

// The landing page loads on its own; each app loads only when someone opens it.
const DemoPage = lazy(() => import('./pages/DemoPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));

/** "/": the website. "/demo": sample plots. "/app": owner accounts. "/staff": the hidden staff console. */
export default function App() {
  const path = usePath().replace(/\/+$/, '') || '/';

  let page;
  if (path === '/') page = <Landing />;
  else if (path === '/demo') page = <DemoPage />;
  else if (path === '/app') page = <AccountPage />;
  else if (path === '/staff') page = <StaffPage />;
  else page = <NotFound />;

  return <Suspense fallback={<StatusScreen message="Loading…" />}>{page}</Suspense>;
}
