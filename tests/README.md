# Playwright Tests

## Setup Complete ✅

Automated E2E tests using Playwright for **Chrome only**.

## Running Tests

**Important:** Start the dev server first, then run tests in a separate terminal.

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Run tests
pnpm test

# Or run with UI
pnpm test:ui

# Or run in headed mode (see browser)
pnpm test:headed
```

## Current Tests (4 tests - all passing)

### `auth.spec.ts`
- ✅ Should show sign in page elements
- ✅ Should show social login buttons (Google/Apple)
- ✅ Should navigate to sign up page
- ✅ Should show forgot password link

## Configuration

- **Browser**: Chrome only (Chromium)
- **Base URL**: Auto-detects dev server port
- **Workers**: 2 (parallel execution)
- **Test files**: `tests/*.spec.ts`

## Adding New Tests

Create new `.spec.ts` files in the `tests/` directory:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.getByTestId('element-id')).toBeVisible();
  });
});
```

**Keep tests:**
- **Small** - One thing per test
- **Modular** - Independent
- **Fast** - No unnecessary waits
