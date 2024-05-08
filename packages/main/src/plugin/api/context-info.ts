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
import type { Context } from '../context/context.js';

export type ContextKeyValue =
  | undefined
  | boolean
  | number
  | string
  | Array<undefined | boolean | number | string>
  | Record<string, undefined | boolean | number | string>;

export interface IContext {
  getValue<T extends ContextKeyValue = ContextKeyValue>(key: string): T | undefined;
}

export interface ContextInfo {
  readonly id: number;
  readonly parent?: Context;
  readonly extension?: string;
}
