// From https://github.com/atlassian/yarn-deduplicate
// Copyright (c) 2017 Atlassian and others

const lockfile = require('@yarnpkg/lockfile')
const outdent = require('outdent')
const { fixDuplicates, listDuplicates } = require('./yarnDeduplicate.js')

test('dedupes lockfile to max compatible version', () => {
    const yarn_lock = outdent`
    library@^1.1.0:
      version "1.2.0"
      resolved "https://example.net/library@^1.1.0"

    library@^1.2.0:
      version "1.2.0"
      resolved "https://example.net/library@^1.2.0"

    library@^1.3.0:
      version "1.3.0"
      resolved "https://example.net/library@^1.3.0"
    `

    const deduped = fixDuplicates(yarn_lock)
    const json = lockfile.parse(deduped).object
    expect(json['library@^1.1.0']['version']).toEqual('1.3.0')
    expect(json['library@^1.2.0']['version']).toEqual('1.3.0')
    expect(json['library@^1.3.0']['version']).toEqual('1.3.0')

    const map = listDuplicates(yarn_lock)
    expect(map.get('library')).toEqual(['1.2.0', '1.3.0'])
})

test('dedupes lockfile to most common compatible version', () => {
    const yarn_lock = outdent`
    library@>=1.0.0:
      version "3.0.0"
      resolved "https://example.net/library@^3.0.0"

    library@>=1.1.0:
      version "3.0.0"
      resolved "https://example.net/library@^3.0.0"

    library@^2.0.0:
      version "2.1.0"
      resolved "https://example.net/library@^2.1.0"
  `

    const deduped = fixDuplicates(yarn_lock, {
        useMostCommon: true,
    })
    const json = lockfile.parse(deduped).object
    expect(json['library@>=1.0.0']['version']).toEqual('2.1.0')
    expect(json['library@>=1.1.0']['version']).toEqual('2.1.0')
    expect(json['library@^2.0.0']['version']).toEqual('2.1.0')

    const map = listDuplicates(yarn_lock, {
        useMostCommon: true,
    })
    expect(map.get('library')).toEqual(['3.0.0', '2.1.0'])
})

test('limits the scopes to be de-duplicated', () => {
    const yarn_lock = outdent`
    "@a-scope/a-package@^2.0.0":
      version "2.0.0"
      resolved "http://example.com/a-scope/a-package/2.1.0"

    "@a-scope/a-package@^2.0.1":
      version "2.0.1"
      resolved "http://example.com/a-scope/a-package/2.2.0"

    "@another-scope/a-package@^1.0.0":
      version "1.0.11"
      resolved "http://example.com/another-scope/a-package/1.0.0"

    "@another-scope/a-package@^1.0.1":
      version "1.0.12"
      resolved "http://example.com/another-scope/a-package/1.0.0"
  `

    const deduped = fixDuplicates(yarn_lock, {
        includeScopes: ['@another-scope'],
    })
    const json = lockfile.parse(deduped).object
    expect(json['@a-scope/a-package@^2.0.0']['version']).toEqual('2.0.0')
    expect(json['@a-scope/a-package@^2.0.1']['version']).toEqual('2.0.1')
    expect(json['@another-scope/a-package@^1.0.0']['version']).toEqual('1.0.12')
    expect(json['@another-scope/a-package@^1.0.1']['version']).toEqual('1.0.12')

    const map = listDuplicates(yarn_lock, {
        includeScopes: ['@another-scope'],
    })
    expect(map.size).toEqual(1)
    expect(map.get('@another-scope/a-package')).toEqual(['1.0.11', '1.0.12'])
})

test('includePrerelease options dedupes to the prerelease', () => {
    const yarn_lock = outdent`
  typescript@^4.1.0-beta:
    version "4.1.0-beta"
    resolved "https://registry.yarnpkg.com/typescript/-/typescript-4.1.0-beta.tgz#e4d054035d253b7a37bdc077dd71706508573e69"
    integrity sha512-b/LAttdVl3G6FEmnMkDsK0xvfvaftXpSKrjXn+OVCRqrwz5WD/6QJOiN+dTorqDY+hkaH+r2gP5wI1jBDmdQ7A==

  typescript@^4.0.3:
    version "4.0.3"
    resolved "https://packages.atlassian.com/api/npm/npm-remote/typescript/-/typescript-4.0.3.tgz#153bbd468ef07725c1df9c77e8b453f8d36abba5"
    integrity sha1-FTu9Ro7wdyXB35x36LRT+NNqu6U=

`

    const deduped = fixDuplicates(yarn_lock, {
        includePrerelease: true,
    })
    const json = lockfile.parse(deduped).object
    expect(json['typescript@^4.0.3']['version']).toEqual('4.1.0-beta')
    expect(json['typescript@^4.1.0-beta']['version']).toEqual('4.1.0-beta')

    const map = listDuplicates(yarn_lock, {
        includePrerelease: true,
    })
    expect(map.size).toEqual(1)
    expect(map.get('typescript')).toEqual(['4.1.0-beta', '4.0.3'])
})

