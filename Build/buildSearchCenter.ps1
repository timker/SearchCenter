#todo
#check for existance of zip, maybe even store 7z in extenal folder
#delete old verson
# test for existance before deletion
#update vesion number

$deploylocation = "..\deploy\searchcenter.zip"
Remove-Item $deploylocation
& "C:\Program Files (x86)\7-Zip\7z.exe" a $deploylocation "..\searchcenterExtension\*.*" -r