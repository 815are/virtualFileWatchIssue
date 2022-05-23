"use strict";

import * as vscode from "vscode";
import { posix } from "path";
import { TextDecoder } from "util";
import { MemFS } from "./fileSystemProvider";
import { startTime, stopTime } from "./time";

enum SchemeName {
  Memfs = "memfs",
}

function fsPathToFtfsUri(path: string): vscode.Uri {
  let posixPath = path.replace(/\\/g, "/");
  if (!posix.isAbsolute(posixPath)) {
    posixPath = `/${posixPath}`;
  }
  return vscode.Uri.parse(`${SchemeName.Memfs}:${posixPath}`);
}

async function openTextDocument(uri: vscode.Uri): Promise<void> {
  const openUri = fsPathToFtfsUri(uri.fsPath);
  const document: vscode.TextDocument = await vscode.workspace.openTextDocument(
    openUri
  );
  await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MemFS says "Hello"');

  const memFs = new MemFS();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(SchemeName.Memfs, memFs, {
      isCaseSensitive: true,
    })
  );
  let initialized = false;

  context.subscriptions.push(
    vscode.commands.registerCommand("memfs.reset", (_) => {
      for (const [name] of memFs.readDirectory(
        vscode.Uri.parse(`${SchemeName.Memfs}:/`)
      )) {
        memFs.delete(vscode.Uri.parse(`${SchemeName.Memfs}:/${name}`));
      }
      initialized = false;
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("memfs.init", async (_) => {
      // Get fist workspace folder
      const workspaceUri = vscode.workspace.workspaceFolders?.[0]
        ?.uri as vscode.Uri;
      if (!workspaceUri) {
        vscode.window.showErrorMessage(
          "Please open any folder for issue reproduction"
        );
      }

      // Create virtual file
      const fileUri = workspaceUri.with({
        path: posix.join("dummy", "subfolder", "test.txt"),
      });

      if (initialized) {
        await openTextDocument(fileUri);
        return;
      }
      initialized = true;

      memFs.writeFile(fileUri, Buffer.from("Test data"), {
        create: true,
        overwrite: true,
      });

      // Try to add watchers
      const sourceFileWatch = vscode.workspace.createFileSystemWatcher(
        "**" + fileUri.path
      );
      sourceFileWatch.onDidChange(() => {
        vscode.window.showInformationMessage("File changed");
      });
      const sourceFileWatch2 = vscode.workspace.createFileSystemWatcher(
        fileUri.path
      );
      sourceFileWatch2.onDidChange(() => {
        vscode.window.showInformationMessage("File changed 2");
      });

      // Open newly created virtual
      await openTextDocument(fileUri);
    })
  );

  const readFile = posix.join("dummy", "subfolder", "test.txt");
  const parseFile = (content: Uint8Array): string => {
    return new TextDecoder("utf-8").decode(content);
  };
  context.subscriptions.push(
    vscode.commands.registerCommand("memfs.readDirect", async (_) => {
      const readFilenUri = fsPathToFtfsUri(readFile);
      startTime("readDirect");
      const file = await memFs.readFile(readFilenUri);
      const timeEnd = stopTime("readDirect");
      await vscode.window.showInformationMessage(
        `Direct read from provider. Time - ${timeEnd}ms. File content: \n "${parseFile(
          file
        )}"`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("memfs.readWorkspace", async (_) => {
      const readFilenUri = fsPathToFtfsUri(readFile);
      startTime("readWorkspace");
      const file = await vscode.workspace["fs"].readFile(readFilenUri);
      const timeEnd = stopTime("readWorkspace");
      await vscode.window.showInformationMessage(
        `Read using workspace API. Time - ${timeEnd}ms. File content: \n "${parseFile(
          file
        )}"`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("memfs.workspaceInit", (_) => {
      vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.parse(`${SchemeName.Memfs}:/`),
        name: "MemFS - Sample",
      });
    })
  );
}
