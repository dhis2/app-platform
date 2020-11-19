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
