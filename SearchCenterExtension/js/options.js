
        var backgroundPage = chrome.extension.getBackgroundPage();
        var engines = backgroundPage.engines;
        var editEngine;


        //can we make this private
        function load() {

            //set debug mode
            if (backgroundPage.settings.debugMode) {
                //todo if body already has a class name it will be over written
                //http://stackoverflow.com/questions/195951/change-an-elements-css-class-with-javascript
                document.body.className = "";
            }

            new bindCheckBox("smallIconsCheckBox", backgroundPage.settings, "smallButtons");
            new bindCheckBox("useSuggestionCheckbox", backgroundPage.settings, "useSuggest");
            new bindCheckBox("useHotKeyCheckbox", backgroundPage.settings, "useHotKey");
            new bindCheckBox("contextMenuCheckBox",backgroundPage.settings,"enableContextMenu")

            //set Open in new tab options
            var NewTabCheckBox = document.getElementById("NewTabCheckBox");
            if (backgroundPage.getOpenSearchInNewTab()) {
                NewTabCheckBox.checked = "checked";
            }


            var lastSearchCheckBox = document.getElementById("lastEngineCheckBox");
            if (backgroundPage.settings.useLastEngine) {
                lastSearchCheckBox.checked = "checked";
            }

            var shortCutInput = document.getElementById("shortCutInput");

           displayHotKey(backgroundPage.settings.searchBarHotKey);
            //shortCutInput.value = "h";
           // shortCutInput.addEventListener('keypress', function(e) { 
            //  if(e.which != 16)
            //log(e);
           //},false);
            shortCutInput.addEventListener('keyup', hotkeyUp, false);
            shortCutInput.addEventListener('keydown',hotkeyDown, false);
////            if(e.which != 16)
////            log(e);
////                return;////////////////////////////////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!
////              
////                //CHECH IY'S NOT A CTTRL CHAR ABD THEN SAVE IT
////                var keyList = [];

////                if (e.ctrlKey) {
////                    keyList.push("Ctrl");
////                    //shortCutInput.value = "Ctrl";
////                }
////                if (e.shiftKey) {
////                    keyList.push("Shift");
////                    //shortCutInput.value = "Shift";
////                }
////                if (e.altKey) {
////                    keyList.push("Alt");
////                    //shortCutInput.value = "Alt";
////                }
////                
////                
////                
////                //should only (push) save if alt,shift,ctrl is down
////                //log(e.keyCode + " "  + String.fromCharCode(e.keyCode));
////                var key = String.fromCharCode(e.keyCode);
////                if (key) {
////                    // alert(key);
////                    keyList.push(key);
////                }
////                shortCutInput.value = keyList.join("+");

////                //alert(e.keyCode + String.fromCharCode(e.keyCode)); // + "w";
////                //makes sense to store keyIdentifier as well, as it's more unique than keyCOde (f1,f2)
////                //shortCutInput.value = e.keyCode + e.charCode + e.keyIdentifier + "xx"
////                //backgroundPage.settings.searchBarShortCut = e.keyCode;
////                e.preventDefault();
////            }, false);

        }
        


        function hotkeyDown(e) {
            var info = getHotKeyInfoFromEvent(e);    
            e.preventDefault();
          
            displayHotKey(info);

            //only save if valid
            //special key is down
            if (info.ctrlKey || info.shiftKey || info.altKey) {
                // but is not special key
                if (!(e.keyIdentifier == "Control" || e.keyIdentifier == "Shift" || e.keyIdentifier == "Alt")) {
                    //todo show tick or cross if it is a valid hotkey
                    //todo save 
                    backgroundPage.settings.searchBarHotKey = info;
                   
                   
                   //todo onkeyup if it's the last key up reset the key
                }
            }

        }
        function hotkeyUp(e) {
            log(e);

            //lifting off the last key? then show valid
            if (!(e.ctrlKey || e.shiftKey || e.altKey)) {
                displayHotKey(backgroundPage.settings.searchBarHotKey);
            } else {
                displayHotKey(getHotKeyInfoFromEvent(e));
            }
            
         }

         function getHotKeyInfoFromEvent(e) {
             var inf = {};
             //var info = {};
             inf.ctrlKey = e.ctrlKey;
             inf.shiftKey = e.shiftKey;
             inf.altKey = e.altKey;
             inf.which = e.which;
             inf.keyCode = e.keyCode;

             var displayKey = String.fromCharCode(e.keyCode); //todo should we just put this in display, as it's not neccerary in save

             //this doesn't work for f1 etc
             if (displayKey == escape(displayKey)) {
                 inf.data = displayKey;
             } else {

                 if (!(e.keyIdentifier == "Control" || e.keyIdentifier == "Shift" || e.keyIdentifier == "Alt")) {
                     inf.data = e.keyIdentifier;
                 }
             }


             
             return inf;
         
         }
        function displayHotKey(info) {
            var keyList = [];
            if (info.ctrlKey) {
                keyList.push("Ctrl");
            }
            if (info.shiftKey) {
                keyList.push("Shift");
            }
            if (info.altKey) {
                keyList.push("Alt");
            }
            keyList.push(info.data);
            shortCutInput.value = keyList.join("+");
        }
        
        

        //*************** public methods ****************//
        function drawEngine(engine) {
            var engineDom = document.getElementById("engineElements");
            engineDom.appendChild(displayEngine(engine));
        }


        //***********************************************//

        function setSameTabSearch(checkbox) {
            backgroundPage.setOpenSearchInNewTab(checkbox.checked);
            showUserMessage("Mouse behaviour updated");
        }

        function setLastEngineSearch(checkBox) {
            backgroundPage.settings.useLastEngine = checkBox.checked;
            showUserMessage("default search behaviour updated");
        }






        function createImageButton(src, clickAction) {
            var ele = document.createElement("img");


            ele.setAttribute("onclick", clickAction);
            ele.src = src;
            ele.setAttribute("class", "EngineImageButton");

            return ele;

        }


        function toggleDialog(elementName) {
            var element = document.getElementById(elementName);
            if (element.style.display == 'none') {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }

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


        function bindCheckBox(elementName, object, propertyName) {
            this.obj = object;
            var self = this;
            this.obj[this.prop] = true;
            this.prop = propertyName;
            var element = document.getElementById(elementName);
            if (this.obj[this.prop] == true)
                element.checked = "checked";
            this.setProperty = function() {
                self.obj[self.prop] = element.checked;
            };

            element.addEventListener('click', this.setProperty, false);

        }

        function log(message) {
            console.log(message);
            backgroundPage.log(message);
        }
 
