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


function OpenInstallLocation (){
    write-Host "opening webstore" -foreground "yellow"
    Start-Process "https://chrome.google.com/webstore/developer/edit/ndfplmdnbnefomnjiknbpejdceedhdmf"
}

function CopyText ($text) {
#http://technet.microsoft.com/en-us/library/ee177031.aspx
#http://www.itidea.nl/index.php/powershell-choose-between-colored-host-text-or-write-to-an-output-file-not-anymore/
 write-Host "currently broken" -foreground "red"
    write-Host "cp text" -foreground "yellow" -nonewline;
write-Host  $text -foreground "yellow"
}
#new-alias  Out-Clipboard $env:SystemRoot\system32\clip.exe
$fullpath = resolve-path $deploylocation | select Path
write-Host copying $fullpath -foreground "yellow"
#write-host (2 + 2) -foreground "magenta"
$fullpath | foreach { $_.Path } | . $env:SystemRoot\system32\clip.exe

#OpenInstallLocation
$fullpath | foreach { $_.Path } | CopyText
#CopyText "asdf"