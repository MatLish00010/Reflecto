export * from './api';
export * from './constants';
export * from './environment';
export * from './validation';

import { validateEnvironment } from './validation';

if (typeof window === 'undefined') {
  validateEnvironment();
}
