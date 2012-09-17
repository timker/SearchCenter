var backgroundPage = chrome.extension.getBackgroundPage();
var engines = backgroundPage.engines;
// var editEngine;
var currentDragElement;

Element.prototype.addClass = function (value) { this.className = this.className + " " + value; };

//can we make this private
function load() {

    //set debug mode
    if (backgroundPage.settings.debugMode) {
        //todo if body already has a class name it will be over written
        //http://stackoverflow.com/questions/195951/change-an-elements-css-class-with-javascript
        document.body.className = "";
    }

    var trash = document.getElementById("trash");

    trash.addEventListener("dragover", function (event) {
    //event.dataTransfer.dropEffect = "copy";
    //event.dataTransfer.dropEffect = "move";
        //log(event);
        event.preventDefault();
        return false;
    }, false);

    trash.addEventListener("dragenter", function (event) {
        //trash.style.backgroundColor = "#B5C7DE";
        // alert(event.dataTransfer.getData("text/plain"));
        log("event data");
        //log(event.dataTransfer.getData("text/plain"));
    }, false);
    trash.addEventListener("dragleave", function (event) {
        //trash.style.backgroundColor = "";
    }, false);
    trash.addEventListener("drop", function (event) {
        log(event.dataTransfer.getData("text/plain"));
         //  alert(event.dataTransfer.getData("text/plain"));
        log(event.dataTransfer);

         // event.dataTransfer.setData("text/plain", "Delete");
         //log(event.dataTransfer.getData("text/plain"));
        log("dropEnd");
        if (currentDragElement.engine) {
             //alert("engine");
            engines.deleteEnginesById(currentDragElement.engine.Id);
            currentDragElement.parentNode.removeChild(currentDragElement);
            log("deleted engine");
            showUserMessage("engine deleted");
        }
        if (currentDragElement.engineGroup) {
            engines.deleteEnginesById(currentDragElement.engineGroup.Id);
            currentDragElement.parentNode.removeChild(currentDragElement);
            log("deleted engineGroup");
            showUserMessage("engine Group deleted");
        }
        event.preventDefault();
         //since the dragend event wron't fire if it's deleted
         //document.body.className = "";
        trash.style.backgroundColor = "";


    }, false);

    var addEngineButton = document.getElementById("addEngineButtton");
    addEngineButton.addEventListener("click", engineDialogManager(), false);

    var addGroup = document.getElementById("addGroupButton");

    addGroup.addEventListener("click", function (event) {
        showGroupEngineDialog()();
//////                var engGroup = new engineGroup();
//////                engGroup.name = "Group";
//////                engGroup.IconUrl = chrome.extension.getURL("/images/folder.png");
//////                engGroup.Id = engine.CreateId(); //todo move CreateId somewhere... inheritance?
//////                engines.addEngine(engGroup);
//////                // redrawEngines();
    }, false);



    var groupPopup =  document.getElementById("engineGroupEdit");

    groupPopup.addEventListener("dragover", function (event) {
        event.stopPropagation();
        event.preventDefault();
    }, false);
    groupPopup.addEventListener("drop", function (event) {
        log(event);
    }, false);


//            group.addEventListener("dragover", function(event) {
//                event.preventDefault();
//             },false);
//            group.addEventListener("drop", function(event) {
//
     //             }, false);


    loadEngines();
    showUserMessage("tip: Click an engine or engine group to edit it");
    document.getElementById("bottomMenu").className = "bottomMenuContainer bottomMenuContainerShow";
}


//*************** public methods ****************//
function drawEngine(item) {
    var engineDom = document.getElementById("engineElements");
    drawItem(engineDom, item);
}

//        function deleteEngine(sender,searchId) {
//            engines.deleteEnginesById(searchId);
//            sender.parentNode.parentNode.removeChild(sender.parentNode);
//            showUserMessage("Website deleted");
//        }

//        function moveEngine(sender, searchId,direction) {
//            if (engines.moveEngine(searchId, direction)) {
//                redrawEngines();
//             }
//         }


