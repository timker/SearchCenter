//should contain name
//id
//iconUrl (but should be able to get a list if not set)
//getShortCutKey()
//iconList[]
//engines[]

function engineList() {
    var list = [];

    this.add = function(engine) {
        //avoid adding duplicates
        //this deletes the item if there are any

        //TODO this should use a deleteall(item)
        var index = list.indexOf(engine);
        if (index >= 0) {
            list.splice(index, 1);
        }
        //last item will always get added to the start of the list
        list.unshift(engine);
    }

    this.remove = function(engine) {
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] == engine) {
                this.removeAt(i);
            }
        }
        
    }
    this.removeAt = function(index) {
        list.splice(index, 1);   
    }

 //todo turn into property
    this.hasItems = function() {
        return list.length > 0;
    };

    this.clear = function() {
        list = [];
    }

    this.forEach = function(delegate) {
        list.forEach(delegate);
    };    
    //get useLastEngine() { return localStorage["defaultLastEngine"] ? true: false}

    this.returnList = function() { return list; };

}


//var g = new engineList();
//g.Add(engineList);
//how are we going to decide if loop engines loops them all or just the soloengines & anf top group?
//it will need to do both,,, add a bool all/depth/toplevel



//when calling a find on enggroup, eng group should exe the find on it's children
//the caller should only know abit iEngine interface for generic interfaces
//also if a sub engines matchs do we return the whole object or just the current eng.