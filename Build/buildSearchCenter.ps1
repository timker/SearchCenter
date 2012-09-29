#todo
#open powershell

#check for existance of zip, maybe even store 7z in extenal folder
#delete old verson
# test for existance before deletion
#update version number
#tag

$deploylocation = "..\deploy\searchcenter.zip"
Remove-Item $deploylocation
& "C:\Program Files (x86)\7-Zip\7z.exe" a $deploylocation "..\searchcenterExtension\*.*" -r



Start-Process "https://chrome.google.com/webstore/developer/edit/ndfplmdnbnefomnjiknbpejdceedhdmf"