function redrawEngines() {
    //refresh engine list
    var engineDom = document.getElementById("engineElements");

     //removes engine html
     //todo make into prototype remove childnodes
    while (engineDom.hasChildNodes()) {
        engineDom.removeChild(engineDom.childNodes[0]);
    }
    loadEngines();
}

function loadEngines() {
    var engineDom = document.getElementById("engineElements");
    engines.forEach(function (item) { drawItem(engineDom, item); });
}

function drawItem(engineDom,item) {
    if (item.Engines) {//todo need a better way to tell if it's an engine/enginegroup
        engineDom.appendChild(displayEngineGroup(item));
    } else {
        engineDom.appendChild(displayEngine(item));
    }
}


function displayEngineGroup(engGroup) {
    var li = document.createElement("li");
    li.setAttribute("draggable", "true");
    //li.addClass("engineDraggable");
    // li.addClass("engineGroup");

    li.addEventListener("click", showGroupEngineDialog(engGroup), false);
    li.engineGroup = engGroup; //do we have to set this here? can we get rid of it?


    li.addEventListener("dragstart", function(event) {
        log(event);
        currentDragElement = this;
        log("gdrag");
        log(currentDragElement);
        //event.dataTransfer.effectAllowed = "copy";
        document.body.addClass("trashable");
        document.body.addClass("mainMoveable");
    }, false);


    li.addEventListener("dragend", function (event) {
        ResetDragAnimation();
    }, false);

    var copyEngineDropDiv = document.createElement("div");

    copyEngineDropDiv.className = "copyEngineDrop";
    copyEngineDropDiv.addClass("canGroupDrop");

    copyEngineDropDiv.addEventListener("drop", function (event) {
            //not a fan of using currentDragElement, but it's the only thing that seams to work
        log("engines");
        log(engines);
        engines.copyEngineToGroup(currentDragElement.engine, li.engineGroup);
        //li.engineGroup.CopyNewEngine();
        currentDragElement = null;
        redrawEngines();
        ResetDragAnimation();
    }, false);
    copyEngineDropDiv.addEventListener("dragover", function (event) {
        //make into actual function
        event.target.style.backgroundColor = "#B5C7DE";
        event.dataTransfer.dropEffect = "move";
        //event.dataTransfer.dropEffect = "copy";
        event.preventDefault();

    }, true);
    copyEngineDropDiv.addEventListener("dragleave", function (event) {
        event.target.style.backgroundColor = "";
    }, false);

    li.appendChild(CreateMoveArea("moveEngineUpDrop", engGroup, moveAbove));
    li.appendChild(CreateMoveArea("moveEngineDownDrop", engGroup, moveBelow));
    li.appendChild(copyEngineDropDiv);
    var engineGroupDiv = document.createElement("span");
    engineGroupDiv.setAttribute("class", "searchEngineBubble");
    var img = document.createElement("img");
    img.setAttribute("src", engGroup.IconUrl);
    engineGroupDiv.appendChild(img);
    engineGroupDiv.appendChild(document.createTextNode(engGroup.name));
    li.appendChild(engineGroupDiv);


    engGroup.Engines.forEach(function(engine) {
        //var eImg = document.createElement("img");
        //eImg.setAttribute("src", engine.IconUrl);
        var eImg = document.createElement("img");
        eImg.className = "EngineImageButton";
        //eImg.engine = engine;
        //eImg.width = 16;
        eImg.setAttribute("title", engine.SearchEngineName);
        eImg.setAttribute("alt", engine.SearchEngineName);
        eImg.setAttribute("draggable", "true");

       // eImg.addEventListener("click", showEditEngine(engine), false);

        eImg.addEventListener("click", engineDialogManager(engine), false);
        eImg.engine = engine;
        eImg.addEventListener("dragstart", function(event) {
            currentDragElement = this;
            event.cancelBubble = true;

            document.body.addClass("trashable");
            document.body.addClass("groupable");


        }, false);
        eImg.addEventListener("dragend", function (event) {
            currentDragElement = null;
            ResetDragAnimation();

        }, false);

        eImg.src = engine.IconUrl;
        li.appendChild(eImg);

    });

    return li;
}


