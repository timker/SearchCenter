/* Logger */
/* this should be overridable in subsuquest page, i.e bgPage, optionsPage, PopupPage */

var logger = (function () {
    var myLogger = {};

    // basic logger that should be overridden 
    myLogger.log = function (value) {
        if (console) {
            console.log(value); 
        }
    }

    return myLogger;
} ());


/* InitPage */
/* set Focus */

/// due to a bug in chrome 18 normal page textbox focus does not work in a popup
///... this is the workaround 
// todo this should not be in common as it's popup specfifc
function setPageFocus() {
    if (location.search !== "?foo") {
        location.search = "?foo";
    }
}

/* Url Helper */
// todo obsolete this with a url helper
function getDomain(address) {
    logger.log("attempting to grab domain");
    logger.log(address); //should return newtab?
    return address.toString().match(/^https?:\/\/([^\/]*)\//ig)[0];
}


//a whole domina/url object
//isUrl
//getparams
//getport
//etc
//getprotocal
//gethost
