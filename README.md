# MemFS

Original example from Microsoft - 
https://github.com/microsoft/vscode-extension-samples/tree/main/fsprovider-sample
It was modified to meet condition for issue reproduction

Step to reproduce issue(MS Windows was used):

- install this extension
- Run extension
- Open any folder on your PC.
- Execute command `Create Virtual File and Open`("memfs.init"). Command does following:
    - Command creates virtual file based on opened folder path by appending `dummy/subfolder/test.txt'`.
    - Command opens TextEditor for created virtual file .
- Change content of file and save

Problem, watcher triggers are not executed. Info message should appear if watcher triggers(`showInformationMessage` is used in watcher).
Following watchers were used - https://github.com/815are/virtualFileWatchIssue/blob/main/src/extension.ts#L70-L77

Scenario work fine in VSCode 1.63.2 and below. Issue happens only in VSCode Insiders 1.64.0
