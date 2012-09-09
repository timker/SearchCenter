
//******** intial
var bgPage = chrome.extension.getBackgroundPage();
var engines = bgPage.engines;
var displayEngines;
var displayMulti;
var engineList = new engineList();
this.searchText;


function LoadDefaults() {
    log("loading popup");
    logger.log = log;

    SetPageFocus();
    var enginelistElement = document.getElementById("engineList");
    enginelistElement.className = bgPage.settings.smallButtons ? "searchEngineListBase smallEngineList" : "searchEngineListBase searchEngineList";





    displayEngines = new DisplayEngines("engineList");
    //  displayMulti = new DisplayEngines("multiList");

    var searchBox = document.getElementById("searchText");
    searchBox.focus();




    //wires up hotkey events
    // searchBox.addEventListener('keydown', function() {alert('ping') }, false);
    searchBox.addEventListener('keydown', searchTextKeyPress, false);

    searchText = new textBoxManager(bgPage.settings.useSuggest); //come up with a better name than textman & searchttext... textvalueManager
    // this.searchText.init();//since init starts an asyc call to bgpage, must make sure the callback is ready (depends on textManager)


    engines.forEach(function (engine) {
        displayEngines.DrawEngine(engine);
    });




    //set the defaultsearch
    var defaultEngine = bgPage.getDefaultEngine();
    var defaultImage = document.getElementById("defaultSearchImage");
    var defaultSearchDiv = document.getElementById("defaultSearchDiv"); //maybe can attach to image, mouse button may have been dodgy
    defaultSearchDiv.title = defaultEngine.SearchEngineName;
    defaultSearchDiv.setAttribute("onmouseup", "defaultSearch(tabBehaviour.fromMouse(event))");

    //TODO LOW needs to be updated, when order of engines are updated (use nofication)
    defaultImage.src = getCachedImage(defaultEngine.IconUrl);

    //rename to newFeatures or displaynewfeatures
    initFeatures();


    document.body.addEventListener("mouseup", function () { searchText.hideDropDown(); }, false);

    //set search current site
    chrome.tabs.getSelected(null, function (tab) {
        var address = tab.url;
        //bug check that it an actual domain (e.g try doing when from popup.html is in the address bar, could this happen other times?)
        var domain = getDomain(address); //.toString().match(/^https?:\/\/([^\/]*)\//ig)[0];
        log("domain:" + domain);
        var currentSiteImage = document.getElementById("searchCurrentSiteImg");
        currentSiteImage.src = "chrome://favicon/" + domain; //"/images/add.png";

        //get
        currentSiteImage.onload = function () {

            // alert(bgPage.imageCache.toDataUrl(currentSiteImage));
            var currSite = document.getElementById("currentSiteDiv");
            currSite.setAttribute("style", "");
            currSite.title = "search " + domain;
        }

        currentSiteImage.setAttribute("onmouseup", "searchCurrentSite()");
        // currentSiteImage.addEventListener("onmouseup", function () { alert('ping'); }, false);
        //fix  getdomain
        //fix  
        //look for opensearch first, perhaps save it 



    });

}


//************* public methods


//when calling a function from a view
//the 'this' is set to window
//so we set up our own context

this.publicMethods = new function (context) {
    //  var context = context;

    //no real point making it json
    return { selectedTextFound: function (result) {
        context.searchText.setSelectedText(result);
    }
    }


} (this);



function drawEngine(engine) {
    displayEngines.DrawEngine(engine);
}

function openSearchAdded() {
    showStatus("websiteAdded");
};

function addSiteError() {
    showStatus("openSearchError");
};

function addSiteUnsupported() {
    showStatus("noOpenSearch");
}


//************ todo make private


function DisplayEngines(nodeId) {

    var ulCol = document.getElementById(nodeId);

    this.DrawEngine = function (engine) {
        ulCol.appendChild(CreateEngineNode(engine));
    };


    function CreateEngineNode(SearchEngineData) {
        var li = document.createElement("li");
        li.setAttribute("title", SearchEngineData.SearchEngineName);
        li.setAttribute("alt", SearchEngineData.SearchEngineName);
        var div = document.createElement('div');

        div.setAttribute("onmouseup", "engineClick(this,event,'" + SearchEngineData.Id + "')");

        var span = document.createElement('span');
        span.appendChild(document.createTextNode(SearchEngineData.name));

        var img = document.createElement('img');
        img.setAttribute("src", getCachedImage(SearchEngineData.IconUrl));

        div.appendChild(img);
        div.appendChild(span);
        div.setAttribute("class", "searchEngine");


        li.appendChild(div);
        return li;
    }

}


