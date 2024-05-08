/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { assertType, beforeAll, expect, test } from 'vitest';

import { CancellationTokenSource } from './cancellation-token.js';
import { CancellationTokenRegistry } from './cancellation-token-registry.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cancellationTokenRegistry: any;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  cancellationTokenRegistry = new CancellationTokenRegistry();
});

test('Should return CancellationTokenSources with progressive id', async () => {
  const tokenSourceId1 = cancellationTokenRegistry.createCancellationTokenSource();
  const tokenSourceid2 = cancellationTokenRegistry.createCancellationTokenSource();
  assertType<number>(tokenSourceId1);
  assertType<number>(tokenSourceid2);
  expect(tokenSourceid2).toBeGreaterThan(tokenSourceId1);
});

test('Check if CancellationToken is saved in registry', async () => {
  const tokenSourceId = cancellationTokenRegistry.createCancellationTokenSource();
  const hasToken = cancellationTokenRegistry.hasCancellationTokenSource(tokenSourceId);
  expect(hasToken).toBe(true);
});

test('Return undefined if id not valid', async () => {
  const token = cancellationTokenRegistry.getCancellationTokenSource(-1);
  expect(token).toBeUndefined();
});

test('Return CancellationToken if id valid', async () => {
  const tokenSourceId = cancellationTokenRegistry.createCancellationTokenSource();
  assertType<number>(tokenSourceId);
  const token = cancellationTokenRegistry.getCancellationTokenSource(tokenSourceId);
  expect(token).toBeDefined();
  expect(token instanceof CancellationTokenSource);
});