test('limits the packages to be de-duplicated', () => {
    const yarn_lock = outdent`
    a-package@^2.0.0:
      version "2.0.0"
      resolved "http://example.com/a-package/2.1.0"

    a-package@^2.0.1:
      version "2.0.1"
      resolved "http://example.com/a-package/2.2.0"

    other-package@^1.0.0:
      version "1.0.11"
      resolved "http://example.com/other-package/1.0.0"

    other-package@^1.0.1:
      version "1.0.12"
      resolved "http://example.com/other-package/1.0.0"
  `

    const deduped = fixDuplicates(yarn_lock, {
        includePackages: ['other-package'],
    })
    const json = lockfile.parse(deduped).object
    expect(json['a-package@^2.0.0']['version']).toEqual('2.0.0')
    expect(json['a-package@^2.0.1']['version']).toEqual('2.0.1')
    expect(json['other-package@^1.0.0']['version']).toEqual('1.0.12')
    expect(json['other-package@^1.0.1']['version']).toEqual('1.0.12')

    const map = listDuplicates(yarn_lock, {
        includePackages: ['other-package'],
    })
    expect(map.size).toEqual(1)
    expect(map.get('other-package')).toEqual(['1.0.11', '1.0.12'])
})

test('excludes packages to be de-duplicated', () => {
    const yarn_lock = outdent`
    a-package@^2.0.0:
      version "2.0.0"
      resolved "http://example.com/a-package/2.1.0"

    a-package@^2.0.1:
      version "2.0.1"
      resolved "http://example.com/a-package/2.2.0"

    other-package@^1.0.0:
      version "1.0.11"
      resolved "http://example.com/other-package/1.0.0"

    other-package@^1.0.1:
      version "1.0.12"
      resolved "http://example.com/other-package/1.0.0"
  `

    const deduped = fixDuplicates(yarn_lock, {
        excludePackages: ['a-package'],
    })
    const json = lockfile.parse(deduped).object
    expect(json['a-package@^2.0.0']['version']).toEqual('2.0.0')
    expect(json['a-package@^2.0.1']['version']).toEqual('2.0.1')
    expect(json['other-package@^1.0.0']['version']).toEqual('1.0.12')
    expect(json['other-package@^1.0.1']['version']).toEqual('1.0.12')

    const map = listDuplicates(yarn_lock, {
        excludePackages: ['a-package'],
    })
    expect(map.size).toEqual(1)
    expect(map.get('other-package')).toEqual(['1.0.11', '1.0.12'])
})

test('should support the integrity field if present', () => {
    const yarn_lock = outdent({ trimTrailingNewline: false })`
    # THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
    # yarn lockfile v1


    a-package@^2.0.0:
      version "2.0.1"
      resolved "http://example.com/a-package/2.0.1"
      integrity sha512-ptqFDzemkXGMf7ylch/bCV+XTDvVjD9dRymzcjOPIxg8Hqt/uesOye10GXItFbsxJx9VZeJBYrR8FFTauu+hHg==
      dependencies:
        a-second-package "^2.0.0"

    a-second-package@^2.0.0:
      version "2.0.1"
      resolved "http://example.com/a-second-package/2.0.1"
      integrity sha512-ptqFDzemkXGMf7ylch/bCV+XTDvVjD9dRymzcjOPIxg8Hqt/uesOye10GXItFbsxJx9VZeJBYrR8FFTauu+hHg==
  `

    const deduped = fixDuplicates(yarn_lock)

    // We should not have made any change to the order of outputted lines (@yarnpkg/lockfile 1.0.0 had this bug)
    expect(yarn_lock).toBe(deduped)
})
