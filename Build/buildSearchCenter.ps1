#possible workflow
#incrementby 1
#commit
#tag root
#tag sc folder (possible issues if root needs to be created)
#pull down zip -- (will this be a repo, if so fail)
#upload



#todo
#write colors
#cancel on error
#open powershell
#copy folder
#check for existence of zip, maybe even store 7z in extenal folder
#delete old version
# test for existence before deletion
#update version number
#tag

$filename = "searchcenter.zip"
$deployFolder = "..\deploy\"
$deploylocation = $deployFolder + $filename

Remove-Item $deploylocation
& "C:\Program Files (x86)\7-Zip\7z.exe" a $deploylocation "..\searchcenterExtension\*.*" -r

Start-Process "https://chrome.google.com/webstore/developer/edit/ndfplmdnbnefomnjiknbpejdceedhdmf"

#new-alias  Out-Clipboard $env:SystemRoot\system32\clip.exe
$fullpath = resolve-path $deploylocation | select Path
write-output $fullpath
$fullpath | foreach { $_.Path } | . $env:SystemRoot\system32\clip.exe