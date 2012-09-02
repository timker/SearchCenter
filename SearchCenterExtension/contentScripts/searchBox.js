//features
//tabbing highlights, and says full name on the end space searches
//enter on a tabbed button searchs possible same window, space always new
//left and right cycle tab engines


//animate search box
//search current site
//get selected text
//update selected text

//set up history
//set up suggestions

//show a searh this site button... could you use a fav icon

//turn /t to highlight engines

//right click open in new window

//ctrl Q toggles (the off part is in here, the on part only get fired once)
//customise shortcut key


//look for opensearch
//add open search to a list

//button on the left with dropsdown/shows options, if there is new features changes icon
//adv update view on add and delte engines

//make box transparent?
//add cross to box
//check many engines
//should enter disappear it?

//enter:
//new tab
//same tab behind
//tab behind focused

//currrent site
//default site
//ctrl enter current site
var scBox;
var input;
var port;
var searchListElement;

(function init() {
    port = chrome.extension.connect({ name: "searchBox" });
    port.onMessage.addListener(function(message) {

        console.log(message);
        if (message.name == "engineList") {
            drawEngines(message.engines);
        }
        if (message.name == "hotKey")
        {
        document.addEventListener('keydown', keyPress(message.info), false);
      //  alert('hkjs');
        }

    });
    drawSearchBar();
})();

function drawSearchBar() {
    //    img.setAttribute("src", getCachedImage(SearchEngineData.IconUrl));
    //    type="text"/>
    scBox = document.getElementById("searchCenterSearchBox");
    input = document.getElementById("searchCenterInput");
    if (!scBox) {
        scBox = document.createElement("div");
        scBox.setAttribute("class", "searchCenterSearchBox searchCenterSearchBoxHide");

        input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "searchCenterInput")

        searchListElement = document.createElement("ul");
        searchListElement.setAttribute("class", "smallEngineList");
        scBox.appendChild(input);


        var closeElement = document.createElement("div");
        closeElement.setAttribute("class", "section-close-button");
        closeElement.addEventListener("click",closeSearchBar,false);

        scBox.appendChild(closeElement);
        scBox.appendChild(searchListElement);
        document.documentElement.appendChild(scBox);



        //these should allbe inside the if!!!!
        port.postMessage({ name: "getEngines" });

        input.addEventListener('keydown', searchTextKeyPress, false);
        input.value = selectedText();
        input.select();
          scBox.setAttribute("class", "searchCenterSearchBox");
    }




    //document.documentElement.addEventListener('select', selectChanged, false);
    //set it to update when selected text changes
};

function selectChanged(e) {
    //alert('select changes');
}


function engineClick(event) {
    //get left
    //right
    //middle
    console.log(this);
    console.log(event);
    console.log(this.engine);
   
}
function eClick(engine) {

    return function(event) {
        console.log(this);
        console.log(engine);
        console.log(event);
        var sameWindow = event.which == 1;
        console.log(engine);
        port.postMessage({ name: "searchEngines", terms: input.value, sameWindow: sameWindow, engines: [engine] });

        //event.cancelBubble = true;

        return false;
    };
   
};
function searchTextKeyPress(e) {

    if (e.shiftKey && e.keyCode == 13) {
       // searchCurrentSite();

    } else {
        switch (event.keyCode) {
            case 13:
                autoSearch();
                break;
        }
    }
}

function autoSearch() {
//    chrome.extension.sendRequest({ msg: "defaultSearch", href: address, favIcon: favIcon, engineName: engineName });
    chrome.extension.sendRequest({ msg: "defaultSearch",terms:input.value });
    //get search text
    //send to bgpage
}


function drawEngines(engineList) {

    engineList.forEach(function(engine, index, array) {
        searchListElement.appendChild(drawEngine(engine));
    });

    port.postMessage({ name: "hotKey" });
}

function drawEngine(engine) {
    
    this.engine = engine;

    var li = document.createElement("li");
    var div = document.createElement("div");
    var a = document.createElement("a");
    var img = document.createElement('img');

    //img.setAttribute("src", getCachedImage(SearchEngineData.IconUrl));
    img.setAttribute("src", engine.IconUrl);

    a.setAttribute("oncontextmenu", "return false;");

    a.addEventListener("contextmenu", function(e) { e; e.defaultPrevented = true; e.cancelBubble = true; console.log(e); return false; }, false)

    a.addEventListener('mouseup', eClick(engine), false);
    a.setAttribute("title", engine.name);
    a.href = "#";
    a.onclick = function() { return false; }; //cancels the default behaviour
    div.setAttribute("class", "searchEngine");

    div.appendChild(img);
    a.appendChild(div);
    li.appendChild(a);
    return li;
    

}


function closeSearchBar() {
    scBox.setAttribute("class", "searchCenterSearchBox searchCenterSearchBoxHide");
}


function keyPress(info)
{
    return function (e) {
        if (e.keyCode == info.keyCode && e.ctrlKey == info.ctrlKey && e.shiftKey == info.shiftKey && e.altKey == info.altKey) {

            if (scBox.getAttribute("class") == "searchCenterSearchBox") {
                scBox.setAttribute("class", "searchCenterSearchBox searchCenterSearchBoxHide");
                input.blur();
            } else {
                scBox.setAttribute("class", "searchCenterSearchBox");
                var selText = selectedText()
                if(selText.length >=1 )
                    input.value = selText;
                input.select();
            }

        };
    }
}



//might need to put this in another class (same as the popup)
//also can prolly do this better now
function selectedText() {
    var selection = window.getSelection().toString();

    var iframes = document.getElementsByTagName("iframe");

    for (var j = 0; j < iframes.length; j++) {
        try {

            var domselection = iframes[j].contentDocument.getSelection();

            if (domselection.type != "None") {
                if (domselection.toString() != "") {
                    selection = domselection.toString();
                }
            }

        } catch (err) {
            console.log("iframe selection error, probably a different domain");
        }
    }
    return selection;
}
