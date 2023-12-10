[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/medimbembaeldnglneiipkenpagjfcdj?logo=google&logoColor=white&label=google%20users)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Mozilla Add-on Users](https://img.shields.io/amo/users/text-formatter?logo=mozilla&label=mozilla%20users)](https://addons.mozilla.org/addon/text-formatter)
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/medimbembaeldnglneiipkenpagjfcdj?label=chrome&logo=googlechrome)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Mozilla Add-on Version](https://img.shields.io/amo/v/text-formatter?label=firefox&logo=firefox)](https://addons.mozilla.org/addon/text-formatter)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/text-formatter?logo=github)](https://github.com/cssnr/text-formatter/releases/latest)
[![Manifest Version](https://img.shields.io/github/manifest-json/v/cssnr/text-formatter?filename=manifest.json&logo=json&label=manifest)](https://github.com/cssnr/text-formatter/blob/master/manifest.json)
[![Build](https://github.com/cssnr/text-formatter/actions/workflows/build.yaml/badge.svg)](https://github.com/cssnr/text-formatter/actions/workflows/build.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_text-formatter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_text-formatter)
# Text Formatter

Modern Chrome Web Extension and Firefox Browser Addon for Splitting and Formatting Text.

*   [Install](#install)
*   [Features](#features)
*   [Configuration](#configuration)
*   [Development](#development)
    -   [Building](#building)

# Install

[![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png)](https://github.com/cssnr/text-formatter/releases/latest/download/text_formatter-firefox.xpi)
[![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Chromium](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chromium/chromium_48x48.png)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Brave](https://raw.githubusercontent.com/alrra/browser-logos/main/src/brave/brave_48x48.png)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Vivaldi](https://raw.githubusercontent.com/alrra/browser-logos/main/src/vivaldi/vivaldi_48x48.png)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)
[![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png)](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj)

> [!IMPORTANT]  
> Firefox is currently only available from a [GitHub Release](https://github.com/cssnr/text-formatter/releases/latest/download/text_formatter-firefox.xpi).

All **Chromium** Based Browsers can install the extension from the
[Chrome Web Store](https://chromewebstore.google.com/detail/text-formatter/medimbembaeldnglneiipkenpagjfcdj).

*   Download a [Chrome Release](https://github.com/cssnr/text-formatter/releases/latest/download/text_formatter-chrome.crx) from GitHub
*   Download a [Firefox Release](https://github.com/cssnr/text-formatter/releases/latest/download/text_formatter-firefox.xpi) from GitHub

# Features

-   Split Text into Lines with a Slier or Saved Values
-   Activate from Context Menu, Keyboard Shortcuts or Popup
-   Automatic Dark/Light Mode based on Browser Appearance Settings

Please submit a [Feature Request](https://github.com/cssnr/text-formatter/discussions/categories/feature-requests) for new features.  
For any issues, bugs or concerns; please [Open an Issue](https://github.com/cssnr/text-formatter/issues).

# Configuration

You can pin the Addon by clicking the `Puzzle Piece`, find the Web Extension icon, then;  
**Chrome,** click the `Pin` icon.  
**Firefox,** click the `Settings Wheel` and `Pin to Toolbar`.

To open the options, click on the icon (from above) then click `Open Options`.  
Here you can set flags and add as many saved regular expressions as you would like for easy use later.  
Make sure to click`Save Options` when finished.

For more information on regex, see: https://regex101.com/

# Development

**Quick Start**

To install and run chrome or firefox with web-ext.
```shell
npm isntall
npm run chrome
npm run firefox
```

To Load Unpacked/Temporary Add-on make a `manifest.json` and run from the [src](src) folder.
```shell
npm run manifest:chrome
npm run manifest:firefox
```

For more information on web-ext, [read this documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/).  
To pass additional arguments to an `npm run` command, use `--`.  
Example: `npm run chrome -- --chromium-binary=...`

## Building

Install the requirements and copy libraries into the `src/dist` directory by running `npm install`.
See [gulpfile.js](gulpfile.js) for more information on `postinstall`.
```shell
npm install
```

To load unpacked or temporary addon from the [src](src) folder, you must generate the `src/manifest.json` for the desired browser.
```shell
npm run manifest:chrome
npm run manifest:firefox
```

If you would like to create a `.zip` archive of the [src](src) directory for the desired browser.
```shell
npm run build
npm run build:chrome
npm run build:firefox
```

For more information on building, see the scripts in the [package.json](package.json) file.

## Chrome Setup

1.  Build or Download a [Release](https://github.com/cssnr/text-formatter/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1.  In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1.  Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox Setup

Note: Firefox Temporary addon's will **not** remain after restarting Firefox, therefore;
it is very useful to keep addon storage after uninstall/restart with `keepStorageOnUninstall`.

1.  Build or Download a [Release](https://github.com/cssnr/text-formatter/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Go to `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...`
1.  Navigate to the folder you extracted earlier, select `manifest.json` then click `Select File`.
1.  Open `about:config` search for `extensions.webextensions.keepStorageOnUninstall` and set to `true`.

If you need to test a restart, you must pack the addon. This only works in ESR, Development, or Nightly.

1.  Run `npm run build:firefox` then use `web-ext-artifacts/{name}-firefox-{version}.zip`.
1.  Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1.  Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.