function CreateMoveArea(className, item, moveNav) {
    var moveUpEngineDropDiv = document.createElement("div");
    moveUpEngineDropDiv.className = className; //"moveEngineUpDrop";
    moveUpEngineDropDiv.addClass("moveable");
    moveUpEngineDropDiv.addEventListener("dragover", function (event) {
        event.target.style.backgroundColor = "#B5C7DE";
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
    }, false);

    moveUpEngineDropDiv.addEventListener("dragleave", function (event) {
        event.target.style.backgroundColor = "";
    }, false);

    //must pass current engine to
    moveUpEngineDropDiv.addEventListener("drop", moveNav(item), false);

    return moveUpEngineDropDiv;
}


function moveAbove(targetItem) {
    return function (event) {
       // alert('aboce');
        var item;

        if (currentDragElement.engine) {
            item = currentDragElement.engine;
        } else {
            item = currentDragElement.engineGroup;
        }

        engines.moveEngineBelow(item, targetItem);
        currentDragElement = null;
        redrawEngines();
    }
}

function moveBelow(targetItem) {
    return function (event) {

        var item;
        if (currentDragElement.engine) {
            item = currentDragElement.engine;
        } else {
            item = currentDragElement.engineGroup;
        }

        engines.moveEngineAbove(item, targetItem);
        currentDragElement = null;
        redrawEngines();
    };
}


function displayEngine(engine) {
    var li = document.createElement("li");
    li.engine = engine;
    li.addEventListener("click", engineDialogManager(engine), false);
    li.appendChild(CreateMoveArea("moveEngineUpDrop", engine, moveAbove));
    li.appendChild(CreateMoveArea("moveEngineDownDrop", engine,moveBelow));
    var engineDiv = document.createElement("span");
    engineDiv.setAttribute("class", "searchEngineBubble");
    li.setAttribute("draggable", "true");
    li.addEventListener("dragstart", function (event) {
        currentDragElement = this;
       // document.body.addClass("draggingEngine");
       // document.body.addClass("draggingItem");
        document.body.addClass("mainMoveable");
        document.body.addClass("groupable");
        document.body.addClass("trashable");
    }, false);

    li.addEventListener("dragend", function (event) {
        currentDragElement = null;
        ResetDragAnimation();
    }, false);

    var img = document.createElement("img");
    img.setAttribute("src", engine.IconUrl);

    var nameDiv = document.createElement("span");
    nameDiv.appendChild(document.createTextNode(engine.SearchEngineName));

    li.appendChild(engineDiv);
    engineDiv.appendChild(img);
    engineDiv.appendChild(nameDiv);


//todo delete this
//            function moveTheEngine(engine,direction) {
//                return function(event) {
//                    
//                    event.cancelBubble = true;
//                      if (engines.moveEngine(engine.Id, direction)) {
//                          redrawEngines();
//                          showUserMessage("Engine moved");
//                     }
//                }
//             }
//           
//            li.appendChild(createImageButton("images/download.png",moveTheEngine(engine,1)) );
//            li.appendChild(createImageButton("images/up.png",moveTheEngine(engine,-1)) );
    return li;
}


function createImageButton(src, clickAction) {
    var ele = document.createElement("img");

    ele.addEventListener("click", clickAction, false);
    //ele.setAttribute("onclick", clickAction);
    ele.src = src;
    ele.setAttribute("class", "EngineImageButton");

    return ele;
}

function showAddEngineDialog() {
    var element = document.getElementById('dialogBox');
    element.style.display = "block";
}

function hideAddEngineDialog() {
    var element = document.getElementById('dialogBox');
    element.style.display = "none";
}

function hideDialog(id) {
    var element = document.getElementById(id);
    element.style.display = "none";
}

function showDialog(id) {
    var element = document.getElementById(id);
    element.style.display = "block";

}

//maybe this isn't relivent anymore
function toggleDialog(elementName) {
    var element = document.getElementById(elementName);
    if (element.style.display == 'none') {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }

}

