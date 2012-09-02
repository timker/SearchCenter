
 //TODO also has to return the new search terms (-the shortcuts)
 //TODO should be able to work with w instead of /w
function searchHelper() {



    //this.getDefaultEngine = function()
    //{
        //use last?
        //has last
        //get last


        //get first


        //needs access to engines
    //needs access to backgriund getlast
    
    //};


    this.isUrl = function(terms) {
        var urlReg = new RegExp("^https?:\/\/[^ ]+$", "i");
        return urlReg.test(terms);
    };


    this.hasMatchingWindow = function(terms, callback) {
        if (terms.length >= 1 && terms.charAt(0) == "?") {
            terms = terms.substring(1, terms.length);

            chrome.windows.getAll({ "populate": true }, function(wins) {
                var found = false;
                var lowerterm = terms.toLowerCase();
                for (var i in wins) {
                    var win = wins[i]; console.log("window " + win.id);
                    for (var j in win.tabs) {
                        var tab = win.tabs[j]; console.log("  tab " + tab.id + " " + tab.url);

                        if (tab.url.toLowerCase().indexOf(lowerterm) >= 0 || tab.title.toLowerCase().indexOf(lowerterm) >= 0) {//should only work on domains
                            //tab.selected = true;

                            log("found!");
                            found = true;
                            chrome.tabs.update(tab.id, { selected: true });

                        }
                    }
                }
                if (!found) {
                    callback(terms);
                }

            });
        } else {
            callback(terms);
        }
    }
//could pass in an iterator/delegate instead of engines
    this.getCuts = function(terms, engines) {
        log("Cuts");
        var cutReg = new RegExp("(^| )\/([A-Za-z?])(?=($| ))", "ig");
        var result = {};


        //get list of keys
        var shortcuts = terms.match(cutReg); //has to have space or end after it

        if (!shortcuts)
            return null; // no shortcuts found



        log("shortcut syntax found");
        //start or space then a /, then a letter  then a space or endline
        //Question should we remove all shortcutkey or just the ones with found engines?
        result.terms = terms.replace(cutReg, "").trim();

        //get shortcuts letters
        var shortcutChars = [];
        shortcuts.forEach(function(cut) {
            shortcutChars.push(cut.charAt(cut.length - 1).toLowerCase());
        });


        result.engines = engines.findEnginesByKey(shortcutChars);
        //var foundEngines = engines.findEnginesByKey(shortcutChars);
        //log(foundEngines);


        if (result.engines.length == 0) {
            return null;
        }

        return result;
        //if (foundEngines.length > 0) {

        // foundEngines.forEach(function(engine, index) {
        //     if (index == 0) {
        //         //first is the default
        //         searchEngine(term, engine, bgPage.getOpenSearchInNewTab());
        //     } else {
        //         //open the rest in the background 
        //         searchEngine(term, engine, true);
        //     }

        //});
        //    return true;
        //}

    };

 


       



}
