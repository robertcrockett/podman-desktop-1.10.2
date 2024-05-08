/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { extensionInfos } from '/@/stores/extensions';

import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import EmbeddableCatalogExtensionList from './EmbeddableCatalogExtensionList.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).extensionInstallFromImage = vi.fn();
});

export const aFakeExtension: CatalogExtension = {
  id: 'idAInstalled',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short A',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'a-extension',
  displayName: 'A Extension',
  categories: ['Authentication'],
  unlisted: false,
  versions: [
    {
      version: '1.0.0A',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconA',
        },
      ],
      ociUri: 'linkA',
      lastUpdated: new Date(),
    },
  ],
};

export const bFakeExtension: CatalogExtension = {
  id: 'idB',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short B',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'b-extension',
  displayName: 'B Extension',
  categories: [],
  unlisted: false,
  versions: [
    {
      version: '1.0.0B',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconB',
        },
      ],
      ociUri: 'linkB',
      lastUpdated: new Date(),
    },
  ],
};

const combined: CombinedExtensionInfoUI[] = [
  {
    id: 'idAInstalled',
    displayName: 'A installed Extension',
    removable: true,
    state: 'started',
  },
] as unknown[] as CombinedExtensionInfoUI[];

test('Check with defaults', async () => {
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set(combined);

  render(EmbeddableCatalogExtensionList, {});

  // 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).toBeInTheDocument();

  // we should have two extensions as we have no filters
  const extensionA = screen.getByRole('group', { name: 'A Extension' });
  expect(extensionA).toBeInTheDocument();

  const extensionB = screen.getByRole('group', { name: 'B Extension' });
  expect(extensionB).toBeInTheDocument();
});

test('Check with a specific category', async () => {
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set(combined);

  render(EmbeddableCatalogExtensionList, { category: 'Authentication' });

  // 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).toBeInTheDocument();

  // we should have one extensions as we have filter on category
  const extensionA = screen.getByRole('group', { name: 'A Extension' });
  expect(extensionA).toBeInTheDocument();

  // this one should not be there
  const extensionB = screen.queryByRole('group', { name: 'B Extension' });
  expect(extensionB).not.toBeInTheDocument();
});

test('Check with a not displaying installed', async () => {
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set(combined);

  render(EmbeddableCatalogExtensionList, { showInstalled: false });

  // 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).toBeInTheDocument();

  // we should have one extension (A is installed and should not appear)
  const extensionA = screen.queryByRole('group', { name: 'A Extension' });
  expect(extensionA).not.toBeInTheDocument();

  // this one should be there
  const extensionB = screen.queryByRole('group', { name: 'B Extension' });
  expect(extensionB).toBeInTheDocument();
});
