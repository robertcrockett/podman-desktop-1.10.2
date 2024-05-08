/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import { type Writable, writable } from 'svelte/store';

import type { ContributionInfo } from '../../../main/src/plugin/api/contribution-info';
import { EventStore } from './event-store';

const windowEvents = ['contribution-register', 'contribution-unregister'];
const windowListeners = ['system-ready'];

export async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const contributions: Writable<readonly ContributionInfo[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listContributions = (): Promise<readonly ContributionInfo[]> => {
  return window.listContributions();
};

const eventStore = new EventStore<readonly ContributionInfo[]>(
  'contributions',
  contributions,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listContributions,
);
eventStore.setup();
