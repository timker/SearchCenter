console.log(this);

//attach keypress handler
document.addEventListener('keydown', keyPress, false);

function keyPress(e) {

    if (e.ctrlKey && e.keyCode == 81) {
        chrome.extension.sendRequest({ msg: "quickSearch" });
    }
    
}

//find out highest z-index
//http://www.west-wind.com/weblog/posts/876332.aspx
//http://abcoder.com/javascript/a-better-process-to-find-maximum-z-index-within-a-page/
//http://greengeckodesign.com/blog/2007/07/get-highest-z-index-in-javascript.html


