var bgPage = chrome.extension.getBackgroundPage();

document.addEventListener("DOMContentLoaded", load, false);

function load() {
    document.getElementById("installed").innerText = "Installed:" + bgPage.version.installedAt + " Updated:" + bgPage.version.updatedAt;

    //getElementsByClassName

//              var allParas = document.getElementsByTagName("p");
//              console.log(allParas);
//              for (var index in allParas) {
//                  console.log(allParas[index]);
//
//                  allParas[index].addEventListener('click', function() { alert('tggle') }, false);

    //   }
//foreach
//              var num = allParas.length;

//              alert("There are " + num + " <p> elements in this document");

}