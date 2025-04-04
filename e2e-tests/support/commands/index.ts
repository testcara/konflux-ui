// Include the cypress customized commands related files
import './hooks';
import './a11y';
import 'cypress-mochawesome-reporter/register';
import { Result } from 'axe-core';
import { initPerfMeasuring } from './perf';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      logA11yViolations(violations: Result[], target: string): Chainable<Element>;
      testA11y(target: string, selector?: string): Chainable<Element>;
      perfGroupStart(groupName: string): void;
      perfGroupEnd(groupName: string): void;
    }
  }
}

// Handling errors from application
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
Cypress.on('uncaught:exception', (err) => {
  return false;
});

// Add browser logs collector
const logOptions = {
  enableExtendedCollector: true,
};
initPerfMeasuring('cypress/perfstats.json');
