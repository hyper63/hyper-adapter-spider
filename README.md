<h1 align="center">hyper-adapter-spider</h1>
<p align="center">
This spider adapter allows clients to create web crawling jobs that can be invoked using the
`start` method, then the spider will use the source url to build a list of links that it should
crawl for a given site. For each link the spider will pull down the content in a headless browser
and run a script command within the browser dom. This script command needs to return a object with
a title property and content property that will be used to generate a search document. The search document
can then be posted to a target endpoint for consumption by a search engine or AI algorithm.
</p>
<p align="center">
This spider requires a serverless implementation of a headless browser to build the links required to
crawl and to create the content document for each link. Embedded in this project is an architect app
that creates two serverless endpoints for the headless browser. See [Setup](#setup) for more information on
how to initialize the headless browser and how to pass it to the adapter.
</p>

## Table of Contents

- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Setup](#setup)
- [Testing](#testing)

## Getting Started

In order to use this adapter, you will need an AWS Account, and a IAM user, this
user will need access to S3, the IAM credentials should have full access to s3
buckets `hyper-crawler-*`. You will also need an IAM user that can deploy lambda
functions using architect. NOTE: this does not have to be the same IAM user
account.

Passing credentials, you can choose to manually pass the credentials via env
variables or explicitly through the hyper adapter configuration.

## Configuration

```js
const links = "https://aws.xxxx.com/links"
const content = "https://aws.xxxx.com/content"
...
adapters: [
  { port: 'crawler', plugins: [spider({links, content})]}
]
...
```

## Setup

Deploy architect app (requires nodejs)

- Install aws cli
- Install `npm i -g @architect/architect aws-sdk`
- Setup your aws credentials

```
cd arc
arc deploy production
```

> NOTE: If you would like to setup a staging env you can run `arc deploy`

## Testing

run `./scripts/test.sh` to lint, check format, and run tests

run `./scripts/harness.sh` to spin up a local instance of `hyper` using your
adapter for the data port

## TODO

- Add automation to set adapter name
- Add automation to set `port`
- Add automation to scaffold adapter methods, based on selected `port`