function engineDialogManager(engineValue) {
    return function (event) {
        showAddEngineDialog(); //should be show
        if (engineValue) {
            document.getElementById('iconUrl').value = engineValue.IconUrl;
            document.getElementById('searchName').value = engineValue.SearchEngineName;
            document.getElementById('searchUrl').value = engineValue.SearchUrl;
            document.getElementById('addButton').innerText = "Update";
        } else {
            document.getElementById('iconUrl').value = "";
            document.getElementById('searchName').value = "";
            document.getElementById('searchUrl').value = "";
            document.getElementById('addButton').innerText = "Add";
        }

        event.cancelBubble = true;
        saveEngine = function () {//should we move save out of  the click event..
            var iconUrl = document.getElementById('iconUrl').value;
            var searchEngineName = document.getElementById('searchName').value;
            var searchUrl = document.getElementById('searchUrl').value;

            if (engineValue) {
                engineValue.IconUrl = iconUrl;
                engineValue.SearchEngineName = searchEngineName;
                engineValue.SearchUrl = searchUrl;
                //??? are we doing this twice?
                engineValue.setParameters({ "SearchEngineName": searchEngineName, "IconUrl": iconUrl, "SearchUrl": searchUrl });
                showUserMessage("Website updated");
            } else {
                var newEngine = engine.CreateEngine(searchEngineName, iconUrl, searchUrl);

                engines.addEngine(newEngine);
                showUserMessage("Website added");
            }
            hideAddEngineDialog();
            redrawEngines();
            //alert("saving");
        };
    };
}

function showGroupEngineDialog(engGroup) {
    return function (event) {
        toggleDialog("engineGroupEdit");
        document.getElementById("engineGroupName").value = "";
        document.getElementById("engineGroupIcon").value = chrome.extension.getURL("/images/folder.png");

        if (engGroup) {
            document.getElementById("engineGroupName").value = engGroup.name;
            document.getElementById("engineGroupIcon").value = engGroup.IconUrl;
        }
        saveGroup = function () {//todo why does this need to be inside?
            //                var engGroup = new engineGroup();
            //                engGroup.name = "Group";
            //                engGroup.IconUrl =
            //                engGroup.Id = engine.CreateId(); //todo move CreateId somewhere... inheritance?
            //                engines.addEngine(engGroup);
            if (!engGroup) {
                engGroup = new engineGroup();
                engGroup.Id = engine.CreateId();
                engines.addEngine(engGroup); //shouldn't need to add & save, either or
            }

            engGroup.name = document.getElementById("engineGroupName").value;
            engGroup.IconUrl = document.getElementById("engineGroupIcon").value;


            engGroup.save();
            redrawEngines();
            toggleDialog("engineGroupEdit");
        };

    };
}

        //todo should be reanamed to ResetEngineListclick (and all the rest)

function ResetEngineList() {
     //repopulate
    engines.reset();
    redrawEngines();
    showUserMessage("engine list reset");
}

function ExportEngineList() {
    var eText = document.getElementById("engineText");
    eText.value = engines.exportEngines();
    toggleDialog("exportBox");

    eText.select();
    eText.focus();
}


function Import() {
    var eText = document.getElementById("engineText");
    var engJson = JSON.parse(eText.value);
    engines.importJSONList(engJson);
    // importJSONList
    toggleDialog('exportBox');
    redrawEngines();
    showUserMessage("Engines imported");
}

function ClearImageCache() {
    backgroundPage.ClearImageCache();
    showUserMessage("Image cache cleared");
}

function showUserMessage(message) {
 //add fade in transision
    document.getElementById("notifictionMessage").innerText = message;
    document.getElementById("notificationBox").style.visibility = "visible";
}
function hideUserMessage() {
    //TODO add fade out transistion
    //if we have undo fade out wond work so well
    document.getElementById("notificationBox").style.visibility = "hidden";
}

function ResetDragAnimation() {
    //should really remove items
    document.body.className = backgroundPage.settings.debugMode ? "" : "debugOff";
}

function log(message) {
    console.log(message);
    backgroundPage.log(message);
}
