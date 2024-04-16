# Veedgee Workers
> Veedgee's Workers

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/rafaelcamargo/veedgee-workers/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/rafaelcamargo/veedgee-workers/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/rafaelcamargo/veedgee-workers/badge.svg?branch=main)](https://coveralls.io/github/rafaelcamargo/veedgee-workers?branch=main)

## Contributing

1. Install [Node](https://nodejs.org/en/). Download the "Recommend for Most Users" version.

2. Clone the repo:
``` bash
git clone git@github.com:rafaelcamargo/veedgee-workers.git
```

3. Go to the project directory
``` bash
cd veedgee-workers
```

4. Install the project dependencies
``` bash
npm install
```

5. Serve the application:
``` bash
npm run start
```
Application will be running at `http://localhost:4000`

## Running Workers

There are two kinds of workers:
1. Cralwers: Responsible to gather events from several websites.
2. Notifications: Responsible to send to subscribers the events just discovered.

To fire crawlers worker, you must send a POST request to `/cralwers`, and a POST request to `/notifications` to fire notifications worker. For both requests, you must pass the request header `vwtoken` as `vee456`.

## Tests

1. In case you have changed any worker behavior, ensure that all changes are covered with automated tests:
``` bash
npm run test
```

2. You can optionally generate a coverage report while running tests:
``` bash
npm run test -- --coverage
```
