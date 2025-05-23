// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import http from 'http';
import { Server } from 'socket.io';
import { MainDebug } from '@/utils/DebugUtils';
import { WindowsController } from './WindowsController';
import { WorkspacesController } from './WorkspacesController';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { WorkspaceItem } from '@polkadot-live/types/developerConsole/workspaces';

const debug = MainDebug.extend('WebsocketsController');

const DEFAULT_PORT = 3001;

export class WebsocketsController {
  private static _port: number = DEFAULT_PORT;
  private static _server: ReturnType<typeof http.createServer> | null = null;
  private static _io: Server | null = null;

  private static initialise() {
    this._server = http.createServer();
    this._io = new Server(this._server);
  }

  /// Process a websocket IPC task.
  static process(task: IpcTask): boolean {
    switch (task.action) {
      // Handle starting the websocket server and return a success flag.
      case 'websockets:server:start': {
        this.startServer();
        return true;
      }
      // Handle stopping the websocket server and return a success flag.
      case 'websockets:server:stop': {
        this.stopServer();
        return true;
      }
      default: {
        return false;
      }
    }
  }

  /// Start socket server.
  private static startServer() {
    if (!this._io) {
      this.initialise();
    }

    this._server?.listen(this._port, () => {
      debug('🔷 Socket.io server listening on port %o', this._port);
    });

    this.setupHandlers();
  }

  /// Stop socket server.
  private static stopServer() {
    if (!this._io) {
      return;
    }

    this._io.disconnectSockets();
    this._io.close();
    debug('🔷 Socket.io server closed on port %o', this._port);
  }

  /// Setup socket communication.
  private static setupHandlers() {
    if (!this._io) {
      throw new Error('Server should not be null.');
    }

    this._io.on('connection', async (socket) => {
      /// Receive workspace and send to settings window to process.
      socket.on('workspace', async (serialised: string) => {
        try {
          const workspace: WorkspaceItem = JSON.parse(serialised);

          // Add to storage.
          WorkspacesController.addWorkspace(workspace);

          // Send to settings window.
          WindowsController.getView('settings')?.webContents?.send(
            'settings:workspace:receive',
            serialised
          );
        } catch (error) {
          if (error instanceof SyntaxError) {
            console.error(error.message);
          }
        }
      });

      /// Same as `workspace` but for multiple workspaces.
      socket.on('workspaces', async (serialised: string) => {
        try {
          const workspaces: WorkspaceItem[] = JSON.parse(serialised);
          for (const workspace of workspaces) {
            WorkspacesController.addWorkspace(workspace);
            WindowsController.getView('settings')?.webContents?.send(
              'settings:workspace:receive',
              JSON.stringify(workspace)
            );
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            console.error(error.message);
          }
        }
      });

      /// Test handler: Message received from socket.
      socket.on('message', async (message: string) => {
        console.log(`received message: ${message}`);
        // Send message back to client.
        socket.send(`Hello, you sent -> ${message}`);
      });

      /// Test handler: Immediately send feedback to incoming connection.
      socket.send(`Hello from Websocket Server on port ${this._port}`);
    });
  }

  /// Emit workspace to clients.
  static launchWorkspace(workspace: WorkspaceItem) {
    console.log('> Todo: Emit workspace to connected clients.');
    console.log(workspace);
  }
}