function getCachedImage(imageUrl) {
    return bgPage.getCachedImage(imageUrl);
}

//make obsolete
//refact could renume to currentseachText... could we make it a property?
function GetSearchTerm() {
    return searchText.searchTerm();
}






//******************************* Textbox manager


function textBoxManager(useSuggest) {
    //think about removeing edit mode
    //-3,-2,-1,0[,select],0,1,2,3
    console.log("loading textBoxManager");

    var self = this;
    var editText = ""; //maybe remember the current user key input
    var searchBox = document.getElementById("searchText");
    var suggestList = null;
    var suggestElement = document.getElementById("suggest");
    var suggestDataSource;

    var status = {
        current: null, selection: "selection", edit: "edit", last: "last", suggest: "suggest",
        setStatus: function (mode) {
            this.current = mode;
        },
        isCurrent: function (mode)
        { return current == mode },
        selectedText: null,
        //can we make this into a propery?
        hasSelection: function () { return this.selectedText != null },
        index: 0

    }


    this.init = function () {
        //set last search
        applyLastText();

        //async call to get selected text
        bgPage.getSelection();


        suggestElement.addEventListener('mouseup', suggestionClicked, false);
        //suggestElement.addEventListener('click', suggestionClicked, false);
        suggestElement.addEventListener('dblclick', function (event) {
            defaultSearch(tabBehaviour.fromKeyPress(event));
        }, false);

        searchBox.addEventListener('keydown', SearchTextBoxKeyPress, false);

        //  searchBox.addEventListener('keypress',getSuggestions, false);

        if (useSuggest)
            searchBox.addEventListener('keyup', getSuggestions, false);


        searchBox.addEventListener("mouseup", function (event) {
            if (event.button == 2) {
                if (suggestDataSource === bgPage.searchHistory.history) {
                    //var d = [];
                    displayDropDown();
                } else {
                    displayDropDown(bgPage.searchHistory.history);
                }
            }
            event.stopPropagation();
        }, false);

        // disable context menu
        searchBox.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        document.addEventListener('mousewheel', function (wheelEvent) {
            //should i prevent default?
            //should i do mutile ups for a big scroll
            //analytics would be good to see if anything but 1/-1 is used
            wheelEvent.wheelDelta /* 120*/ > 0 ? up() : down();
        }, false);

        searchBox.addEventListener('keyup', function (keyEvent) {

            if (keyEvent.keyCode == 38 || keyEvent.keyCode == 40) {
                searchBox.select();
            }
        }, false);

    };


    this.setSelectedText = function (text) {

        status.selectedText = text;

        applySelectedText();
    }

    function applySelectedText() {
        status.setStatus(status.selection);
        setSearchText(status.selectedText);
    }
    function applyLastText(index) {
        index = index || 0;
        var text = bgPage.searchHistory.term(index);
        if (text) {
            status.index = index;
            setSearchText(text);
            status.setStatus(status.last);
        }
    }



    function highlightSuggest(index) {

        //check it exists first
        if (suggestList && suggestList[index]) {

            status.setStatus(status.suggest);
            clearSelectedSuggest();
            suggestElement.children[index].setAttribute("style", "background-color:#B5C7DE");
            setSearchText(suggestElement.children[index].innerText);

            status.index = index;
        }

    }


    function applyEditText() {


        status.setStatus(status.edit);
        setSearchText(editText);
    }

    function customTextEntered() {
        //when you enter a key is should to to edit mode
        status.setStatus(status.edit);
        status.index = 0;
    }

    function setSearchText(text) {
        searchBox.value = text;
        searchBox.select();
    }


    //todo turn into property
    this.searchTerm = function () {
        return searchBox.value;
    }


    function SearchTextBoxKeyPress(keyEvent) {

        switch (keyEvent.keyCode) {
            case 38:
                keyEvent.preventDefault();
                up();
                break;
            case 40:
                keyEvent.preventDefault();
                down();
                break;
            default: //should only be called if text changes
                customTextEntered();
        }
        //on backspace
        //todo check that a key has been pressed
    }

    function up() {

        switch (status.current) {
            case status.suggest:
                if (status.index != 0) {
                    highlightSuggest(status.index - 1);
                    break;
                }
                applyEditText();
                clearSelectedSuggest();
                break;

            case status.edit:
                editText = self.searchTerm();
                if (status.hasSelection()) {
                    applySelectedText();
                    break;
                }
            case status.selection:
                applyLastText();
                break;
            case status.last:

                applyLastText(status.index + 1);
                break;

        }

    }

    function down() {
        switch (status.current) {
            case status.last:
                if (status.index > 0) {
                    applyLastText(status.index - 1);
                    break;
                }
                if (status.hasSelection()) {
                    applySelectedText();
                    break;
                }
            case status.selection:
                applyEditText();
                break;
            case status.edit:
                editText = self.searchTerm();
                highlightSuggest(status.index);
                break;
            case status.suggest:
                highlightSuggest(status.index + 1);
                break;
        }
    }

    function clearSelectedSuggest() {
        for (var i = 0; i < suggestElement.children.length; i++) {
            suggestElement.children[i].removeAttribute("style");
        }

    }

    function suggestionClicked(event) {


        if (event.srcElement instanceof HTMLLIElement) {
            switch (event.button) {
                case 0:
                    //                     clearSelectedSuggest();
                    //                     //find  element that matches  and set it to selected
                    //                     status.setStatus(status.suggest);
                    //                     for (var i = 0; i < suggestElement.children.length; i++) {
                    //                         if (suggestElement.children[i] === event.srcElement)
                    //                             status.index = i;
                    //                     }

                    //event.srcElement.setAttribute("style", "background-color:#B5C7DE");
                    setSearchText(event.srcElement.innerText);
                    hideDropDown();
                    break;
                case 1: //middle
                case 2: //right click
                    defaultSearch(tabBehaviour.fromMouse(event), event.srcElement.innerText);
                    break;

            }
        }
        event.stopPropagation();
        event.cancelBubble = true;
    }


    function getSuggestions(event) {
        // log(searchText.searchTerm() + String.fromCharCode(event.charCode));
        if (event.keyCode != 40 && event.keyCode != 38) {
            bgPage.GetJSON("http://clients1.google.com/complete/search?client=chrome&hl=en-GB&q=" + searchText.searchTerm() + String.fromCharCode(event.charCode),
                function (json) {

                    suggestList = json[1];

                    displayDropDown(suggestList);



                });
        }

    }

    function displayDropDown(list) {

        suggestDataSource = list;
        while (suggestElement.hasChildNodes()) {
            suggestElement.removeChild(suggestElement.childNodes[0]);
        }

        if (list && list.length >= 1) {
            suggestElement.style.display = "block";

            list.forEach(function (suggestion) {

                var d = document.createElement("li");
                d.appendChild(document.createTextNode(suggestion));
                suggestElement.appendChild(d);

            });

        } else {
            suggestElement.style.display = "none";
        }

    }

    function hideDropDown() {
        // alert('ping');
        // alert(suggestElement.style.display);
        suggestElement.style.display = "none";
        while (suggestElement.hasChildNodes()) {
            suggestElement.removeChild(suggestElement.childNodes[0]);
        }

    }

    this.init();
    this.hideDropDown = hideDropDown;

};






