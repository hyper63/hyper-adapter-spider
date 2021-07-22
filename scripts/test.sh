#!/bin/bash

deno lint --ignore=arc
deno fmt --check --ignore=arc
deno test -A --unstable --no-check adapter_test.js lib/spider/publish-content_test.js