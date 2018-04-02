"use strict";

import * as path from "path";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  commands,
  window,
  workspace,
  ExtensionContext,
  StatusBarAlignment
} from "vscode";

import * as vscode from "vscode";

interface ICommand {
  name: string;
  command: string;
}

const NAMESPACE: string = "external";
const COMMANDS_FIELD: string = "commands";
const SHOW_TERMINAL_FIELD: string = "showTerminal";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // status bar
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Right);

  statusBar.command = "external.run";
  statusBar.tooltip = "Run External Tools";
  statusBar.text = "External";
  statusBar.show();

  let terminal: vscode.Terminal | void;

  context.subscriptions.push(statusBar);

  // define external tool
  context.subscriptions.push(
    commands.registerCommand("external.define", async () => {
      const name = (await window.showInputBox({
        placeHolder: "Give a Name of This External Tool"
      })) as string;

      if (!name) {
        return;
      }

      const command = (await window.showInputBox({
        placeHolder: `Define the Command of '${name}'.`
      })) as string;

      if (!command) {
        return;
      }

      const config = workspace.getConfiguration(NAMESPACE);
      const commands: ICommand[] = config.get<ICommand[]>(COMMANDS_FIELD) || [];

      const index = commands.findIndex(c => c.name === name);

      if (index >= 0) {
        // replace old command
        commands[index].command = command;
      } else {
        commands.push({
          name,
          command
        });
      }

      // update config
      config.update(COMMANDS_FIELD, commands, 1);
    })
  );

  // run external tool
  context.subscriptions.push(
    commands.registerCommand("external.run", async () => {
      const config = workspace.getConfiguration(NAMESPACE);
      const commands: ICommand[] = config.get<ICommand[]>(COMMANDS_FIELD) || [];

      if (!commands || !commands.length) {
        const action = await window.showInformationMessage(
          "Do Found Any External Tools.",
          "Define",
          "Cancel"
        );
        switch (action) {
          case "Define":
            return vscode.commands.executeCommand("external.define");
          default:
            return;
        }
      }

      const selected = await window.showQuickPick(
        commands.map(c => {
          return {
            label: c.name,
            description: c.command
          };
        })
      );

      if (!selected) {
        return;
      }

      const command = commands.find(c => c.name === selected.label);

      if (!command) {
        return;
      }

      let projectDir: string | void = workspace.rootPath;
      let filePath: string | void;

      if (window.activeTextEditor) {
        filePath = window.activeTextEditor.document.fileName;
      }

      if (!projectDir && filePath) {
        projectDir = path.dirname(filePath);
      }

      if (!projectDir) {
        return;
      }

      if (!terminal) {
        terminal = window.createTerminal({
          name: "external",
          cwd: projectDir
        });
      }

      if (config.get<boolean>(SHOW_TERMINAL_FIELD)) {
        terminal.show();
      }

      const commandRaw = command.command
        .replace(/\$ProjectFileDir\$/, path.normalize(projectDir))
        .replace(/\$FilePath\$/, filePath ? path.normalize(filePath) : "");

      terminal.sendText(commandRaw);
    })
  );

  // remove external tool
  context.subscriptions.push(
    commands.registerCommand("external.remove", async () => {
      const config = workspace.getConfiguration(NAMESPACE);
      const commands: ICommand[] = config.get<ICommand[]>(COMMANDS_FIELD) || [];

      const selected = await window.showQuickPick(
        commands.map(c => {
          return {
            label: c.name,
            description: c.command
          };
        })
      );

      if (!selected) {
        return;
      }

      const index = commands.findIndex(c => c.name === selected.label);

      // remove command
      commands.splice(index, 1);

      // update config
      config.update(COMMANDS_FIELD, commands, 1);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate(context: ExtensionContext) {
  //
}
