[![CI](https://github.com/okaryo/chromex-locale-lint/actions/workflows/ci.yml/badge.svg)](https://github.com/okaryo/chromex-locale-lint/actions/workflows/ci.yml)

# chromex-locale-lint

chromex-locale-lint is a CLI tool that helps you validate your Chrome extension's localization files (`_locales/*/messages.json`). It checks for missing fields across locales and also validates the locale directory names against the list of locales supported by Google Chrome.

## Features

- **Missing Key Check:** Checks whether there are any keys in the base locale that do not exist in the other locales. Also, checks if there are any keys in other locales that do not exist in the base locale.

- **Invalid Locale Check:** Validates all locale directories against the list of language tags provided by Google Chrome. If a locale directory name does not match any of Chrome's supported locales, it will be reported.

- **Easy to Integrate with CI/CD:** Can be easily integrated with your CI/CD pipeline to ensure locale consistency at all times. Provides error codes on failure, which can be used to stop the build process.

## Installation

To install chromex-locale-lint, you can use npm:

```sh
npm install --save-dev chromex-locale-lint
```

Or with yarn:

```sh
yarn add --dev chromex-locale-lint
```

## Usage

You can use chromex-locale-lint from the command line like this:

```sh
npx chromex-locale-lint --localesDir /path/to/locales --baseLang en
```


## Options

* `--localesDir`: The directory where your locales are located. Defaults to `_locales/`.
* `--baseLang`: The language to use as a basis for comparison with other languages. Defaults to `en`.
* `--strict`: When enabled, treats warnings as errors. This is useful for enforcing strict locale consistency in your project. If any warnings are generated (such as missing keys in locales compared to the base language), the tool will exit with an error code, making it ideal for use in CI/CD pipelines to ensure high-quality translations. Defaults to `false`.

