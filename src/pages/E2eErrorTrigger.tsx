import type { FC } from 'react';

/** Throws on render so Playwright can verify RouteErrorBoundary + PublicChrome. */
const E2eErrorTrigger: FC = () => {
  throw new Error('E2E route error probe');
};

export default E2eErrorTrigger;
