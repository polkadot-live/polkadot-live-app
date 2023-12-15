![workflow](https://github.com/rossbulat/polkadot-live/actions/workflows/ci.yml/badge.svg) [![License](https://img.shields.io/badge/License-GPL3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0-only)

# Polkadot Live

Decentralised Polkadot Notifications and Chain Interactions on the Desktop.

## Testing

Follow the steps below to run the WebdriverIO test suite:

1. Install Chrome Driver on your system. For Mac OS:

   ```
   brew install chromedriver
   ```

  **Note:** You may need to allow the `chromedriver` program to run on Mac OS
  via the system preferences Privacy & Security settings.

2. Build the app by invoking the `package:dev` script, which bundles
  `devDepencies` with the app needed for running the WebdriverIO test runner:

   ```
   yarn run package:dev
   ```

3. Invoke the `wdio` script to run the entire WDIO test suite:

   ```
   yarn run wdio
   ```