function searchTextKeyPress(e) {


    if (e.shiftKey && e.keyCode == 13) {
        searchCurrentSite();

    } else {
        switch (event.keyCode) {
            case 13:
                defaultSearch(tabBehaviour.fromKeyPress(e));
                break;
        }
    }
}




/** mouse enum **/

//function mouseClickType() { }

//mouseClickType.calculate = function(event) {
//    //alert(event.button);
//    switch (event.button) {
//        case 0:
//            return mouseClickType.left;
//        case 1: return mouseClickType.middle; //test this!!!
//        case 2: return mouseClickType.right;
//            break;
//    }
//  

//};
////instead if int we could have objects
////and use isLeft(mouseobject) { if is instancof mouseobject}
////try to avoid using == with this
//mouseClickType.left = 0;
//mouseClickType.right = 2;
//mouseClickType.middle = 1;







//turn NEw/Overwirte into objects  tab.IsNew()

function tabBehaviour()
{ };
tabBehaviour.New = 0; //each search is in a new tab
tabBehaviour.OverWrite = 1; //makes the first search to update the current tab, the rest are new
tabBehaviour.Multi = 2; //opens new tabs... but does not close popup
tabBehaviour.fromMouse = function (click) {
    log("mouse");
    switch (event.button) {

        case 0:
            return bgPage.getOpenSearchInSameTab() ? tabBehaviour.OverWrite : tabBehaviour.New;
        case 1: return tabBehaviour.New;
        case 2: return tabBehaviour.Multi;
            break;
    }
};
tabBehaviour.fromKeyPress = function (keyPress) {
    return bgPage.getOpenSearchInSameTab() ? tabBehaviour.OverWrite : tabBehaviour.New;
}



function engineClick(sender, event, engineId) {
    var tabAction = tabBehaviour.fromMouse(event);
    switch (tabAction) {
        case tabBehaviour.Multi:
            //multiClick(sender,engineId);
            searchById(engineId, GetSearchTerm(), false);
            break;
        case tabBehaviour.New:
            searchById(engineId, GetSearchTerm(), false);
            break;
        case tabBehaviour.OverWrite:
            searchById(engineId, GetSearchTerm(), true);
            break;
    }


    if (event.button == 0) {
        window.close();
    }
    event.cancelBubble = true;
    return true;
}


