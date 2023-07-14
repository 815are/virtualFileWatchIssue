"use strict";

import * as vscode from "vscode";
import { join } from "path";
import { TextDecoder } from "util";
import { startTime, stopTime } from "./time";

export function activate(context: vscode.ExtensionContext) {
  console.log('Test says "Hello"');

  const changeCB = (path: string, prefix: string) => {
    vscode.window.showInformationMessage(
      `${prefix} Change triggered for file ${path}`
    );
  };

  const createCB = (path: string, prefix: string) => {
    vscode.window.showInformationMessage(
      `${prefix} Create triggered for file ${path}`
    );
  };

  // Command to register global handler to listen all xml files
  context.subscriptions.push(
    vscode.commands.registerCommand("watcherTest.global", (_) => {
      const patternPath = "**/*.js";
      const watch: vscode.FileSystemWatcher =
        vscode.workspace.createFileSystemWatcher(patternPath);
      watch.onDidChange((uri: vscode.Uri) => {
        changeCB(uri.fsPath, "GLOBAL1");
      });
      watch.onDidCreate((uri: vscode.Uri) => {
        createCB(uri.fsPath, "GLOBAL1");
      });
      if (vscode.workspace.workspaceFolders) {
        const relativePattern = new vscode.RelativePattern(
          vscode.workspace.workspaceFolders[0],
          "**/*.js"
        );
        const watch2: vscode.FileSystemWatcher =
          vscode.workspace.createFileSystemWatcher(relativePattern);
        watch2.onDidChange((uri: vscode.Uri) => {
          changeCB(uri.fsPath, "GLOBAL2");
        });
        watch2.onDidCreate((uri: vscode.Uri) => {
          createCB(uri.fsPath, "GLOBAL2");
        });
        vscode.window.showInformationMessage("Watcher registered");
      }
    })
  );

  // Command to register global handler to listen all xml files
  context.subscriptions.push(
    vscode.commands.registerCommand("watcherTest.local", (context) => {
      const watch = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(context.fsPath, "*")
      );
      watch.onDidChange((uri: vscode.Uri) => {
        changeCB(uri.fsPath, "LOCAL");
      });
      watch.onDidCreate((uri: vscode.Uri) => {
        createCB(uri.fsPath, "LOCAL");
      });
    })
  );
}
