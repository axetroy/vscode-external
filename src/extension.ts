"use strict";

import * as path from "path";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from "vscode";
const { commands, window, workspace, StatusBarAlignment } = vscode;

interface ICommand {
  name: string;
  command: string;
  cwd?: string;
}

const NAMESPACE: string = "external";
const COMMANDS_FIELD: string = "commands";
const SHOW_TERMINAL_FIELD: string = "showTerminal";

function normalizePath(
  str: string,
  scope: { projectDir: string; filePath?: string }
): string {
  const { projectDir, filePath } = scope;
  return str
    .replace(/\$ProjectFileDir\$/, path.normalize(projectDir))
    .replace(/\$FilePath\$/, filePath ? path.normalize(filePath) : "");
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // status bar
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Right);

  statusBar.command = "external.run";
  statusBar.tooltip = "Run External Tools";
  statusBar.text = "$(zap)External";
  statusBar.show();

  let terminal: vscode.Terminal | void;

  context.subscriptions.push(statusBar);

  // add external tool
  context.subscriptions.push(
    commands.registerCommand("external.add", async () => {
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
      const externalCommands: ICommand[] =
        config.get<ICommand[]>(COMMANDS_FIELD) || [];

      const index = externalCommands.findIndex(c => c.name === name);

      if (index >= 0) {
        // replace old command
        externalCommands[index].command = command;
      } else {
        externalCommands.push({
          name,
          command,
          cwd: "$ProjectFileDir$"
        });
      }

      // update config
      config.update(COMMANDS_FIELD, externalCommands, 1);
    })
  );

  // remove external tool
  context.subscriptions.push(
    commands.registerCommand("external.remove", async () => {
      const config = workspace.getConfiguration(NAMESPACE);
      const externalCommands: ICommand[] =
        config.get<ICommand[]>(COMMANDS_FIELD) || [];

      const selected = await window.showQuickPick(
        externalCommands.map(c => {
          return {
            label: c.name,
            description: c.command
          };
        })
      );

      if (!selected) {
        return;
      }

      const index: number = externalCommands.findIndex(
        c => c.name === selected.label
      );

      // remove command
      externalCommands.splice(index, 1);

      // update config
      config.update(COMMANDS_FIELD, externalCommands, 1);
    })
  );

  // run external tool
  context.subscriptions.push(
    commands.registerCommand("external.run", async () => {
      const config = workspace.getConfiguration(NAMESPACE);
      const externalCommands: ICommand[] =
        config.get<ICommand[]>(COMMANDS_FIELD) || [];

      if (!externalCommands || !externalCommands.length) {
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
        externalCommands.map(c => {
          return {
            label: c.name,
            description: c.command
          };
        })
      );

      if (!selected) {
        return;
      }

      const command = externalCommands.find(c => c.name === selected.label);

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
        context.subscriptions.push(terminal);
      }

      if (config.get<boolean>(SHOW_TERMINAL_FIELD)) {
        terminal.show();
      }

      const scope = {
        projectDir: path.normalize(projectDir),
        filePath: filePath ? path.normalize(filePath) : ""
      };

      if (!!command.cwd && command.cwd !== projectDir) {
        terminal.sendText(`cd ${normalizePath(command.cwd, scope)}`);
      }

      terminal.sendText(normalizePath(command.command, scope));
    })
  );

  // update external tool
  context.subscriptions.push(
    commands.registerCommand("external.update", async () => {
      const config = workspace.getConfiguration(NAMESPACE);
      const externalCommands: ICommand[] =
        config.get<ICommand[]>(COMMANDS_FIELD) || [];

      const selected = await window.showQuickPick(
        externalCommands.map(c => {
          return {
            label: c.name,
            description: c.command
          };
        })
      );

      if (!selected) {
        return;
      }

      const targetCommand = externalCommands.find(
        c => c.name === selected.label
      );

      if (!targetCommand) {
        return;
      }

      const newName: string | void = await window.showInputBox({
        value: targetCommand.name,
        prompt: "Enter The Name of Command"
      });

      if (!newName) {
        return;
      }

      targetCommand.name = newName;

      const newCommand: string | void = await window.showInputBox({
        value: targetCommand.command,
        prompt: "Enter The Raw of Command"
      });

      if (!newCommand) {
        return;
      }

      targetCommand.command = newCommand;

      // update config
      config.update(COMMANDS_FIELD, externalCommands, 1);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  //
}
