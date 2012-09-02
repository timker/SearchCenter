
//<link rel="search" type="application/opensearchdescription+xml" href="http://www.metafilter.com/opensearch.xml" title="MeFi Site Search">
//<link rel="alternate" type="application/rss+xml" title="MetaFilter Posts" href="http://feeds.feedburner.com/Metafilter">


console.log("run in open Search script");
containsTrainingData()  || containsOpenSearch();



function containsTrainingData() {
    var address = document.URL;
    
    //^https?:\/\/.*\/.*searchcenter
    if (address.search(/^https?:\/\/.*\/.*searchcenter/ig) != -1)// ? address : null;
    {
 
        //consider moving all this into background or popup page and passing refernce to document... this will give us more power (compiled regex, reuseable functions)
        var favIcon = getFavIcon(address);
        var engineName = getSiteName(address);

        chrome.extension.sendRequest({ msg: "trainedSearch", href: address, favIcon: favIcon, engineName: engineName });
        console.log("found training data");
        return true;
    }
    console.log("no training data");
    return false;
}

function containsOpenSearch() {
    // Find all the openQuery link elements.
    
    var result = document.evaluate(
      '//*[local-name()="link"][@type="application/opensearchdescription+xml"][@rel="search"]',
      document, null, 0, null);



    var item = {};
    
    while (item = result.iterateNext()) {
        console.log("found open search");

        //i guess href could be blank
        //or could be multiple open searches
        chrome.extension.sendRequest({ msg: "openSearch", found: true, href: item.href });
        return true;
    }
    //send failed message
    chrome.extension.sendRequest({ msg: "openSearch", found: false, href: null });

    return false;    
}


function getFavIcon(url) {
    console.log("looking for Icon");
    //var result  =document.evaluate
 
    //look at making this xpath look more like /html/head/link[@rel=]
    //since Shortcut icon has many casing we use this translate hack make it work... not sure why lower case doesn't work.
    var result = document.evaluate(
      '//*[local-name()="link"][@rel="icon" or translate(@rel,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="shortcut icon"]',
      document, null, 0, null);


    var item = {};

    while (item = result.iterateNext()) {
        console.log("Found Icon");
        console.log("Icon:" +item.href);
        return item.href;
    }
    
    
    //if not in page... just check the to see if it exists
    //if not look for it in domian/favicon.ico
    //http: //www.google.com/favicon.ico

    //TODO should use the location object
    var domain = url.toString().match(/^https?:\/\/([^\/]*)\//ig);
    var favIconUrl = domain + "favicon.ico";

    var imageRequest = new XMLHttpRequest();
    
    imageRequest.open("GET", favIconUrl, false); //should probably make this async
    imageRequest.send(null);
    console.log("status:"+imageRequest.status);
    if (imageRequest.status == 200) {
        return favIconUrl;
    }

    console.log("no find");
    return "/images/blankIcon.png";
}

function getSiteName(address) {
    //TODO compile and avoid the //comment part
    //compile propably won't help in a script
    
    
    //TODO should use the location object
    return address.toString().match(/^https?:\/\/(www.)?([^\/]*)\//i)[2];
}