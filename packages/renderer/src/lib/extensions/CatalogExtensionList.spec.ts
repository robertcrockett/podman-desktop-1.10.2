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

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtensionList from './CatalogExtensionList.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).extensionInstallFromImage = vi.fn();
});

const extensionA: CatalogExtensionInfoUI = {
  id: 'myId1',
  displayName: 'This is the display name1',
  isFeatured: false,
  fetchable: false,
  fetchLink: '',
  fetchVersion: '',
  publisherDisplayName: 'Foo publisher',
  isInstalled: false,
  shortDescription: 'my description1',
};

const extensionB: CatalogExtensionInfoUI = {
  id: 'myId2',
  displayName: 'This is the display name2',
  isFeatured: false,
  fetchable: false,
  fetchLink: '',
  fetchVersion: '',
  publisherDisplayName: 'Foo publisher',
  isInstalled: false,
  shortDescription: 'my description2',
};
test('Check with empty', async () => {
  render(CatalogExtensionList, { catalogExtensions: [] });

  // no 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).not.toBeInTheDocument();
});

test('Check with 2 extensions', async () => {
  render(CatalogExtensionList, { catalogExtensions: [extensionA, extensionB] });

  // 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).toBeInTheDocument();

  // get region role with text 'Catalog Extensions'
  const region = screen.getByRole('region', { name: 'Catalog Extensions' });
  expect(region).toBeInTheDocument();

  // get div using aria-label 'This is the display name1'
  const extensionWidgetA = screen.getByRole('group', { name: 'This is the display name1' });
  expect(extensionWidgetA).toBeInTheDocument();

  const extensionWidgetB = screen.getByRole('group', { name: 'This is the display name2' });
  expect(extensionWidgetB).toBeInTheDocument();
});
