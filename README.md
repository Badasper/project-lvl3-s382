[![Maintainability](https://api.codeclimate.com/v1/badges/f6fb10f6bae38abdc756/maintainability)](https://codeclimate.com/github/Badasper/project-lvl3-s382/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/f6fb10f6bae38abdc756/test_coverage)](https://codeclimate.com/github/Badasper/project-lvl3-s382/test_coverage) [![Build Status](https://travis-ci.com/Badasper/project-lvl3-s382.svg?branch=master)](https://travis-ci.com/Badasper/project-lvl3-s382)

# Page loader

## Description

This is a CLI tool to download web pages with assets to local directory.

## How to install

To install please write in terminal:

```bash
npm -g install hexlet-level3-ya
```

or

```bash
mkdir page-loader
cd page-loader
git clone https://github.com/Badasper/project-lvl3-s382
make install
npm link
```

## How to use

To use please write in terminal:

```bash
page-loader --output [dirname] url
```

example:

```bash
page-loader --output /home/download/web https://hexlet.io/courses
```

DEBUG mode:

```bash
DEBUG=page-loader* --output /home/download/web https://hexlet.io/courses
```

## Asciinema

[demo install page-loader](https://asciinema.org/a/Xsj2vwzz9wI3b3NMfTlMXOGtf
)

[demo debug mode page-loader](https://asciinema.org/a/uggecbaRi9aqqmXmh0EmcqmWf)

[demo error handler page-loader]( https://asciinema.org/a/XulYaWoWFsKfxODNLfXBvWotW)

[demo listr page-loader](https://asciinema.org/a/LaYCuS8jSHSBemJTm5Ti1bnYm)