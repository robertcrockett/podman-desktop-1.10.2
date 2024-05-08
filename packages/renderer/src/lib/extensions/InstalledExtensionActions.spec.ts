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

import InstalledExtensionActions from './InstalledExtensionActions.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect to see icon, link, badge and actions', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: false,
    version: 'v1.2.3',
    state: 'started',
    path: '',
    readme: '',
    icon: 'iconOfMyExtension.png',
  };
  render(InstalledExtensionActions, { extension });

  // get actions be there
  const actions = screen.getByRole('group', { name: 'Extension Actions' });
  expect(actions).toBeInTheDocument();
});
