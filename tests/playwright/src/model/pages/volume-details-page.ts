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

import type { Locator, Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { handleConfirmationDialog } from '../../utility/operations';
import { BasePage } from './base-page';
import { VolumesPage } from './volumes-page';

export class VolumeDetailsPage extends BasePage {
  readonly labelName: Locator;
  readonly heading: Locator;
  readonly closeLink: Locator;
  readonly backToVolumesLink: Locator;
  readonly volumeName: string;
  readonly deleteButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';

  constructor(page: Page, name: string) {
    super(page);
    this.volumeName = name;
    this.labelName = page.getByLabel('name').and(page.getByText('Volume Details'));
    this.heading = page.getByRole('heading', { name: this.volumeName });
    this.closeLink = page.getByRole('link', { name: 'Close Details' });
    this.backToVolumesLink = page.getByRole('link', { name: 'Go back to Volumes' });
    this.deleteButton = page.getByRole('button', { name: 'Delete Volume' });
  }

  async activateTab(tabName: string): Promise<this> {
    const tabItem = this.page.getByRole('link', { name: tabName, exact: true });
    await tabItem.waitFor({ state: 'visible', timeout: 2000 });
    await tabItem.click();
    return this;
  }

  async getStateLocator(): Promise<Locator> {
    await this.activateTab(VolumeDetailsPage.SUMMARY_TAB);
    const summaryTable = this.getPage().getByRole('table');
    const stateRow = summaryTable.locator('tr:has-text("State")');
    const stateCell = stateRow.getByRole('cell').nth(1);
    await stateCell.waitFor({ state: 'visible', timeout: 500 });
    return stateCell;
  }

  async deleteVolume(): Promise<VolumesPage> {
    await playExpect(this.deleteButton).toBeEnabled();
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new VolumesPage(this.page);
  }
}
