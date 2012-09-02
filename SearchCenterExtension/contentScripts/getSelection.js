console.log("running selection script");
var msg = { msg: "getSelection", selection: selectedText() };

chrome.extension.sendRequest(msg);
//alert(msg.selection);

//should make this recursive as iframe could be nested
//pass in root document
function selectedText() {
        var selection = window.getSelection().toString();

        var iframes = document.getElementsByTagName("iframe");       
        
        for (var j = 0; j < iframes.length; j++) {
        try{

                var domselection = iframes[j].contentDocument.getSelection();

                if (domselection.type != "None") {
                    if (domselection.toString() != "") {
                        selection = domselection.toString();
                    }
                }
                
            } catch(err) {
                console.log("iframe selection error, probably a different domain");
            }
        }
        return selection;
    }
    
    

    