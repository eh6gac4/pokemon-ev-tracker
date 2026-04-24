export default {
  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'http://localhost:8080',
    viewport: { width: 390, height: 844 }, // iPhone 14
    deviceScaleFactor: 1,
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
};
