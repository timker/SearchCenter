

//find all openseach links
var result = document.evaluate(
      '//*[local-name()="a"][contains(@onclick, "addOpenSearch")]',
      document, null, 0, null);


//get all opensearch elements
var anchorList = [];
while (item = result.iterateNext()) {
    //we can't modify html here or it will cause an exception with the iterator
   anchorList.push(item);
}

//console.log(anchorList.length);
for (elementIndex in anchorList) {
    var element = anchorList[elementIndex];
    
    //element.onclick.toString()    function onclick(event) { addOpenSearch('IMDb','ico','','13127','g');return false }

    //find the function arguments
    var arglist = element.onclick.toString().match(/addOpenSearch\(([^\)]*)/)[1]; //'IMDb','ico','','13127','g'
    var argArray =arglist.replace(/\'/g, "").split(",");// remove ''s and turn into array
    
    //http://mycroft.mozdev.org/installos.php/" + pid + "/" + name + ".xml
    //create open search definition link
    var osDefLoc = "http://mycroft.mozdev.org/installos.php/" + argArray[3] + "/" + argArray[0] + ".xml";




    var a = document.createElement('a');
    a.setAttribute("onclick", "return false;");
    a.setAttribute("href", osDefLoc);
    
  
    var img = document.createElement("img");
    img.setAttribute("src",chrome.extension.getURL("images/spinWorld.png"));
    img.setAttribute("width", "16");
    img.setAttribute("class", "icon");
    img.setAttribute("alt", "click to add to search center");
    img.setAttribute("title", "click to add to search center");
    a.appendChild(img);

    element.parentNode.insertBefore(a, element);

    a.addEventListener('click', function() {
        //notify background page
        chrome.extension.sendRequest({ msg: "openSearch", found: true, href: this.href });
      //  alert(this.href);
    });
}



