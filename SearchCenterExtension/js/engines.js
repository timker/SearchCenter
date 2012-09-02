//TODO Obsolete this whole file in favour of EngineManager & EngineList

//dependencys:
//  GetJSON
//Array.prototype.findIndexOfElement = function(item) {
//    this.forEach(function(currentItem, index) {
//        if (currentItem == item) {
//            return index;
//        }
//    });
//}


function engines() {

//todo understand this a little better
    //http://www.thewebshop.ca/blog/2009/07/javascript-private-and-public-object-members/
    //how is it differnet to this
    //http://www.quizzpot.com/2009/04/private-methods-and-privileged-methods/


    //http://www.webreference.com/programming/javascript/object-oriented_javascript3/
    if (!(this instanceof engines)) {
        log("being called incorrectly");
    }
    
    
    //private variables
    var self = this;
    var engineList;
    var engineKeyHash;

    this.init = function() {


        var engineString = localStorage["EngineList"];
        if (engineString) {
            log("load save json");
            loadJsonList(JSON.parse(engineString));
        }
        else {
            log("load default json");
            loadJsonList(GetJSON("SearchEngineList.json", null));
        }

        document.addEventListener("engineGroupUpdated", function(e) {
            log("updated Group");
            //TODO should this raise a engineListEngineUpdated event?
            //todo bug, should only call this if engine is in list
            //saves changes
            EngineListContentsChanged();
        });

        document.addEventListener("engineUpdated", function(e) {
            log("updated");
            //TODO should this raise a engineListEngineUpdated event?
            //todo bug, should only call this if engine is in list
            //saves changes
            EngineListContentsChanged();
        });

    }


   this.getEngineList = function(){
    return engineList;
   }

   


    this.findEngineById = function(id) {
        return this.findFirst(function(engine) {
            return engine.Id == id;
        })
    }




    this.findEnginesByKey = function(keyArray) {

        //build hashtable
        if (!engineKeyHash) {
            engineKeyHash = {};
            this.forEachMatch(function(engine) {
                engineKeyHash[engine.getShortCutKey()] = engine;
            }, function(engine) {
                return !engineKeyHash[engine.getShortCutKey()]; //don't overwrite keys already added
            });
        }

        var keyEngines = [];
        keyArray.forEach(function(charItem) {

            if (engineKeyHash[charItem])
                keyEngines.push(engineKeyHash[charItem]);

        });

        return keyEngines;
    }


    this.findFirstEngineByDomain = function(domain, includeGroupEngines) {
        //todo implent false

        return this.findFirst(function(engine) {
            if (includeGroupEngines && engine.Engines) {
                //todo implement groups
                //loop through engines
                //prototype array.findfirst    
            }
            else {

                log(engine.getDomain());
                return domain == engine.getDomain();
            }
        });


    }


    //should be in EngineManager
    //could rename to get first egine
    //then put getDefaultEngine in engineManager or backgound page?
    this.getDefaultEngine = function()
    {

        //can also search for the last used Engine

        //search engine could raise an event that this could capture?
        
        //TODO bugg assumming there is an enigne in the list

        //should use find first (once it doesn't iterate through the whole list) 
        return engineList[0];
     };

    //just for debugging
    this.look = function() {
        log(engineList);
        log(JSON.stringify(engineList));
    }


    this.forEach = function(action) {
        this.forEachMatch( function(engine) { action(engine) });
    }



    //update this to action,filter
    //rename to forEach
    //if match/filterpredicate is not a function error, if it's null create function return true
//althoug do we want callers of foreachMatch to have access to index or array... NO!
    this.forEachMatch = function(action, filter) {
        engineList.forEach(function(item, index, array) { 
            if((!filter) || filter(item,index,array))
                action(item,index);
        });
    };

   //todo  http: //www.robertnyman.com/javascript/javascript-1.6.html#index-of
    this.findFirst = function(predicate) {
    //TODO shouldn't use findAll as it requires a loop through the whole list
         return this.findAll(predicate)[0];
    }

    //todo http://www.robertnyman.com/javascript/javascript-1.6.html#every
    this.findAll = function(predicate) {
        var foundList = [];
        this.forEachMatch(function(engine) {
            if (predicate(engine)) {
                foundList.push(engine);
            }
        });
        return foundList;
    }

    this.addEngine = function(newEngine) {
        console.log("addEngine");
        engineList.push(newEngine);
        //SaveChanges();
        EngineListContentsChanged();

        //raise event
        var evt = document.createEvent("Event");
        //does not bubble or be canceled
        evt.initEvent("engineAdded", false, false);
        evt.engine = newEngine;
        //needs to pass the engine that was added
        document.dispatchEvent(evt);
        //can this event be handles outside of the defining document??

        //this could be a better event: enginesModified
        //and has properties like
        //added = true (or engine)
        //addedEngine
        //deleted
        //deletedEngine
        //reorded
        
        //but how will we deal with reset?  deletedEngines[] addedEngines[] ??
         
    };



    this.reset = function() {
        localStorage.removeItem("EngineList");
        this.importJSONList(GetJSON("SearchEngineList.json", null));
      //  EngineListContentsChanged();
    }


//rename this... as it's more of a swap
    this.moveEngine = function(firstEngineId, places) {
        log("move");
        var currentindex = findEngineIndexById(firstEngineId);
        //cuurrnen+ places is > or < than range
        //lets do do the default up for now
        if (engineList[currentindex + places]) {
            var tempEngine = engineList[currentindex];
            engineList[currentindex] = engineList[currentindex + places];
            engineList[currentindex + places] = tempEngine;
           // SaveChanges();
            //TODO should raise order changed event

            EngineListContentsChanged();
            

            return true;
        } else {
            return false;
        }
    };

    this.moveEngineBelow = function(item, targetEngineLocation) {

        log(targetEngineLocation);
        log(engine);
        if (item == targetEngineLocation) {
            return;
        }

        //todo create function like below or .findIndex(predicate)
        //var removeIndex= engineList.findIndexOfElement(item);
        engineList.forEach(function(currentItem, index) {
            if (currentItem == item) {
                removeIndex = index;

            }

        });

        engineList.splice(removeIndex, 1);

        var insertIndex;
        engineList.forEach(function(currentItem, index) {
            if (currentItem == targetEngineLocation) {
                insertIndex = index;
            }
        });

        engineList.splice(insertIndex, 0, item);
        EngineListContentsChanged();

    }



    this.moveEngineAbove = function(item, targetEngineLocation) {
    if (item == targetEngineLocation) {
        return;
    }
        //a quick hack to get an item "after" current item
        engineList.reverse();
        self.moveEngineBelow(item, targetEngineLocation);
        engineList.reverse();
        EngineListContentsChanged();
    }

   this.exportEngines = function() {
        return JSON.stringify(engineList);
    };

    this.deleteEnginesById = function(id) {

        removeObjects(engineList, function(engine) {
            return engine.Id == id;
        });

        EngineListContentsChanged();
    }

    //this can be obsoleted once we change the array storage method
    this.deleteEnginesBySearchUrl = function(searchUrl) {

        removeObjects(engineList, function(engine) {
            return engine.SearchUrl == searchUrl;
        });

        EngineListContentsChanged();
    }

    this.copyEngineToGroup = function(engine, group) {
        group.CopyNewEngine(engine);
        EngineListContentsChanged();
    } 

    this.importJSONList = function(jsonList) {
    log("import");
    //todo should suppress the engineupdated event as it is not part of the parent list for the most part
        //then when setting to enginelist raise an event
        
        loadJsonList(jsonList);
        EngineListContentsChanged();
    }

    //**************** private methods
    function loadJsonList(jsonList) {
        log("load");
        var jsonArray = [];
        try {

            //TODO use array.map
            //https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/map
            jsonList.forEach(function(jsonEngine) {
                //log(jsonEngine);
                if (jsonEngine.Engines) {
                    jsonArray.push(engineGroup.createEngineGroupFromJson(jsonEngine));
                }
                else {
                    jsonArray.push(engine.CreateEngineFromJSON(jsonEngine));
                    log(jsonArray[jsonArray.length - 1].Id);
                    log(jsonArray[jsonArray.length - 1]);
                }
            });

        } catch (err) {
            log(err);
        }
        engineList = jsonArray;
    
    }

    //private
    function removeObjects(array, predicate) {
        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i].Engines) {
                log('found');
                //alert("groups");
                 removeObjects(array[i].Engines, predicate);
            } else {
            log(array[i]);
            log('tick');
             }

            if (predicate(array[i])) {
               // alert("deleted");
                array.splice(i, 1);
            }
        }
    }

    //private
    function SaveChanges() {
        localStorage["EngineList"] = JSON.stringify(engineList);
        log("saved Engines");

        var evt = document.createEvent("Event");
        //does not bubble or be canceled
        evt.initEvent("engineListSaved", false, false);
        evt.engine = this;
        //needs to pass the engine that was added
        document.dispatchEvent(evt);
    }


        function EngineListContentsChanged() {
        engineKeyHash = null;
        SaveChanges();
    }

    //Warn: this index are invalid as soon as the array is changed
    function findEngineIndexById(id) {
    
        var foundIndex;
        //TODO forEachMatch args needs to be swapped, make it jus the for each as well
        self.forEachMatch( function(engine, index) {
            foundIndex = index;
            log("index at :" + index);
        }, function(engine) {
            return engine.Id == id;

        });

        return foundIndex;
        //return parseInt(foundindex);

    }




    this.init();
  

};


//find : []
//find first: engine




