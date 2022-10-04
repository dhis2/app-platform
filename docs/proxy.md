---
title: Proxy
---

When developing against a remote instance, some browsers may block cookies due
to the cross-site nature of requests.

As a workaround, the [`start`](scripts/start.md) command provides a `--proxy`
option. The value of this option is the remote instance that a local proxy will
route requests to.

## Usage

```
d2-app-scripts start --proxy <remote instance URL>
```
