/*---------------------------------------------------------
 * Copyright (C) Keyoti Inc. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { posix } from 'path';


export function activate(context: vscode.ExtensionContext) {

	// Runs 'Change All End Of Line Sequence' on all files of specified type.
	vscode.commands.registerCommand('keyoti/changealleol', async function () {

		async function convertLineEndingsInFilesInFolder(folder: vscode.Uri, fileTypeArray: Array<string>, newEnding: string): Promise<{ count: number }> {
			let count = 0;
			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {

				if (type === vscode.FileType.File && fileTypeArray.filter( (el)=>{return name.endsWith(el);} ).length>0){ 
					const filePath = posix.join(folder.path, name);
					
					var doc = await vscode.workspace.openTextDocument(filePath);
						
					await vscode.window.showTextDocument(doc);
					if(vscode.window.activeTextEditor!==null){
						await vscode.window.activeTextEditor!.edit(builder => { 
							if(newEnding==="LF"){
								builder.setEndOfLine(vscode.EndOfLine.LF);
							} else {
								builder.setEndOfLine(vscode.EndOfLine.CRLF);
							}
							count ++; 
						});
						
					} else {
						vscode.window.showInformationMessage(doc.uri.toString());
					}
				}

				if (type === vscode.FileType.Directory && !name.startsWith(".")){
					count += (await convertLineEndingsInFilesInFolder(vscode.Uri.file(posix.join(folder.path, name)), fileTypeArray, newEnding)).count;
				}
			}
			return { count };
		}

		let options: vscode.InputBoxOptions = {prompt: "File types to convert", placeHolder: ".cs, .txt", ignoreFocusOut: true};
		let fileTypes = await vscode.window.showInputBox(options);
		fileTypes = fileTypes!.replace(' ', '');
		let fileTypeArray: Array<string> = [];

		let newEnding = await vscode.window.showQuickPick(["LF", "CRLF"]);

		if(fileTypes!==null && newEnding!=null){
			fileTypeArray = fileTypes!.split(',');
		
			if(vscode.workspace.workspaceFolders!==null && vscode.workspace.workspaceFolders!.length>0){
				const folderUri = vscode.workspace.workspaceFolders![0].uri;
				const info = await convertLineEndingsInFilesInFolder(folderUri, fileTypeArray, newEnding);
				vscode.window.showInformationMessage(info.count+" files converted");
			
			}
		}
		
	});

}
