//should update naming convention
//make functions use prototype
function engine() {
    this.SearchEngineName;
    this.IconUrl;
    //this.SearchUrl;
    this.updateUrl;

    this.Id;


    var _searchUrl;
    var domain;
    var shortCut;

    //remove this local variable
    var id = engine.CreateId();
    this.Id = id;
    //todo look into  http://www.robertnyman.com/javascript/javascript-getters-setters.html
    // and http://msdn.microsoft.com/en-us/library/dd229916(VS.85).aspx
    this.__defineGetter__("name", function () {
        return this.SearchEngineName;
    });

    this.__defineGetter__("SearchUrl", function () {
        return _searchUrl;
    });

    this.__defineSetter__("SearchUrl", function (val) {
        domain = null;
        shortCut = null;
        _searchUrl = val;
    });

    this.setParameters = function (jsonEngine) {

        this.SearchEngineName = jsonEngine.SearchEngineName;
        this.IconUrl = jsonEngine.IconUrl;
        this.SearchUrl = jsonEngine.SearchUrl;
        //this might not be populated so check that
        if (jsonEngine.updateUrl)
            this.updateUrl = jsonEngine.updateUrl;

        //either engine needs a reference to engines
        //or engines needs to test the engine is contained
        //or has a ungine eventname
        //maybe the setters need to raise this as well?, but becareful it doesn't pop to many events
        //or make property readonly
        log("d2");
        log(document);
        //raise event
        var evt = document.createEvent("Event");
        //does not bubble or be canceled
        evt.initEvent("engineUpdated", false, false);
        evt.engine = this;
        //needs to pass the engine that was added
        document.dispatchEvent(evt);

    };

    this.getDomain = function () {
        if (!domain) {
        //    domain = this.SearchUrl.match(/^https?:\/\/([^\/]*)\//ig)[0];
            domain = getDomain(this.SearchUrl);
        }
        return domain;
    };

    this.getId = function () {
        return id;
    };


    this.getShortCutKey = function () {
    //todo should check that SearchEngineName has at least one char
        if (!shortCut) {
            shortCut = this.SearchEngineName.charAt(0).toLowerCase();
        }
        return shortCut;
    };


    this.IsPost = engine.IsPost;
}

//********inheritence********///

//engine.prototype.getId = function() {
//return id;
//};


//***static methods**********//
engine.CreateEngineFromJSON = function (jsonEngine) {
    var eng = new engine();
    eng.setParameters(jsonEngine);
    return eng;
};

engine.CopyEngine = function (eng) {
    var newEngine = new engine();
    newEngine.SearchEngineName = eng.SearchEngineName;
    newEngine.IconUrl = eng.IconUrl;
    newEngine.SearchUrl = eng.SearchUrl;
    if (eng.updateUrl)
        newEngine.updateUrl = eng.updateUrl;
    return newEngine;
};

engine.CreateEngine = function (name, icon, searchUrl, updateUrl) {
    var eng = new engine();
    eng.SearchEngineName = name;
    eng.IconUrl = icon;
    eng.SearchUrl = searchUrl;
    eng.updateUrl = updateUrl;

    return eng;

};

engine.CreateId = function () {
//todo come up with a better way of doing this
//maybe HTML 5 <keygen> Tag, if it can be access from javascript
    return Math.random().toString() + Math.random().toString();
};

engine.IsPost = function () { return false; };

//engine.CreateEngine(name,icon,searchUrl,domain)
//enigne.SomeGetDomainREgex ... can it make it private