//TODO multi click is no longer used... remove
function multiClick(sender, engineId) {
    var eng = engines.findEngineById(engineId);

    if (sender.getAttribute("selected")) {
        sender.removeAttribute("selected");
        engineList.remove(engineId);
    }
    else {
        engineList.add(engineId);
        sender.setAttribute("selected", "selected");
    }
}

//TODO background
function searchById(engineId, terms, sameWindow) {

    //may have to push last engine Id on
    engineList.add(engineId);
    log(engineList.returnList());
    bgPage.searchList(engineList.returnList(), terms, sameWindow);

    //reset
    engineList.clear();

    //maybe this engine list should be passed in
    ////////////    engineList.forEach(function(currentEngineId) {
    ////////////        if (engineId != currentEngineId)//don't search on last pressed 
    ////////////        {
    ////////////            bgPage.searchById(currentEngineId, terms, false);
    ////////////        } else {
    ////////////            //already selected so assume the window wants to be opened in the background
    ////////////            sameWindow = false;
    ////////////        }
    ////////////    });
    ////////////    return bgPage.searchById(engineId, terms, sameWindow);




}

//TODO background
function searchByEngine(engine, terms, sameWindow) {
    return bgPage.searchByEngine(engine, terms, sameWindow);
}

//todo try not to directly use this as it is only for item that don't exist in the enginelist
//todo background... mybe even make private
//e.g a google sitesearch
//in the future thing like last engine used won't work here
function searchByUrl(url, terms, sameWindow) {
    return bgPage.searchByUrl(url, terms, sameWindow);

}


//could compile this in background page
function defaultSearch(tabAction, searchQuery) {
    var sameWindow = tabAction == tabBehaviour.OverWrite;

    if (!searchQuery) {
        searchQuery = GetSearchTerm();
    }

    bgPage.defaultSearch(searchQuery, sameWindow);
    //todo should call tabAction.shouldClose()
    if (tabAction != tabBehaviour.Multi)
        window.close();
}

//TODO should we move this into searchHelper also would have to return engine (which may involve a temp googlesite engine
function searchCurrentSite() {
    //get current domain
    chrome.tabs.getSelected(null, function (tab) {

        var address = tab.url;
        //bug check that it an actual domain (e.g try doing when from popup.html is in the address bar, could this happen other times?)
        var domain = getDomain(address); //.toString().match(/^https?:\/\/([^\/]*)\//ig)[0];
        log("domain:" + domain);

        bgPage.searchDomain(domain, GetSearchTerm());
    });

}

function log(message) {
    console.log(message);
    bgPage.log(message);
}

function inspect(obj) {
    bgPage.inspect(obj);
}

function showOptionsPage() {
    chrome.tabs.create({ url: "options.html" });
}

function openNewPage(anchor) {
    chrome.tabs.create({ url: anchor.href });
    return false;
}

//**************************************************************//

function initFeatures() {
    if (bgPage.version.hasNewFeatures()) {
        showElement('newFeatures');
    }
}


function viewFeaturePage() {
    chrome.tabs.create({ url: "features.html" });
    hideFeatures();
}


function hideFeatures() {
    bgPage.version.disableNewFeatures();
    hideElement('newFeatures');
}


//************************ manage engines ***********************//


function addCurrentSite() {
    showStatus("loading");
    log("loading");
    bgPage.addCurrentWebsite();
}

function showStatus(code) {
    switch (code) {

        case "loading":
            hideElement("addSite");
            showElement("loading");
            break;
        case "noOpenSearch":
            hideElement("addSite");
            hideElement("loading");

            //todo should strip http:// and trailing slash
            chrome.tabs.getSelected(null, function (tab) {
                document.getElementById("mycroftLink").href = "http://mycroft.mozdev.org/search-engines.html?name=" + getDomain(tab.url) + "&opensearch=yes";
            });
            showElement("addFailed");
            showElement("noOpenSearch");
            break;
        case "openSearchError":
            hideElement("addSite");
            hideElement("loading");

            showElement("addFailed");
            showElement("openSearchError");
            break;
        case "websiteAdded":
            hideElement("addSite");
            hideElement("loading");
            showElement("websiteAdded");
            break;

    }

}

function showElement(elementName) {
    var element = document.getElementById(elementName);
    element.style.display = "block";
    element.style.visibility = "visible";
}

function hideElement(elementName) {
    var element = document.getElementById(elementName);
    element.style.display = "none";
}
