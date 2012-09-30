function engineGroup() {

    this.Id;
    this.name;
    this.IconUrl;

    this.Engines = [];


    this.CopyNewEngine = function (eng) {

        //this.Engines.push(engine.CreateEngineFromJSON(engine1));
        this.Engines.push(engine.CopyEngine(eng));

        //document
        log(document);
        var evt = document.createEvent("Event");
        //does not bubble or be canceled

        evt.initEvent("engineGroupUpdated", false, false);
        evt.engineGroup = this;
        //needs to pass the engine that was added
        log("engineGroupUpdated Event Firing");
        document.dispatchEvent(evt);
        log("engineGroupUpdated Event Fired");
    };

    this.save = function () {
        var evt = document.createEvent("Event");
        evt.initEvent("engineGroupUpdated", false, false);
        evt.engineGroup = this;
        document.dispatchEvent(evt);
    };


}


engineGroup.createEngineGroupFromJson = function(jsonEngine) {
    var engG = new engineGroup();
    engG.Id = jsonEngine.Id;//maybe this should create a new id, just to consistant
    engG.name = jsonEngine.name;
    engG.IconUrl = jsonEngine.IconUrl;
    jsonEngine.Engines.forEach(function (enge) {
        engG.Engines.push(engine.CreateEngineFromJSON(enge));
    });

    return engG;
};
