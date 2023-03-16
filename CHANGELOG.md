## [10.3.4](https://github.com/dhis2/app-platform/compare/v10.3.3...v10.3.4) (2023-03-16)


### Bug Fixes

* make loading placeholders transparent ([#795](https://github.com/dhis2/app-platform/issues/795)) ([6e64756](https://github.com/dhis2/app-platform/commit/6e64756325b366b413acbdce8dd0d6b70632d118))

## [10.3.3](https://github.com/dhis2/app-platform/compare/v10.3.2...v10.3.3) (2023-03-13)


### Bug Fixes

* **plugins:** inject precache manifest correctly ([#792](https://github.com/dhis2/app-platform/issues/792)) ([c0d172e](https://github.com/dhis2/app-platform/commit/c0d172ec362182ce978e43b16e9c411ec61e5039))
* **pwa:** add config option to omit files from precache [LIBS-482] ([#793](https://github.com/dhis2/app-platform/issues/793)) ([d089dda](https://github.com/dhis2/app-platform/commit/d089dda25433ca52f84c42c9369fce95419e4f83))

## [10.3.2](https://github.com/dhis2/app-platform/compare/v10.3.1...v10.3.2) (2023-03-10)


### Bug Fixes

* **plugins:** omit launch paths when unused [LIBS-477] ([#791](https://github.com/dhis2/app-platform/issues/791)) ([e49a51f](https://github.com/dhis2/app-platform/commit/e49a51fec39a323350c71d4e09caff836aab2262))

## [10.3.1](https://github.com/dhis2/app-platform/compare/v10.3.0...v10.3.1) (2023-03-06)


### Bug Fixes

* error in non-pwa apps [LIBS-315] ([#789](https://github.com/dhis2/app-platform/issues/789)) ([590530e](https://github.com/dhis2/app-platform/commit/590530e74424c65f41c540b123faec902a594e75))

# [10.3.0](https://github.com/dhis2/app-platform/compare/v10.2.3...v10.3.0) (2023-03-03)


### Features

* **pwa:** track online status [LIBS-315] ([#718](https://github.com/dhis2/app-platform/issues/718)) ([1dfd1e6](https://github.com/dhis2/app-platform/commit/1dfd1e6249fa22412eb87ea8e693d908af835498))

## [10.2.3](https://github.com/dhis2/app-platform/compare/v10.2.2...v10.2.3) (2023-02-16)


### Bug Fixes

* **plugins:** fix file loader behavior ([#779](https://github.com/dhis2/app-platform/issues/779)) ([dcdd918](https://github.com/dhis2/app-platform/commit/dcdd9188f5a64c5ec842a347ed6aa5acc053cc58))

## [10.2.2](https://github.com/dhis2/app-platform/compare/v10.2.1...v10.2.2) (2023-02-16)


### Bug Fixes

* **cli:** fix `--testRegex` option on `test` command ([#784](https://github.com/dhis2/app-platform/issues/784)) ([049cdf3](https://github.com/dhis2/app-platform/commit/049cdf3610b28ada4b4241870ff8f2f5cc9f09fa))

## [10.2.1](https://github.com/dhis2/app-platform/compare/v10.2.0...v10.2.1) (2023-02-14)


### Bug Fixes

* bump d2-i18n ([#783](https://github.com/dhis2/app-platform/issues/783)) ([2acb301](https://github.com/dhis2/app-platform/commit/2acb301c812bd804f54dfa55ca82dc3629e5ac8c))

# [10.2.0](https://github.com/dhis2/app-platform/compare/v10.1.6...v10.2.0) (2022-11-30)


### Bug Fixes

* **cli:** improve plugin builds ([#749](https://github.com/dhis2/app-platform/issues/749)) ([b3b317c](https://github.com/dhis2/app-platform/commit/b3b317c781a9952b223236e33bf31c75088ae107))
* add missing webpack dependencies to cli package ([9e58c58](https://github.com/dhis2/app-platform/commit/9e58c58322e56f905abd473af9957f8b24119b95))
* **cli:** update webpack plugin options ([d084b44](https://github.com/dhis2/app-platform/commit/d084b441ee0dd8aecb2d563a0b1dc16275c11bcd))
* casing ([ff5aa6b](https://github.com/dhis2/app-platform/commit/ff5aa6bd1da8705811ec62f7e47537ba7c7f0822))
* handle webpack errors as described in https://webpack.js.org/api/node/\#error-handling ([c557534](https://github.com/dhis2/app-platform/commit/c557534f6ff18eb0990a6eaeb037b0d83bc1c87f))
* plugin placeholder ([1eea12c](https://github.com/dhis2/app-platform/commit/1eea12c825145480d4fbf2807d3078ef608f2325))


### Features

* **cli:** add pwa to plugins; fix plugin build details ([#746](https://github.com/dhis2/app-platform/issues/746)) ([fd920a4](https://github.com/dhis2/app-platform/commit/fd920a41d6d63e1bb4e4934d39e4aef96ead1e4d))
* include plugin launch path plugin.html in built manifests [LIBS-346] ([#745](https://github.com/dhis2/app-platform/issues/745)) ([8843f6b](https://github.com/dhis2/app-platform/commit/8843f6b6396f0f60ef5cb0c6d09cfe90360e976f))
* **adapter:** don't render headerbar for plugins ([4ac6d54](https://github.com/dhis2/app-platform/commit/4ac6d541b7369a580f2947ad3987cbfa980bb5ee))
* **cli:** add webpack config for JS and CSS ([a04b7c6](https://github.com/dhis2/app-platform/commit/a04b7c6c7bd82cbb1bfddbea0e9c0a28fee7ba75))
* **cli:** add webpack config for JS and CSS ([cec6339](https://github.com/dhis2/app-platform/commit/cec63391562ace95cfc1ce94019fd395fd0f8aa8))
* **cli:** create plugin entrypoint wrapper during compilation ([8e4dbff](https://github.com/dhis2/app-platform/commit/8e4dbfffdc923d9810d79f2faa739658f8ab768a))
* **cli:** enable split chunks optimisation in webpack config ([e8ebcbf](https://github.com/dhis2/app-platform/commit/e8ebcbf4a5be6249754c40f623e1b2561e3e77b6))
* **cli:** plugin start script ([9fea158](https://github.com/dhis2/app-platform/commit/9fea1583a2c9c869ed64e8b6ff2d92e324f25358))
* **cli:** setup css minimiser webpack plugin ([3f1b1f2](https://github.com/dhis2/app-platform/commit/3f1b1f25dfc3199227bac623616fae49362fff75))
* **cli:** setup define webpack plugin ([5d8f374](https://github.com/dhis2/app-platform/commit/5d8f3741bfd8c2b7257db2c5078bb5d5664af2f9))
* **cli:** setup htmlwebpackplugin ([202225c](https://github.com/dhis2/app-platform/commit/202225c9dc21a2fceb44c4fdf8e449455c9d3a0e))
* **cli:** setup ignore webpack plugin for moment.js ([223b191](https://github.com/dhis2/app-platform/commit/223b19146914cc4fad6c25070da3022d23ea159a))
* **cli:** setup terser webpack plugin ([2693258](https://github.com/dhis2/app-platform/commit/2693258485cbeec6edca59e60513c05010b785fe))
* webpack config for plugin ([3e4275c](https://github.com/dhis2/app-platform/commit/3e4275c9cf02b8d198ff075560f09b40ce865cea))
* **cli:** support plugin entrypoint when validating entrypoints ([04ece0a](https://github.com/dhis2/app-platform/commit/04ece0a034ff88eedd06268f5dc0469226600a50))

# [10.2.0-alpha.3](https://github.com/dhis2/app-platform/compare/v10.2.0-alpha.2...v10.2.0-alpha.3) (2022-11-30)


### Bug Fixes

* **deps:** bump platform deps and unpin ([bd2582f](https://github.com/dhis2/app-platform/commit/bd2582f3faa17e46142210c530584e79d4b5998a))
* **pwa:** only count clients in scope ([#760](https://github.com/dhis2/app-platform/issues/760)) ([41113c0](https://github.com/dhis2/app-platform/commit/41113c04f50f6677844f3248d65fcfdbc67a2b58))

## [10.1.6](https://github.com/dhis2/app-platform/compare/v10.1.5...v10.1.6) (2022-11-24)


### Bug Fixes

* **pwa:** only count clients in scope ([#760](https://github.com/dhis2/app-platform/issues/760)) ([41113c0](https://github.com/dhis2/app-platform/commit/41113c04f50f6677844f3248d65fcfdbc67a2b58))

## [10.1.5](https://github.com/dhis2/app-platform/compare/v10.1.4...v10.1.5) (2022-11-15)


### Bug Fixes

* **deps:** bump platform deps and unpin ([bd2582f](https://github.com/dhis2/app-platform/commit/bd2582f3faa17e46142210c530584e79d4b5998a))

## [10.1.4](https://github.com/dhis2/app-platform/compare/v10.1.3...v10.1.4) (2022-11-08)


### Bug Fixes

* **offline-interface:** protect against SW errors ([ad3e476](https://github.com/dhis2/app-platform/commit/ad3e476273823c1c4983c50ac0500e3b9eb19c30))
* **pwa-boundary:** catch errors ([ecd8b21](https://github.com/dhis2/app-platform/commit/ecd8b21dc34f1eee7497331cb254c459252d355d))

## [10.1.3](https://github.com/dhis2/app-platform/compare/v10.1.2...v10.1.3) (2022-10-26)


### Bug Fixes

* **deps:** bump app-runtime to 3.6.1 [LIBS-356] ([#763](https://github.com/dhis2/app-platform/issues/763)) ([190b9e7](https://github.com/dhis2/app-platform/commit/190b9e7a16220421d269410c6482a10c8ff2b6ea))

## [10.1.2](https://github.com/dhis2/app-platform/compare/v10.1.1...v10.1.2) (2022-10-24)


### Bug Fixes

* **pwa:** file SWR filter & allow navigation 403s [LIBS-356] [LIBS-357] ([#762](https://github.com/dhis2/app-platform/issues/762)) ([bbfd3eb](https://github.com/dhis2/app-platform/commit/bbfd3eb2172e81126af0f1515e575134e1c2d79e))

## [10.1.1](https://github.com/dhis2/app-platform/compare/v10.1.0...v10.1.1) (2022-10-21)


### Bug Fixes

* **deps:** update app-runtime and ui packages ([#761](https://github.com/dhis2/app-platform/issues/761)) ([f6406c5](https://github.com/dhis2/app-platform/commit/f6406c55be747793317021423e39bf98dc7f04bb))

# [10.1.0](https://github.com/dhis2/app-platform/compare/v10.0.1...v10.1.0) (2022-10-06)


### Features

* headerbar PWA update notifications [LIBS-344](https://dhis2.atlassian.net/browse/LIBS-344) ([#748](https://github.com/dhis2/app-platform/issues/748)) ([b245bf1](https://github.com/dhis2/app-platform/commit/b245bf199785bf2ba62843c74a9d29f6e62c0a06))
* display app and server debug information in headerbar profile menu [LIBS-176](https://dhis2.atlassian.net/browse/LIBS-176) ([#748](https://github.com/dhis2/app-platform/issues/748)) ([b245bf1](https://github.com/dhis2/app-platform/commit/b245bf199785bf2ba62843c74a9d29f6e62c0a06))

## [10.0.1](https://github.com/dhis2/app-platform/compare/v10.0.0...v10.0.1) (2022-09-29)


### Bug Fixes

* support author parsing in d2.config.js [LIBS-347] ([#747](https://github.com/dhis2/app-platform/issues/747)) ([e6838a7](https://github.com/dhis2/app-platform/commit/e6838a7b21000fa01265b8dfbb059d8ab53eb8db))

# [10.0.0](https://github.com/dhis2/app-platform/compare/v9.0.1...v10.0.0) (2022-07-26)


### Bug Fixes

* remove engines field from pwa and adapter ([c3878f2](https://github.com/dhis2/app-platform/commit/c3878f2955352667f9a1ca9c428d8ed0ff77c777))
* remove lint step from publish step requirements ([#695](https://github.com/dhis2/app-platform/issues/695)) ([a04f8f7](https://github.com/dhis2/app-platform/commit/a04f8f715023fdcb568990fe478f19fb11e54fde))


### chore

* drop support for node 12 ([937e5e2](https://github.com/dhis2/app-platform/commit/937e5e2e3dac30af529594d03872b0ae53353882))


### Features

* update react-scripts ([#721](https://github.com/dhis2/app-platform/issues/721)) ([dc1c5cb](https://github.com/dhis2/app-platform/commit/dc1c5cb3ab0efb7bb074dd6fb581bf865bdb980e))


### BREAKING CHANGES

* dropped support for node 12. The platform now requires node 14+.

# [10.0.0-beta.2](https://github.com/dhis2/app-platform/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2022-07-26)


### Bug Fixes

* remove engines field from pwa and adapter ([c3878f2](https://github.com/dhis2/app-platform/commit/c3878f2955352667f9a1ca9c428d8ed0ff77c777))

# [10.0.0-beta.1](https://github.com/dhis2/app-platform/compare/v9.1.0-beta.1...v10.0.0-beta.1) (2022-07-25)


### chore

* drop support for node 12 ([937e5e2](https://github.com/dhis2/app-platform/commit/937e5e2e3dac30af529594d03872b0ae53353882))


### BREAKING CHANGES

* dropped support for node 12. The platform now requires node 14+.

# [9.1.0-beta.1](https://github.com/dhis2/app-platform/compare/v9.0.2-beta.1...v9.1.0-beta.1) (2022-06-21)


### Features

* update react-scripts ([#721](https://github.com/dhis2/app-platform/issues/721)) ([dc1c5cb](https://github.com/dhis2/app-platform/commit/dc1c5cb3ab0efb7bb074dd6fb581bf865bdb980e))

## [9.0.2-beta.1](https://github.com/dhis2/app-platform/compare/v9.0.1...v9.0.2-beta.1) (2022-06-21)


### Bug Fixes

* remove lint step from publish step requirements ([#695](https://github.com/dhis2/app-platform/issues/695)) ([a04f8f7](https://github.com/dhis2/app-platform/commit/a04f8f715023fdcb568990fe478f19fb11e54fde))

## [9.0.1](https://github.com/dhis2/app-platform/compare/v9.0.0...v9.0.1) (2022-06-08)


### Bug Fixes

* **proxy:** ignore nulls in transformJsonResponse ([#719](https://github.com/dhis2/app-platform/issues/719)) ([b72dd79](https://github.com/dhis2/app-platform/commit/b72dd7908090f0d7b321d40e42a7f65a17c91438))

# [9.0.0](https://github.com/dhis2/app-platform/compare/v8.3.3...v9.0.0) (2022-03-14)


### chore

* **app shell:** update @dhis2/ui to ^8 ([c16f3b1](https://github.com/dhis2/app-platform/commit/c16f3b170e3138e0a0109c342eeed5d000eece0d))


### BREAKING CHANGES

* **app shell:** To prevent issues with multiple ui versions, we bump
the major version of the app-platform libraries as well

## [8.3.3](https://github.com/dhis2/app-platform/compare/v8.3.2...v8.3.3) (2022-02-22)


### Bug Fixes

* **deps:** bump axios from 0.20.0 to 0.25.0 ([#698](https://github.com/dhis2/app-platform/issues/698)) ([77853c4](https://github.com/dhis2/app-platform/commit/77853c47a543f4a3147bdb167612b4efc30afcff))

## [8.3.2](https://github.com/dhis2/app-platform/compare/v8.3.1...v8.3.2) (2021-12-07)


### Bug Fixes

* **cli-38:** catch all unhandled rejections ([3f9f371](https://github.com/dhis2/app-platform/commit/3f9f3713cac570a5d8fd3c84e0c8660a414ba066))
* **cli-38:** catch syntax errors and recover ([5f9c5bb](https://github.com/dhis2/app-platform/commit/5f9c5bba1a14a941af17a241624088489c8c5f77))

## [8.3.1](https://github.com/dhis2/app-platform/compare/v8.3.0...v8.3.1) (2021-11-22)


### Bug Fixes

* **app-icon:** replace with placeholder icon ([e97fe45](https://github.com/dhis2/app-platform/commit/e97fe455f18c36f30cee6e371b531ad3c618a904))

# [8.3.0](https://github.com/dhis2/app-platform/compare/v8.2.3...v8.3.0) (2021-10-19)


### Features

* **pwa:** add request filtering for recorded sections ([#682](https://github.com/dhis2/app-platform/issues/682)) ([b40516e](https://github.com/dhis2/app-platform/commit/b40516e3986257c29600b8598e7e2a49706b43a7))

## [8.2.3](https://github.com/dhis2/app-platform/compare/v8.2.2...v8.2.3) (2021-10-14)


### Bug Fixes

* **cli:** run yarn install after fixing yarn.lock by deduplicating ([#676](https://github.com/dhis2/app-platform/issues/676)) ([a32f969](https://github.com/dhis2/app-platform/commit/a32f9697d2ac6acecd58a7647d121f8659e14499))
* **cli:** wrap App component in CustomDataProvider in boilerplate test ([#678](https://github.com/dhis2/app-platform/issues/678)) ([88be6eb](https://github.com/dhis2/app-platform/commit/88be6eb58b7ed340801523518488e0ddfe656c01))
* **pwa:** update gracefully despite missing clients info ([#679](https://github.com/dhis2/app-platform/issues/679)) ([c7fe509](https://github.com/dhis2/app-platform/commit/c7fe5093e89a45dbb06d44d245e5d08936396180))

## [8.2.2](https://github.com/dhis2/app-platform/compare/v8.2.1...v8.2.2) (2021-10-11)


### Bug Fixes

* **pwa:** improve SW update UX ([79b5285](https://github.com/dhis2/app-platform/commit/79b5285619c0e49bc39eebe104c7c5aedadb8783))

## [8.2.1](https://github.com/dhis2/app-platform/compare/v8.2.0...v8.2.1) (2021-10-08)


### Bug Fixes

* **shell:** wrap app in CustomDataProvider in App test ([#677](https://github.com/dhis2/app-platform/issues/677)) ([3325605](https://github.com/dhis2/app-platform/commit/332560595d58fc49c3a06e0100029a21738a2cd3))

# [8.2.0](https://github.com/dhis2/app-platform/compare/v8.1.2...v8.2.0) (2021-10-07)


### Features

* **cli:** validate yarn.lock in 'start' and 'build' commands and add 'deduplicate' command ([#668](https://github.com/dhis2/app-platform/issues/668)) ([8a8aa4d](https://github.com/dhis2/app-platform/commit/8a8aa4d451cec58660eaba876d7f16b3d634ce46))

## [8.1.2](https://github.com/dhis2/app-platform/compare/v8.1.1...v8.1.2) (2021-10-04)


### Bug Fixes

* **service-worker:** change routing to allow redirect to login page ([#669](https://github.com/dhis2/app-platform/issues/669)) ([97c84d4](https://github.com/dhis2/app-platform/commit/97c84d42ba9a07fce28435a3db94027e8e6650d7))

## [8.1.1](https://github.com/dhis2/app-platform/compare/v8.1.0...v8.1.1) (2021-09-28)


### Bug Fixes

* **offline-interface:** improve SW update message & actions ([9caedba](https://github.com/dhis2/app-platform/commit/9caedbaf566815c85aa55448bb31c4251d7474de))

# [8.1.0](https://github.com/dhis2/app-platform/compare/v8.0.1...v8.1.0) (2021-09-23)


### Features

* **adapter:** clear sensitive caches on user-change ([398cde2](https://github.com/dhis2/app-platform/commit/398cde20a6c603e5741bcb8f7d5d2d97c217c987))

## [8.0.1](https://github.com/dhis2/app-platform/compare/v8.0.0...v8.0.1) (2021-09-20)


### Bug Fixes

* **deps:** allow range for app shell's ui dependency ([17f0546](https://github.com/dhis2/app-platform/commit/17f05466baeac4d53cec96f66684cea56efed826))

# [8.0.0](https://github.com/dhis2/app-platform/compare/v7.6.6...v8.0.0) (2021-09-20)


### Bug Fixes

* **alerts-service:** add tests and align implementation ([dabe477](https://github.com/dhis2/app-platform/commit/dabe47771a3b79730d0dd42e106ed495908cae83))
* **cli:** set test environment to node ([#625](https://github.com/dhis2/app-platform/issues/625)) ([36d311b](https://github.com/dhis2/app-platform/commit/36d311b4aca74535d551d300a509117a1cb95179))
* **dependencies:** update app-runtime to v3 ([8777699](https://github.com/dhis2/app-platform/commit/8777699b5e11684a943c0db84fa01c3989dd83c9))
* set jsdom as default test environment ([#624](https://github.com/dhis2/app-platform/issues/624)) ([2f1ba42](https://github.com/dhis2/app-platform/commit/2f1ba4228a7a9a6f95a44258e615ba73461537bc))


### chore

* **deps:** upgrade to 7.0.0 of @dhis2/ui ([b624c9e](https://github.com/dhis2/app-platform/commit/b624c9e732a639ee457b90f8264e0fdb21d0dee0))
* **deps:** upgrade to styled-jsx 4.x ([8cf9e17](https://github.com/dhis2/app-platform/commit/8cf9e17c123e55b44a5b68bef0d4af7283622928))


### Features

* **app-adapter:** align Alerts component with alerts-service and AlertBar ([bd4564c](https://github.com/dhis2/app-platform/commit/bd4564c75667b703cabf1b680d97ff8a200f6533))
* **cli:** instance proxy server ([#635](https://github.com/dhis2/app-platform/issues/635)) ([9df387e](https://github.com/dhis2/app-platform/commit/9df387e4e376bcf902e51348649e22e5948e5974))
* bump jest to v27 ([f5015b2](https://github.com/dhis2/app-platform/commit/f5015b2186978a08a2315474de9317423fde9b90))


### BREAKING CHANGES

* **deps:** @dhis2/ui 7.x has dropped support for the deprecated
entrypoints @dhis2/ui-core and @dhis2/ui-widgets.
Please use @dhis2/ui to import components you need in your app.
Everything from core and widgets is available.
* **deps:** Upgrade to styled-jsx 4 requires that the application
uses a compatible version of @dhis2/ui.
* **dependencies:** This updates the app-platform to version 3 of the
app-runtime. That means that this version of the app-platform will only
work with apps that use version 3 of the app-runtime.
* Upgrade Jest to 27.x.
Please see for a list of changes: https://jestjs.io/blog/2021/05/25/jest-27

# [8.0.0-beta.10](https://github.com/dhis2/app-platform/compare/v8.0.0-beta.9...v8.0.0-beta.10) (2021-09-15)


### chore

* **deps:** upgrade to 7.0.0 of @dhis2/ui ([b624c9e](https://github.com/dhis2/app-platform/commit/b624c9e732a639ee457b90f8264e0fdb21d0dee0))


### BREAKING CHANGES

* **deps:** @dhis2/ui 7.x has dropped support for the deprecated
entrypoints @dhis2/ui-core and @dhis2/ui-widgets.
Please use @dhis2/ui to import components you need in your app.
Everything from core and widgets is available.

# [8.0.0-beta.9](https://github.com/dhis2/app-platform/compare/v8.0.0-beta.8...v8.0.0-beta.9) (2021-09-15)


### Bug Fixes

* **sw-registration:** reregister SW after hard reload ([4c86468](https://github.com/dhis2/app-platform/commit/4c8646871b00211f41e3b9ad09ae70c40338b4fd))

## [7.6.6](https://github.com/dhis2/app-platform/compare/v7.6.5...v7.6.6) (2021-09-15)


### Bug Fixes

* **sw-registration:** reregister SW after hard reload ([4c86468](https://github.com/dhis2/app-platform/commit/4c8646871b00211f41e3b9ad09ae70c40338b4fd))

## [7.6.5](https://github.com/dhis2/app-platform/compare/v7.6.4...v7.6.5) (2021-09-14)


### Bug Fixes

* add crossorgin use-credentials to manifest.json link ([57483f5](https://github.com/dhis2/app-platform/commit/57483f50d5e61c5a1e081bbec9cd9833fb0cf4d2))

## [7.6.4](https://github.com/dhis2/app-platform/compare/v7.6.3...v7.6.4) (2021-09-08)


### Bug Fixes

* **recording-mode:** handle fulfilled requests after recording error ([#642](https://github.com/dhis2/app-platform/issues/642)) ([928e2cb](https://github.com/dhis2/app-platform/commit/928e2cb4882bf8a79d4f560cc89487d36235cd50))

## [7.6.3](https://github.com/dhis2/app-platform/compare/v7.6.2...v7.6.3) (2021-09-07)


### Bug Fixes

* **offline-interface:** prevent infinite update loop in Chrome ([#638](https://github.com/dhis2/app-platform/issues/638)) ([079f6ea](https://github.com/dhis2/app-platform/commit/079f6ea382fa4fd29ee72a9cd526a282f591837b))

## [7.6.2](https://github.com/dhis2/app-platform/compare/v7.6.1...v7.6.2) (2021-09-02)


### Bug Fixes

* import index.css in index.js so styles are applied ([8db1bf8](https://github.com/dhis2/app-platform/commit/8db1bf8f234e808a5299474df3f1dc6998feac44))

## [7.6.1](https://github.com/dhis2/app-platform/compare/v7.6.0...v7.6.1) (2021-09-02)


### Bug Fixes

* **shell:** create new stacking context for roots ([324a095](https://github.com/dhis2/app-platform/commit/324a0958ae436e75cb1b252263dfafbd1447097f))

# [7.6.0](https://github.com/dhis2/app-platform/compare/v7.5.1...v7.6.0) (2021-08-31)


### Bug Fixes

* catch errors in completeRecording ([e67ae82](https://github.com/dhis2/app-platform/commit/e67ae821b33990435f3846f3ce933362105520bb))
* check whole URL against filter patterns ([5468114](https://github.com/dhis2/app-platform/commit/5468114e8631610d4e70f6c54a288a62cc7f28c2))
* only return sections with cached data from getCachedSections ([f6242d1](https://github.com/dhis2/app-platform/commit/f6242d1b6b25268f3a0c441060264d584d023afe))
* reopen indexedDB if global state resets ([0aded68](https://github.com/dhis2/app-platform/commit/0aded6846b1f9abc567e44144006cb516516e8b3))
* return true if either cache or idb entry is removed ([43d8001](https://github.com/dhis2/app-platform/commit/43d8001ab2aa6077bb0dc3fbaecb2228399a26e4))
* simplify message payload to be compatible with firefox ([5e5a633](https://github.com/dhis2/app-platform/commit/5e5a633440e1b103669dae3d0b1e8786cde9f96b))


### Features

* add service worker and pwa capabilities ([#550](https://github.com/dhis2/app-platform/issues/550)) ([225069e](https://github.com/dhis2/app-platform/commit/225069e11d924734c5ac2e257af7d5e9185c612a)), closes [#580](https://github.com/dhis2/app-platform/issues/580) [#582](https://github.com/dhis2/app-platform/issues/582) [#592](https://github.com/dhis2/app-platform/issues/592)
* allow RegEx for filter patterns in d2.config.js ([9699330](https://github.com/dhis2/app-platform/commit/96993301f1d3ba4eec719bd2ecf93b72995653ba))
* use new headerbar with online status indicator ([#626](https://github.com/dhis2/app-platform/issues/626)) ([3bd7d37](https://github.com/dhis2/app-platform/commit/3bd7d37d0776dfd44ab583a95ad47734c1302f84))

## [7.5.1](https://github.com/dhis2/app-platform/compare/v7.5.0...v7.5.1) (2021-08-25)


### Reverts

* "feat: bump jest to v27 ([#616](https://github.com/dhis2/app-platform/issues/616))" ([7733d14](https://github.com/dhis2/app-platform/commit/7733d14f48b99d1fe9d117abd0b4b823d9f55cd5))

# [7.5.0](https://github.com/dhis2/app-platform/compare/v7.4.0...v7.5.0) (2021-08-25)


### Features

* bump jest to v27 ([#616](https://github.com/dhis2/app-platform/issues/616)) ([618fd27](https://github.com/dhis2/app-platform/commit/618fd27ea9d66bc762a83a4e8248862efbf5f49b))

# [7.4.0](https://github.com/dhis2/app-platform/compare/v7.3.0...v7.4.0) (2021-08-24)


### Features

* **portal-root:** add root element for react portals ([5bd8566](https://github.com/dhis2/app-platform/commit/5bd856668c61af1ce8b5509fb059478402dc26c1))

# [7.3.0](https://github.com/dhis2/app-platform/compare/v7.2.1...v7.3.0) (2021-08-12)


### Features

* **cli:** add jestConfig option to test script ([#605](https://github.com/dhis2/app-platform/issues/605)) ([57d6407](https://github.com/dhis2/app-platform/commit/57d6407996711a445629be497dbe7b47728101a7))

## [7.2.1](https://github.com/dhis2/app-platform/compare/v7.2.0...v7.2.1) (2021-07-27)


### Bug Fixes

* **cli:** Support multiple library entrypoints ([#597](https://github.com/dhis2/app-platform/issues/597)) ([a95be81](https://github.com/dhis2/app-platform/commit/a95be817a669901a082621be88e37e516dcd6bf3))

# [7.2.0](https://github.com/dhis2/app-platform/compare/v7.1.2...v7.2.0) (2021-07-23)


### Bug Fixes

* add flags to specify name and version for non-platform apps ([a24e0e6](https://github.com/dhis2/app-platform/commit/a24e0e6bcdd2f55ef4162ccfa5d65a831802cae6))
* correctly parse base config, simplify logic, only rm dir on build ([9891ea3](https://github.com/dhis2/app-platform/commit/9891ea32431b9e452f8aa4cd6f3f4ee29798e057))
* don't throw if d2.config.js doesn't exist ([3385e0e](https://github.com/dhis2/app-platform/commit/3385e0e3682379b2d1ad8b03332f2fb7fcbbecdf))
* **fs:** re-read package.json from disk to make sure it is not stale ([918d113](https://github.com/dhis2/app-platform/commit/918d1137297455cbf4506f9a65bc7fda7d659bad))
* **pack:** use the built app config ([e22d186](https://github.com/dhis2/app-platform/commit/e22d1865ace1d8170dded7191511a7496f1f9051))
* **publish:** only prompt in CI mode ([6872ca0](https://github.com/dhis2/app-platform/commit/6872ca0887fbe1f33180f2dfd4b7c07b4b47746f))
* **publish:** pack when file param is unused ([cc4c802](https://github.com/dhis2/app-platform/commit/cc4c8027db7d14473f1961fb0967dc8ea79eb5a1))


### Features

* add option to skip packing when running build ([669ab94](https://github.com/dhis2/app-platform/commit/669ab9400a3dfda0b8b5e1c740b7646209f85112))
* **pack:** adds pack command ([be700f1](https://github.com/dhis2/app-platform/commit/be700f16197491ee6d1aeb4a5afbd843e991d8ed))
* **publish:** expose publish command module ([ff55d5a](https://github.com/dhis2/app-platform/commit/ff55d5a69a99de27a0df97853164c5e5b43e6268))

## [7.1.2](https://github.com/dhis2/app-platform/compare/v7.1.1...v7.1.2) (2021-07-13)


### Bug Fixes

* allow command-line configuration of deploy and publish upload timeouts ([#588](https://github.com/dhis2/app-platform/issues/588)) ([e60da18](https://github.com/dhis2/app-platform/commit/e60da180402d346d9ce8e7606059723ab8b41f40))

## [7.1.1](https://github.com/dhis2/app-platform/compare/v7.1.0...v7.1.1) (2021-07-08)


### Bug Fixes

* never render HeaderBar without runtime provider ([#587](https://github.com/dhis2/app-platform/issues/587)) ([65c7766](https://github.com/dhis2/app-platform/commit/65c776642353a5c9396a71a1b8b1e3422d16d7d9))

# [7.1.0](https://github.com/dhis2/app-platform/compare/v7.0.2...v7.1.0) (2021-07-02)


### Features

* **shell:** add killswitch service worker ([#583](https://github.com/dhis2/app-platform/issues/583)) ([1ba1c1e](https://github.com/dhis2/app-platform/commit/1ba1c1e1d320d2d5d3a5edb16cd08ad0a70d8b60))

## [7.0.2](https://github.com/dhis2/app-platform/compare/v7.0.1...v7.0.2) (2021-07-02)


### Bug Fixes

* **cli:** bump @babel/preset-env ([8ebb78d](https://github.com/dhis2/app-platform/commit/8ebb78d8842aab40b9fbfe01105398ce0dce4ded))

## [7.0.1](https://github.com/dhis2/app-platform/compare/v7.0.0...v7.0.1) (2021-06-30)


### Bug Fixes

* rename 'update' test command handler parameter to 'updateSnapshot' ([#577](https://github.com/dhis2/app-platform/issues/577)) ([34787ad](https://github.com/dhis2/app-platform/commit/34787ad5448454bbfac6672b2b67516d131d753c))

# [7.0.0](https://github.com/dhis2/app-platform/compare/v6.2.0...v7.0.0) (2021-06-14)


### chore

* remove node 10 support ([5900a39](https://github.com/dhis2/app-platform/commit/5900a39ba6e03eae00f7f311a327f9ec47d5c999))
* remove node 10 support ([#567](https://github.com/dhis2/app-platform/issues/567)) ([cbee9cb](https://github.com/dhis2/app-platform/commit/cbee9cbac91dfc9b1f600590936c6605c96315d4))


### BREAKING CHANGES

* New minimum version for NodeJS is 12.x.

* chore(deps): update cli deps to latest major
* New minimum version for NodeJS is 12.x.

# [6.2.0](https://github.com/dhis2/app-platform/compare/v6.1.3...v6.2.0) (2021-05-28)


### Features

* **publish:** upload apps to App Hub ([#532](https://github.com/dhis2/app-platform/issues/532)) ([b8c86b6](https://github.com/dhis2/app-platform/commit/b8c86b6ee6afcd5b68c8110bb4521707b34c661f))

## [6.1.3](https://github.com/dhis2/app-platform/compare/v6.1.2...v6.1.3) (2021-05-20)


### Bug Fixes

* add file extension to default entrypoints in d2.config ([#561](https://github.com/dhis2/app-platform/issues/561)) ([6cb8543](https://github.com/dhis2/app-platform/commit/6cb8543f20154b4e9dc3c564c479ff3e66237984))

## [6.1.2](https://github.com/dhis2/app-platform/compare/v6.1.1...v6.1.2) (2021-05-11)


### Bug Fixes

* set default value for all strings to support plurals ([#552](https://github.com/dhis2/app-platform/issues/552)) ([3846fc0](https://github.com/dhis2/app-platform/commit/3846fc0ea5f920f4113b929d48b63ce298d3252d))

## [6.1.1](https://github.com/dhis2/app-platform/compare/v6.1.0...v6.1.1) (2021-04-27)


### Bug Fixes

* respect --cwd argument when generating/extracting translations ([#540](https://github.com/dhis2/app-platform/issues/540)) ([280e02c](https://github.com/dhis2/app-platform/commit/280e02ca445b5b54e86b7a1dbe965c7ad6ce7abc))

# [6.1.0](https://github.com/dhis2/app-platform/compare/v6.0.1...v6.1.0) (2021-04-02)


### Features

* support custom authorities and reserved namespace [LIBS-165] ([#547](https://github.com/dhis2/app-platform/issues/547)) ([fc86a55](https://github.com/dhis2/app-platform/commit/fc86a559b259fdae8cff50558f477fbe966cc6fa))

## [6.0.1](https://github.com/dhis2/app-platform/compare/v6.0.0...v6.0.1) (2021-03-24)


### Bug Fixes

* catch service worker unregistration rejection ([#537](https://github.com/dhis2/app-platform/issues/537)) ([e1cbf3e](https://github.com/dhis2/app-platform/commit/e1cbf3e9d1c0970e62fb14fc6b6f61713e9c76e0))

# [6.0.0](https://github.com/dhis2/app-platform/compare/v5.7.4...v6.0.0) (2021-03-11)


### Features

* upgrade to @dhis2/ui v6 and bump other dependency versions ([#530](https://github.com/dhis2/app-platform/issues/530)) ([b8b72f4](https://github.com/dhis2/app-platform/commit/b8b72f4094bbed730c980aacabd530f8b6539ab1))


### BREAKING CHANGES

* applications must use @dhis2/ui@^6.5.3

## [5.7.4](https://github.com/dhis2/app-platform/compare/v5.7.3...v5.7.4) (2021-03-05)


### Bug Fixes

* show login modal before locale is loaded ([#527](https://github.com/dhis2/app-platform/issues/527)) ([98a7a56](https://github.com/dhis2/app-platform/commit/98a7a567d0732a421df19a97faa03f40192b678b))

## [5.7.3](https://github.com/dhis2/app-platform/compare/v5.7.2...v5.7.3) (2021-03-02)


### Bug Fixes

* don't render application until we are sure the locale is initialized ([#525](https://github.com/dhis2/app-platform/issues/525)) ([4329e8e](https://github.com/dhis2/app-platform/commit/4329e8e37ab4155038b0145bcb0c4bbbc8cc9312))

## [5.7.2](https://github.com/dhis2/app-platform/compare/v5.7.1...v5.7.2) (2021-02-26)


### Bug Fixes

* allow for nested entry-points under src ([#519](https://github.com/dhis2/app-platform/issues/519)) ([3ae34b3](https://github.com/dhis2/app-platform/commit/3ae34b3febdcecf77e03963639c3a78d5832db0f))

## [5.7.1](https://github.com/dhis2/app-platform/compare/v5.7.0...v5.7.1) (2021-02-25)


### Bug Fixes

* convert jsx, ts, and tsx files to js on build ([#517](https://github.com/dhis2/app-platform/issues/517)) ([5af8a58](https://github.com/dhis2/app-platform/commit/5af8a589ae8667276fbd7950182bce2826cd74a6))

# [5.7.0](https://github.com/dhis2/app-platform/compare/v5.6.0...v5.7.0) (2021-02-23)


### Features

* add support for generating manifest app_hub_id from d2.config id ([#515](https://github.com/dhis2/app-platform/issues/515)) ([f0478b0](https://github.com/dhis2/app-platform/commit/f0478b0d9a124fbaed4ca932af6aa0d988343d66))

# [5.6.0](https://github.com/dhis2/app-platform/compare/v5.5.3...v5.6.0) (2021-02-20)


### Features

* build unbundled libraries, validate package when building (LIBS-125) ([#492](https://github.com/dhis2/app-platform/issues/492)) ([4fb3fae](https://github.com/dhis2/app-platform/commit/4fb3faeb3a1fe6f167f06b31fa596efcdd1df8e0))

## [5.5.3](https://github.com/dhis2/app-platform/compare/v5.5.2...v5.5.3) (2021-02-19)


### Bug Fixes

* namespace code-split moment locale chunks to separate them from app chunks ([#507](https://github.com/dhis2/app-platform/issues/507)) ([cecb3c2](https://github.com/dhis2/app-platform/commit/cecb3c2fd64f745200b493029abf639d5e1dfb96))

## [5.5.2](https://github.com/dhis2/app-platform/compare/v5.5.1...v5.5.2) (2021-02-18)


### Bug Fixes

* pin styled-jsx@3.3.2 to avoid styled-jsx/babel bug ([#502](https://github.com/dhis2/app-platform/issues/502)) ([123c9aa](https://github.com/dhis2/app-platform/commit/123c9aa1876ca34f2cac6c87535fb72643bccf4c))

## [5.5.1](https://github.com/dhis2/app-platform/compare/v5.5.0...v5.5.1) (2021-01-13)


### Bug Fixes

* isolate eslint shell and app environments ([#499](https://github.com/dhis2/app-platform/issues/499)) ([1933eca](https://github.com/dhis2/app-platform/commit/1933eca6dc9235c757e54e891b4dc0a649e146a4))

# [5.5.0](https://github.com/dhis2/app-platform/compare/v5.4.2...v5.5.0) (2020-11-16)


### Features

* introduce alerts component to show alerts as alert-bars in a stack ([#486](https://github.com/dhis2/app-platform/issues/486)) ([fd22504](https://github.com/dhis2/app-platform/commit/fd22504c2528fd1bab2034d019b480e1c290f063))

## [5.4.2](https://github.com/dhis2/app-platform/compare/v5.4.1...v5.4.2) (2020-11-11)


### Bug Fixes

* cut release to finish jira migration ([5aefe85](https://github.com/dhis2/app-platform/commit/5aefe85251b7902a128af0e905ec648868a701ef))

## [5.4.1](https://github.com/dhis2/app-platform/compare/v5.4.0...v5.4.1) (2020-10-30)


### Bug Fixes

* update react-scripts and cli-style at same time to use eslint 7 ([#475](https://github.com/dhis2/app-platform/issues/475)) ([8fd9225](https://github.com/dhis2/app-platform/commit/8fd9225624ab02565ea72a3f9a1170a1bb4655ba))

# [5.4.0](https://github.com/dhis2/app-platform/compare/v5.3.0...v5.4.0) (2020-10-19)


### Features

* generate d2.config.json from d2.config.js ([#471](https://github.com/dhis2/app-platform/issues/471)) ([2046074](https://github.com/dhis2/app-platform/commit/20460744dd6427097bad2350342a6fcba7d68377))

# [5.3.0](https://github.com/dhis2/app-platform/compare/v5.2.2...v5.3.0) (2020-10-12)


### Features

* detect server version, use latest available api version ([#470](https://github.com/dhis2/app-platform/issues/470)) ([ef92456](https://github.com/dhis2/app-platform/commit/ef924565d30b242a818cc54b203d2a2d11e842bc))

## [5.2.2](https://github.com/dhis2/app-platform/compare/v5.2.1...v5.2.2) (2020-10-07)


### Bug Fixes

* adjust formatting in locales.hbs so it matches ESLint rules ([#466](https://github.com/dhis2/app-platform/issues/466)) ([658fa0b](https://github.com/dhis2/app-platform/commit/658fa0b72b13d46afefdeda1f73254a3390daa52))
* encode username and password when posting to server in AuthBoundary ([#467](https://github.com/dhis2/app-platform/issues/467)) ([b0cc51d](https://github.com/dhis2/app-platform/commit/b0cc51d0351b5c1e787b28cb963eab9a08238298))

## [5.2.1](https://github.com/dhis2/app-platform/compare/v5.2.0...v5.2.1) (2020-09-23)


### Bug Fixes

* add deploy script to package.json when initializing ([#463](https://github.com/dhis2/app-platform/issues/463)) ([11b310e](https://github.com/dhis2/app-platform/commit/11b310e6a1efcdb54173c609348c39ff7d283c63))

# [5.2.0](https://github.com/dhis2/app-platform/compare/v5.1.0...v5.2.0) (2020-09-09)


### Bug Fixes

* base url should be overridden with env var if present ([#459](https://github.com/dhis2/app-platform/issues/459)) ([8768a1f](https://github.com/dhis2/app-platform/commit/8768a1f096355e33fab13e6fd8026b267ecba502))


### Features

* add core_app flag to app manifest ([#457](https://github.com/dhis2/app-platform/issues/457)) ([d32c0a1](https://github.com/dhis2/app-platform/commit/d32c0a1e19f6cc87a5b5ca471d01ca7ec57f8b5a))

# [5.1.0](https://github.com/dhis2/app-platform/compare/v5.0.0...v5.1.0) (2020-09-02)


### Features

* add d2-app-scripts deploy command ([#451](https://github.com/dhis2/app-platform/issues/451)) ([655a053](https://github.com/dhis2/app-platform/commit/655a053cb24f8a12ef3e89cafdb492f1e14c2de5))

# [5.0.0](https://github.com/dhis2/app-platform/compare/v4.0.9...v5.0.0) (2020-08-14)


### Features

* Require @dhis2/ui v5 ([#439](https://github.com/dhis2/app-platform/issues/439)) ([e600807](https://github.com/dhis2/app-platform/commit/e600807561a13abcc6ae58bb447625b3242e9d14))


### BREAKING CHANGES

* require @dhis2/ui v5 - components should now be imported from @dhis2/ui and various components have had breaking changes in v5

## [4.0.9](https://github.com/dhis2/app-platform/compare/v4.0.8...v4.0.9) (2020-06-22)


### Bug Fixes

* **dependency:** update babel-preset-env ([#421](https://github.com/dhis2/app-platform/issues/421)) ([09bcde7](https://github.com/dhis2/app-platform/commit/09bcde71b1258f0ee010a6b3dcec0df7ca323584))

## [4.0.8](https://github.com/dhis2/app-platform/compare/v4.0.7...v4.0.8) (2020-06-10)


### Bug Fixes

* **cli:** let init produce app using css-modules instead of styled-jsx ([#417](https://github.com/dhis2/app-platform/issues/417)) ([0c8c314](https://github.com/dhis2/app-platform/commit/0c8c3144cf1f6f9f6df520ca81b87a3050c039ca))

## [4.0.7](https://github.com/dhis2/app-platform/compare/v4.0.6...v4.0.7) (2020-05-20)


### Bug Fixes

* add login form data-test props ([#405](https://github.com/dhis2/app-platform/issues/405)) ([9a63548](https://github.com/dhis2/app-platform/commit/9a63548dfff57f649606c571d4ecd7107b587a5c))

## [4.0.6](https://github.com/dhis2/app-platform/compare/v4.0.5...v4.0.6) (2020-05-19)


### Bug Fixes

* fix erroneous call to reporter.debugError ([#404](https://github.com/dhis2/app-platform/issues/404)) ([0b1840a](https://github.com/dhis2/app-platform/commit/0b1840a68564372d1cd912f2b8647cc62cdec672))

## [4.0.5](https://github.com/dhis2/app-platform/compare/v4.0.4...v4.0.5) (2020-05-19)


### Bug Fixes

* upgrade ui-widgets to 2.1.1 for proper translations ([#402](https://github.com/dhis2/app-platform/issues/402)) ([46c5ecf](https://github.com/dhis2/app-platform/commit/46c5ecfd6a1a122d0c1e0d1114a8561728b54b66))

## [4.0.4](https://github.com/dhis2/app-platform/compare/v4.0.3...v4.0.4) (2020-05-06)


### Bug Fixes

* upgrade dependencies ([c64623e](https://github.com/dhis2/app-platform/commit/c64623e56dbe34e1f03e7cdba9e87a74005ec8dd))

## [4.0.3](https://github.com/dhis2/app-platform/compare/v4.0.2...v4.0.3) (2020-05-01)


### Bug Fixes

* keep default values that may have been set ([#382](https://github.com/dhis2/app-platform/issues/382)) ([4b6e275](https://github.com/dhis2/app-platform/commit/4b6e275969713014a9958cef0be256a00f16ef9a))

## [4.0.2](https://github.com/dhis2/app-platform/compare/v4.0.1...v4.0.2) (2020-04-24)


### Bug Fixes

* support typescript source files in library builds ([#368](https://github.com/dhis2/app-platform/issues/368)) ([3ee69de](https://github.com/dhis2/app-platform/commit/3ee69de63c0dad443e5f01b68cfdc49d45dc5dcd))

## [4.0.1](https://github.com/dhis2/app-platform/compare/v4.0.0...v4.0.1) (2020-04-17)


### Bug Fixes

* correctly detect changes in i18n string extraction ([#363](https://github.com/dhis2/app-platform/issues/363)) ([49a2d9a](https://github.com/dhis2/app-platform/commit/49a2d9ac93625a1dec1a413039525de3d7de88d9))

# [4.0.0](https://github.com/dhis2/app-platform/compare/v3.2.9...v4.0.0) (2020-04-02)


### chore

* update node engine to >= 10 ([#346](https://github.com/dhis2/app-platform/issues/346)) ([d29c11e](https://github.com/dhis2/app-platform/commit/d29c11e264d2bac58ce01d64715d877f0e388a0c))


### BREAKING CHANGES

* Require Node version 10 or above.

* ci(actions): give checkout action our custom pat

## [3.2.9](https://github.com/dhis2/app-platform/compare/v3.2.8...v3.2.9) (2020-03-26)


### Bug Fixes

* **init:** add a default README.md file ([#335](https://github.com/dhis2/app-platform/issues/335)) ([49b85ec](https://github.com/dhis2/app-platform/commit/49b85ecec086da9d6cbe6274fa3a62eb8f3474b1))

## [3.2.8](https://github.com/dhis2/app-platform/compare/v3.2.7...v3.2.8) (2020-03-25)


### Bug Fixes

* don't generate styled-jsx randomized classes in jest snapshots ([#332](https://github.com/dhis2/app-platform/issues/332)) ([eaafbab](https://github.com/dhis2/app-platform/commit/eaafbab1f320616fb3747da4340705f4905b210d))

## [3.2.7](https://github.com/dhis2/app-platform/compare/v3.2.6...v3.2.7) (2020-03-21)


### Bug Fixes

* allow usernames login username or password to be shorter than 4 characters ([#325](https://github.com/dhis2/app-platform/issues/325)) ([625dbfa](https://github.com/dhis2/app-platform/commit/625dbfa470696a7215eba52713be6e2a7f2e9302))

## [3.2.6](https://github.com/dhis2/app-platform/compare/v3.2.5...v3.2.6) (2020-03-20)


### Bug Fixes

* explicitly include styled-jsx as cli dependency ([#322](https://github.com/dhis2/app-platform/issues/322)) ([c0eab17](https://github.com/dhis2/app-platform/commit/c0eab17540658f94e10e9ea203197ecb3ae39210))

## [3.2.5](https://github.com/dhis2/app-platform/compare/v3.2.4...v3.2.5) (2020-02-21)


### Bug Fixes

* height in safari (DHIS2-8277) ([#303](https://github.com/dhis2/app-platform/issues/303)) ([0a53aea](https://github.com/dhis2/app-platform/commit/0a53aea4c91bb9394ec667a1c6f17f13e230e5d5))

## [3.2.4](https://github.com/dhis2/app-platform/compare/v3.2.3...v3.2.4) (2020-02-18)


### Bug Fixes

* **cli-app-scripts:** use the same build dir for modes ([#302](https://github.com/dhis2/app-platform/issues/302)) ([dd2802b](https://github.com/dhis2/app-platform/commit/dd2802b854ac0759723e3e1b8f1a8225eb412029))

## [3.2.3](https://github.com/dhis2/app-platform/compare/v3.2.2...v3.2.3) (2020-01-31)


### Bug Fixes

* pull description from package.json if not specified in config file ([#286](https://github.com/dhis2/app-platform/issues/286)) ([216d5d0](https://github.com/dhis2/app-platform/commit/216d5d07b94bc37208e1e54c10c111dcbbae13d3))

## [3.2.2](https://github.com/dhis2/app-platform/compare/v3.2.1...v3.2.2) (2020-01-17)


### Bug Fixes

* don't generate useless empty files if no translatable strings found ([#270](https://github.com/dhis2/app-platform/issues/270)) ([27a8ab8](https://github.com/dhis2/app-platform/commit/27a8ab8d13412b6831d45dcb0b105eaf1c8d4db6))

## [3.2.1](https://github.com/dhis2/app-platform/compare/v3.2.0...v3.2.1) (2020-01-16)


### Bug Fixes

* control the viewport, always show the headerbar, size app container ([#267](https://github.com/dhis2/app-platform/issues/267)) ([3823d8a](https://github.com/dhis2/app-platform/commit/3823d8a76cbcbd248cf52289aee98c8300a18bc6))

# [3.2.0](https://github.com/dhis2/app-platform/compare/v3.1.4...v3.2.0) (2020-01-16)


### Features

* allow customization of the dhis2 app icon ([#265](https://github.com/dhis2/app-platform/issues/265)) ([86f1cd7](https://github.com/dhis2/app-platform/commit/86f1cd705678780e4eedd3210f2db3ff3cb14516))

## [3.1.4](https://github.com/dhis2/app-platform/compare/v3.1.3...v3.1.4) (2020-01-16)


### Bug Fixes

* resolve the absolute path to the current directory ([#266](https://github.com/dhis2/app-platform/issues/266)) ([190c111](https://github.com/dhis2/app-platform/commit/190c1116389150d0064715acac63df61d6098aa9))

## [3.1.3](https://github.com/dhis2/app-platform/compare/v3.1.2...v3.1.3) (2020-01-15)


### Bug Fixes

* **eslint:** allow eslint to internally require the custom config ([#264](https://github.com/dhis2/app-platform/issues/264)) ([27d6693](https://github.com/dhis2/app-platform/commit/27d66936ecb281981b6401312aa995fe4e3c3431)), closes [#263](https://github.com/dhis2/app-platform/issues/263)

## [3.1.2](https://github.com/dhis2/app-platform/compare/v3.1.1...v3.1.2) (2020-01-14)


### Bug Fixes

* correctly support all CRA babel plugins ([#262](https://github.com/dhis2/app-platform/issues/262)) ([5f1d5dd](https://github.com/dhis2/app-platform/commit/5f1d5ddf4f62d172beecdc088c5ad558a24fec91))

## [3.1.1](https://github.com/dhis2/app-platform/compare/v3.1.0...v3.1.1) (2020-01-13)


### Bug Fixes

* upgrade @dhis2/ui-core to v4.6.1 ([84b7669](https://github.com/dhis2/app-platform/commit/84b76696e059731357f3dd2ba86724ba9bacc17a))

# [3.1.0](https://github.com/dhis2/app-platform/compare/v3.0.2...v3.1.0) (2020-01-03)


### Features

* publish shell and adapter, fix dependency resolution ([#221](https://github.com/dhis2/app-platform/issues/221)) ([dd1c51a](https://github.com/dhis2/app-platform/commit/dd1c51a90843274d8b50c55a9818fc6b115dda02))

## [3.0.2](https://github.com/dhis2/app-platform/compare/v3.0.1...v3.0.2) (2019-12-20)


### Bug Fixes

* add an eslint config to shell, falling back to react-app defaults ([#222](https://github.com/dhis2/app-platform/issues/222)) ([2c7deae](https://github.com/dhis2/app-platform/commit/2c7deaea257a0b0780a2b5372335219a9a302d52))

## [3.0.1](https://github.com/dhis2/app-platform/compare/v3.0.0...v3.0.1) (2019-12-20)


### Bug Fixes

* correctly set custom and fallback port settings ([#223](https://github.com/dhis2/app-platform/issues/223)) ([c2ac04c](https://github.com/dhis2/app-platform/commit/c2ac04c49533e7b497f1246c9b730fc92bdeff3c))

# [3.0.0](https://github.com/dhis2/app-platform/compare/v2.0.0...v3.0.0) (2019-12-09)


### Features

* **deps:** upgrade @dhis2/ui-core to 4.1.1 and @dhis2/ui-widgets to 2.0.4 ([#198](https://github.com/dhis2/app-platform/issues/198)) ([07c2187](https://github.com/dhis2/app-platform/commit/07c2187e75a25e1a45484fcbc63c6bc3572e4f32))


### BREAKING CHANGES

* **deps:** This will break applications which use the v3 API of `@dhis2/ui-core` components

# [2.0.0](https://github.com/dhis2/app-platform/compare/v1.5.10...v2.0.0) (2019-11-28)


### Features

* remove rollup application compiler, delegate compilation to the shell ([#187](https://github.com/dhis2/app-platform/issues/187)) ([cae7a07](https://github.com/dhis2/app-platform/commit/cae7a070209e1e06e2e363ee24876ec8bf636d25))


### BREAKING CHANGES

* This may break some applications which use the former named import workaround, but removing that workaround should make treeshaking work!!

## [1.5.10](https://github.com/dhis2/app-platform/compare/v1.5.9...v1.5.10) (2019-11-22)


### Bug Fixes

* upgrade @dhis2/cli-helpers-engine to 1.5.0 ([#176](https://github.com/dhis2/app-platform/issues/176)) ([83e8a92](https://github.com/dhis2/app-platform/commit/83e8a92d0f5869bfa6342517202282c2db203137))

## [1.5.9](https://github.com/dhis2/app-platform/compare/v1.5.8...v1.5.9) (2019-11-14)


### Bug Fixes

* use Provider instead of DataProvider ([#163](https://github.com/dhis2/app-platform/issues/163)) ([ece9424](https://github.com/dhis2/app-platform/commit/ece94247eb3186369ac5750badb47859438036b4))

## [1.5.8](https://github.com/dhis2/app-platform/compare/v1.5.7...v1.5.8) (2019-11-12)


### Bug Fixes

* upgrade Headerbar to 2.0.1, don't break on older servers ([#162](https://github.com/dhis2/app-platform/issues/162)) ([b520448](https://github.com/dhis2/app-platform/commit/b520448da85a32ed0b50edbed5357aad2e6cd9cc))

## [1.5.7](https://github.com/dhis2/app-platform/compare/v1.5.6...v1.5.7) (2019-11-06)


### Bug Fixes

* update yarn.lock, otherwise install fails with cryptic error ([#150](https://github.com/dhis2/app-platform/issues/150)) ([5e5e668](https://github.com/dhis2/app-platform/commit/5e5e668c95f883bffa7e6a7616297ac590e9fea9))

## [1.5.6](https://github.com/dhis2/app-platform/compare/v1.5.5...v1.5.6) (2019-11-06)


### Bug Fixes

* upgrade @dhis2/app-runtime to v2.0.4 ([#148](https://github.com/dhis2/app-platform/issues/148)) ([c217c18](https://github.com/dhis2/app-platform/commit/c217c1895ffecb8425b762e6c6b4f2aff32b1f0a))

## [1.5.5](https://github.com/dhis2/app-platform/compare/v1.5.4...v1.5.5) (2019-10-21)


### Bug Fixes

* use browser field in package.json if it exists ([#129](https://github.com/dhis2/app-platform/issues/129)) ([33742cc](https://github.com/dhis2/app-platform/commit/33742cceeb192de0387753cf0ff8dd0f228ad28e))

## [1.5.4](https://github.com/dhis2/app-platform/compare/v1.5.3...v1.5.4) (2019-10-16)


### Bug Fixes

* detect an occupied port and find an open one ([#122](https://github.com/dhis2/app-platform/issues/122)) ([a2b1a00](https://github.com/dhis2/app-platform/commit/a2b1a0001ae792c8c510942400350166c0ed8be0))

## [1.5.3](https://github.com/dhis2/app-platform/compare/v1.5.2...v1.5.3) (2019-10-03)


### Bug Fixes

* make i18n consistently functional ([#98](https://github.com/dhis2/app-platform/issues/98)) ([291980a](https://github.com/dhis2/app-platform/commit/291980a))

## [1.5.2](https://github.com/dhis2/app-platform/compare/v1.5.1...v1.5.2) (2019-10-03)


### Bug Fixes

* don't dynamically load the app adapter (prevent blank flash) ([#97](https://github.com/dhis2/app-platform/issues/97)) ([5d2d491](https://github.com/dhis2/app-platform/commit/5d2d491))

## [1.5.1](https://github.com/dhis2/app-platform/compare/v1.5.0...v1.5.1) (2019-09-30)


### Bug Fixes

* **deps:** upgrade @dhis2/app-runtime to 2.0.2 ([61b8a62](https://github.com/dhis2/app-platform/commit/61b8a62))

# [1.5.0](https://github.com/dhis2/app-platform/compare/v1.4.5...v1.5.0) (2019-09-30)


### Features

* add support for standalone mode (default in development) ([#70](https://github.com/dhis2/app-platform/issues/70)) ([485b6da](https://github.com/dhis2/app-platform/commit/485b6da))

## [1.4.5](https://github.com/dhis2/app-platform/compare/v1.4.4...v1.4.5) (2019-09-30)


### Bug Fixes

* don't drop .gitignore lines that aren't in a section ([#88](https://github.com/dhis2/app-platform/issues/88)) ([7372a0c](https://github.com/dhis2/app-platform/commit/7372a0c))

## [1.4.4](https://github.com/dhis2/app-platform/compare/v1.4.3...v1.4.4) (2019-09-27)


### Bug Fixes

* update gitignore on init ([#71](https://github.com/dhis2/app-platform/issues/71)) ([e91d71f](https://github.com/dhis2/app-platform/commit/e91d71f))

## [1.4.3](https://github.com/dhis2/app-platform/compare/v1.4.2...v1.4.3) (2019-09-25)


### Bug Fixes

* allow env var override of api version ([#67](https://github.com/dhis2/app-platform/issues/67)) ([dc1b6df](https://github.com/dhis2/app-platform/commit/dc1b6df))

## [1.4.2](https://github.com/dhis2/app-platform/compare/v1.4.1...v1.4.2) (2019-09-24)


### Bug Fixes

* upgrade app-runtime to 2.0.1 ([d2c0c13](https://github.com/dhis2/app-platform/commit/d2c0c13))

## [1.4.1](https://github.com/dhis2/app-platform/compare/v1.4.0...v1.4.1) (2019-09-24)


### Bug Fixes

* upgrade app-runtime to 2.0 ([#65](https://github.com/dhis2/app-platform/issues/65)) ([239dd19](https://github.com/dhis2/app-platform/commit/239dd19))

# [1.4.0](https://github.com/dhis2/app-platform/compare/v1.3.1...v1.4.0) (2019-09-24)


### Features

* improve test command, support dotenv files, add postcss ([#52](https://github.com/dhis2/app-platform/issues/52)) ([210c9cc](https://github.com/dhis2/app-platform/commit/210c9cc))

## [1.3.1](https://github.com/dhis2/app-platform/compare/v1.3.0...v1.3.1) (2019-09-17)


### Bug Fixes

* remove publish-breaking comment from package.json ([#47](https://github.com/dhis2/app-platform/issues/47)) ([c45d97a](https://github.com/dhis2/app-platform/commit/c45d97a))

# [1.3.0](https://github.com/dhis2/app-platform/compare/v1.2.3...v1.3.0) (2019-09-10)


### Features

* generate a manifest, set PUBLIC_URL, and output a compliant zip ([#36](https://github.com/dhis2/app-platform/issues/36)) ([243454a](https://github.com/dhis2/app-platform/commit/243454a))

## [1.2.3](https://github.com/dhis2/app-platform/compare/v1.2.2...v1.2.3) (2019-09-06)


### Bug Fixes

* improve start behavior and logging, don't orphan react-scripts, add postcss ([#34](https://github.com/dhis2/app-platform/issues/34)) ([f9edd31](https://github.com/dhis2/app-platform/commit/f9edd31))

## [1.2.2](https://github.com/dhis2/app-platform/compare/v1.2.1...v1.2.2) (2019-09-05)


### Bug Fixes

* show compilation errors when watching for changes ([#30](https://github.com/dhis2/app-platform/issues/30)) ([7bbdd5c](https://github.com/dhis2/app-platform/commit/7bbdd5c))

## [1.2.1](https://github.com/dhis2/app-platform/compare/v1.2.0...v1.2.1) (2019-08-28)


### Bug Fixes

* restore test command and deal with standard deps ([#13](https://github.com/dhis2/app-platform/issues/13)) ([5745c21](https://github.com/dhis2/app-platform/commit/5745c21))

# [1.2.0](https://github.com/dhis2/app-platform/compare/v1.1.3...v1.2.0) (2019-08-27)


### Features

* show off more features when initing a new app ([13cb4f1](https://github.com/dhis2/app-platform/commit/13cb4f1))

## [1.1.3](https://github.com/dhis2/app-platform/compare/v1.1.2...v1.1.3) (2019-08-27)


### Bug Fixes

* build adapter before bundling ([861844f](https://github.com/dhis2/app-platform/commit/861844f))

## [1.1.2](https://github.com/dhis2/app-platform/compare/v1.1.1...v1.1.2) (2019-08-27)


### Bug Fixes

* use a flat workspaces array ([6b6a7be](https://github.com/dhis2/app-platform/commit/6b6a7be))

## [1.1.1](https://github.com/dhis2/app-platform/compare/v1.1.0...v1.1.1) (2019-08-27)


### Bug Fixes

* create a subdirectory on init, publish scripts package ([7979627](https://github.com/dhis2/app-platform/commit/7979627))

# [1.1.0](https://github.com/dhis2/app-platform/compare/v1.0.0...v1.1.0) (2019-08-27)


### Features

* publish at d2-app-scripts, add init command ([ef6009c](https://github.com/dhis2/app-platform/commit/ef6009c))

# 1.0.0 (2019-08-27)

Initial release!
