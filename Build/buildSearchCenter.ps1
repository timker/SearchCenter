cls
#possible workflow
#incrementby 1
#commit
#tag root
#tag sc folder (possible issues if root needs to be created)
#pull down zip -- (will this be a repo, if so fail)
#upload



#todo
#pass in variables... make is more lib like
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

function DeletePreviousItem () {
# needs to ignore errors
Remove-Item $deploylocation
}

function ZipFilesInFolder {
#should pass files location and destination
& "C:\Program Files (x86)\7-Zip\7z.exe" a $deploylocation "..\searchcenterExtension\*.*" -r
}

function OpenInstallLocation (){
    write-Host "opening webstore" -foreground "yellow"
    Start-Process "https://chrome.google.com/webstore/developer/edit/ndfplmdnbnefomnjiknbpejdceedhdmf"
}

function CopyText ($text) {
    #$fullpath | foreach { $_.Path } | . $env:SystemRoot\system32\clip.exe
    #new-alias  Out-Clipboard $env:SystemRoot\system32\clip.exe
    $text | . $env:SystemRoot\system32\clip.exe
    Write-Host "copied text: " -foreground "blue" -nonewline;
    write-Host   $text
}

DeletePreviousItem
ZipFilesInFolder
OpenInstallLocation

$fullpath = resolve-path $deploylocation
CopyText $fullpath.Path 
