//ideas
//TODO set interval that saves the  accessed json once an hour ()
//thus reducing the cost of saveing to disk... assuming set inteval is cheap
//it should only set interval if there are changes to save
//http://code.google.com/p/chromium/issues/detail?id=30885 this could help as well
//then could setinteval once a month to clean
//store image access in ImageCache
//store mata access data in ImageCachrData


//if we add remove item, should work fine as well


function imageCache() {
    var cacheList = localStorage["ImageCache"] ? JSON.parse(localStorage["ImageCache"]) : {};

    this.getCachedImage = function (imageUrl) {
        if (cacheList[imageUrl]) {
            log("cache hit");
            return cacheList[imageUrl].imageData;
        } else {

            log("no cache");

            var img = new Image();
            img.onload = function () {
                log("Image finished Loading... caching");

                var dataUrl = getImageData(this);

                //may be slightly better to use img.src rather than imageUrl incase onerror changes the src to a blank image
                cacheList[imageUrl] = { "imageData": dataUrl }; //{ imageData: dataUrl };
                localStorage["ImageCache"] = JSON.stringify(cacheList);
            };
            img.onerror = function () {
                //possibly unhook onload event (or make it use img src)
                log("Image Error");
            };
            img.src = imageUrl;
        }
        return imageUrl;
    };


    this.ClearCache = function() {
        localStorage.removeItem("ImageCache");
        cacheList = {};
    };

    function getImageData(img) {
        var data, canvas, ctx;

        //do we have create canvas fromt the document... will the memory be cleaned up since it is never added to the document?
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        // Get '2d' context and draw the image.
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        log(img.src);
        log(canvas.width, canvas.height);

        data = canvas.toDataURL();
        return data;
    }
}