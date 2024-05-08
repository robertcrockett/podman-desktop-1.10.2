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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import type { V1Deployment } from '@kubernetes/client-node';
import { render, screen, within } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { kubernetesCurrentContextDeployments } from '/@/stores/kubernetes-contexts-state';

import DeploymentsList from './DeploymentsList.svelte';

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesRegisterGetCurrentContextResources = kubernetesRegisterGetCurrentContextResourcesMock;
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  (window as any).kubernetesGetContextsGeneralState = () => Promise.resolve(new Map());
  (window as any).kubernetesGetCurrentContextGeneralState = () => Promise.resolve({});
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(DeploymentsList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect deployment empty screen', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  render(DeploymentsList);
  const noDeployments = screen.getByRole('heading', { name: 'No deployments' });
  expect(noDeployments).toBeInTheDocument();
});

test('Expect deployments list', async () => {
  const deployment: V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'my-deployment',
      namespace: 'test-namespace',
    },
    spec: {
      replicas: 2,
      selector: {},
      template: {},
    },
  };
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([deployment]);

  // wait while store is populated
  while (get(kubernetesCurrentContextDeployments).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const deploymentName = screen.getByRole('cell', { name: 'my-deployment' });
  const deploymentNamespace = screen.getByRole('cell', { name: 'test-namespace' });
  expect(deploymentName).toBeInTheDocument();
  expect(deploymentNamespace).toBeInTheDocument();
});

test('Expect correct column overflow', async () => {
  const deployment: V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'my-deployment',
      namespace: 'test-namespace',
    },
    spec: {
      replicas: 2,
      selector: {},
      template: {},
    },
  };
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([deployment]);

  // wait while store is populated
  while (get(kubernetesCurrentContextDeployments).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(2);

  const cells = await within(rows[1]).findAllByRole('cell');
  expect(cells).toBeDefined();
  expect(cells.length).toBe(9);

  expect(cells[2]).toHaveClass('overflow-hidden');
  expect(cells[3]).toHaveClass('overflow-hidden');
  expect(cells[4]).toHaveClass('overflow-hidden');
  expect(cells[5]).not.toHaveClass('overflow-hidden');
  expect(cells[6]).toHaveClass('overflow-hidden');
  expect(cells[7]).toHaveClass('overflow-hidden');
  expect(cells[8]).toHaveClass('overflow-hidden');
});

test('Expect filter empty screen', async () => {
  const deployment: V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'my-deployment',
      namespace: 'test-namespace',
    },
    spec: {
      replicas: 2,
      selector: {},
      template: {},
    },
  };

  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([deployment]);

  // wait while store is populated
  while (get(kubernetesCurrentContextDeployments).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
