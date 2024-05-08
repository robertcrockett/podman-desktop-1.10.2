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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import type { KubernetesObject, V1Ingress } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { readable, writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';
import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';
import IngressesRoutesList from './IngressesRoutesList.svelte';

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {
    routeSearchPattern: writable(''),
    ingressSearchPattern: writable(''),
    kubernetesCurrentContextIngresses: vi.fn(),
    kubernetesCurrentContextIngressesFiltered: writable<KubernetesObject[]>([]),
    kubernetesCurrentContextRoutes: vi.fn(),
    kubernetesCurrentContextRoutesFiltered: writable<KubernetesObject[]>([]),
    kubernetesCurrentContextState: readable({
      reachable: true,
      error: 'initializing',
      resources: { pods: 0, deployments: 0 },
    } as ContextGeneralState),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  (window as any).kubernetesGetContextsGeneralState = () => Promise.resolve(new Map());
  (window as any).kubernetesGetCurrentContextGeneralState = () => Promise.resolve({});
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(IngressesRoutesList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect ingress&routes empty screen', async () => {
  render(IngressesRoutesList);
  const noIngressesNorRoutes = screen.getByRole('heading', { name: 'No ingresses or routes' });
  expect(noIngressesNorRoutes).toBeInTheDocument();
});

test('Expect element in ingresses list', async () => {
  const ingress = {
    metadata: {
      name: 'my-ingress',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;
  const route = {
    metadata: {
      name: 'my-route',
      namespace: 'test-namespace',
    },
    spec: {
      host: 'foo.bar.com',
      port: {
        targetPort: '80',
      },
      to: {
        kind: 'Service',
        name: 'service',
      },
    },
  } as V1Route;

  // mock object stores
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([ingress]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngressesFiltered = readable<KubernetesObject[]>([ingress]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([route]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutesFiltered = readable<KubernetesObject[]>([route]);

  await waitRender({});

  const ingressName = screen.getByRole('cell', { name: 'my-ingress' });
  expect(ingressName).toBeInTheDocument();
  const routeName = screen.getByRole('cell', { name: 'my-route' });
  expect(routeName).toBeInTheDocument();
});

test('Expect filter empty screen if no match', async () => {
  // mock object stores
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngressesFiltered = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutesFiltered = readable<KubernetesObject[]>([]);

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect status column name to be clickable / sortable', async () => {
  await waitRender({});

  const statusColumn = screen.getByRole('columnheader', { name: 'Status' });
  expect(statusColumn).toBeInTheDocument();

  // Expect it to have the 'cursor-pointer' class which means it's clickable / sortable
  expect(statusColumn).toHaveClass('cursor-pointer');
});
