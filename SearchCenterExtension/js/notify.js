//*****************************   notifier
function notify() {

    this.loopView = function(viewName, command) {
        //todo look at using  chrome.extension.getExtensionTabs(integer windowId)    instead...
        chrome.extension.getViews().forEach(function(view) {
            if (view.location.pathname == viewName) {
                command(view);
            }
        })
    }

}



notify.popup = function(viewCommand) {
    //do we have to init nofiy every time?
    new notify().loopView("/popup.html", viewCommand);
};

notify.debugView = function(viewCommand) {
    //do we have to init nofiy every time?
    new notify().loopView("/debug.html", viewCommand);
};

notify.interface = function(interface, viewCommand) {
    chrome.extension.getViews().forEach(function(view) {
        if (view[interface])//todo make accept arrays e.g ["methodname","methodName"]...
            viewCommand(view);
    });

};






