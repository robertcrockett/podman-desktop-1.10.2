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

import * as fs from 'node:fs';
import * as http from 'node:http';
import { resolve } from 'node:path';

import * as extensionApi from '@podman-desktop/api';
import { shellPath } from 'shell-path';

import type { OS } from './os';

export class Detect {
  static readonly WINDOWS_SOCKET_PATH = '//./pipe/docker_engine';
  static readonly UNIX_SOCKET_PATH = '/var/run/docker.sock';

  constructor(
    private os: OS,
    private storagePath: string,
  ) {}

  // search if docker-compose is available in the path (+ include storage/bin folder)
  async checkForDockerCompose(): Promise<boolean> {
    try {
      await extensionApi.process.exec('docker-compose', ['--version']);
      return true;
    } catch (e) {
      return false;
    }
  }

  // search if docker-compose is available is installed system wide
  async checkSystemWideDockerCompose(): Promise<boolean> {
    // runCommand appends the storage/bin folder to the PATH
    // so let's set the env PATH to the system path before running the command
    // to avoid the storage/bin folder to be appended to the PATH
    try {
      await extensionApi.process.exec('docker-compose', ['--version'], { env: { PATH: process.env.PATH } });
      return true;
    } catch (e) {
      return false;
    }
  }
  // search if the podman-compose is available in the storage/bin path
  async checkStoragePath(): Promise<boolean> {
    // check that extension/bin folder is in the PATH
    const extensionBinPath = resolve(this.storagePath, 'bin');

    // grab current path
    const currentPath = await shellPath();
    return currentPath.includes(extensionBinPath);
  }

  // Check to see that docker-compose exists in the storage directory and return the path if it does
  async getStoragePath(): Promise<string> {
    const extensionBinPath = resolve(this.storagePath, 'bin');

    // append file extension
    let fileExtension = '';
    if (this.os.isWindows()) {
      fileExtension = '.exe';
    }
    const dockerComposePath = resolve(extensionBinPath, `docker-compose${fileExtension}`);

    // Check that dockerComposePath exists using node:fs
    // else, error out
    if (fs.existsSync(dockerComposePath)) {
      return dockerComposePath;
    } else {
      return '';
    }
  }

  // Async function that checks to see if the current Docker socket is a disguised Podman socket
  async checkDefaultSocketIsAlive(): Promise<boolean> {
    const socketPath = this.getSocketPath();

    const podmanPingUrl = {
      path: '/_ping',
      socketPath,
    };

    return new Promise<boolean>(resolve => {
      const req = http.get(podmanPingUrl, res => {
        res.on('data', () => {
          // do nothing
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
      req.once('error', err => {
        console.debug('Error while pinging docker', err);
        resolve(false);
      });
    });
  }

  // Function that checks whether you are running windows, mac or linux and returns back
  // the correct Docker socket location
  getSocketPath(): string {
    let socketPath: string = Detect.UNIX_SOCKET_PATH;
    if (this.os.isWindows()) {
      socketPath = Detect.WINDOWS_SOCKET_PATH;
    }
    return socketPath;
  }
}
