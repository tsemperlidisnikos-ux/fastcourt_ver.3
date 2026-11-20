' Double-click this if start.bat window closes instantly.
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = folder
sh.Run "cmd.exe /k """ & folder & "\start.bat""", 1, False
