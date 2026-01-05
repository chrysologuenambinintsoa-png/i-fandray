# Testing Configuration

## Test Scripts

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Test Structure

```
__tests__/           # Unit tests
├── Header.test.tsx
├── Splashscreen.test.tsx
├── utils.test.ts
└── api/
    └── news.test.ts

e2e/                 # End-to-end tests
└── auth.spec.ts
```

## CI/CD Pipeline

The project includes automated testing through GitHub Actions:

- **Unit Tests**: Jest with React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for browser automation
- **Linting**: ESLint for code quality
- **Security**: NPM audit for vulnerabilities
- **Coverage**: Codecov integration

### Test Coverage

- Components rendering
- User interactions
- API integrations
- Authentication flows
- Navigation
- Form validation

## Running Tests Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run unit tests:
   ```bash
   npm run test
   ```

3. Run E2E tests:
   ```bash
   # Install Playwright browsers first
   npx playwright install

   # Run E2E tests
   npm run test:e2e
   ```

## Writing Tests

### Unit Tests
Use React Testing Library for component testing:

```tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Tests
Use Playwright for end-to-end testing:

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to login page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Login')
  await expect(page).toHaveURL('/auth/login')
})
```