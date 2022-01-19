# MemFS

Original example from Microsoft - 
https://github.com/microsoft/vscode-extension-samples/tree/main/fsprovider-sample
It was modified to meet condition for issue reproduction

Step to reproduce issue(MS Windows was used):

1. install this extension
2. Run extension
3. Open any folder on your PC.
4. Execute command `Create Virtual File and Open`("memfs.init"). Command does following:
4.1. Command creates virtual file based on opened folder path by appending `dummy/subfolder/test.txt'`.
4.2. Command opens TextEditor for created virtual file .
5. Change content of file and save

Problem, watcher triggers are not executed. Info message should appear if watcher triggers(`showInformationMessage` is used in watcher).
Following watchers were used - https://github.com/815are/virtualFileWatchIssue/blob/main/src/extension.ts#L70-L77

Scenario work fine in VSCode 1.63.2 and below. Issue happens only in VSCode Insiders 1.64.0
