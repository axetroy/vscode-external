"use strict";
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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // status bar
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Right);

  statusBar.command = "external.run";
  statusBar.tooltip = "Run External Tools";
  statusBar.text = "External";
  statusBar.show();

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

      if (!workspace.rootPath) {
        return;
      }

      const terminal = window.createTerminal({
        name: "external",
        cwd: workspace.rootPath
      });

      terminal.show();

      terminal.sendText(command.command);
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
