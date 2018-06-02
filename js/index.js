var $ = window.Zepto;
var root = window.player;
var $scope = $(document.body);
var index = 0;
var songList;
var controlmanager;
var audiomanager = new root.audioManager();
var proccessor = root.proccess;
var playList = root.playList;
var apercent;
var newFlag;
function bindTouch () {
    var $sliderPoint = $scope.find(".slider-point");
    var offset = $scope.find(".pro-wrapper").offset();
    var left = offset.left;
    var width = offset.width;
    $sliderPoint.on("touchstart",function () {
        if (!newFlag) {
            proccessor.start();
            newFlag = true;
        }
        proccessor.stop();
    }).on("touchmove",function (e) {
        var x = e.changedTouches[0].clientX;
        apercent =(x - left) / width;
        if (apercent > 1 || apercent < 0) {
            apercent = 0;
        }
        proccessor.upDate(apercent);
    }).on("touchend",function (e) {
        var x = e.changedTouches[0].clientX;
        apercent =(x - left) / width;
        if (apercent > 1 || apercent < 0) {
            apercent = 0;
        }
        proccessor.start(apercent);
        var index = controlmanager.index;
        var curDuration = songList[index].duration;
        var curTime = curDuration * apercent;
        audiomanager.jumpToPlay(curTime);
        $scope.find(".play-btn").addClass("playing");
    })
}
function bindClick () {
    $scope.on("click",".play-btn",function () {
        if (audiomanager.status == "play") {
            audiomanager.pause();
            proccessor.stop();
        }else{
            audiomanager.play();
            proccessor.start(apercent);
        }
        $(this).toggleClass("playing");
    })
    $scope.find(".next-btn").on("click",function () {
        apercent = 0;
        var index = controlmanager.next();
        $scope.trigger("player:change",index)
    })
    $scope.find(".prev-btn").on("click",function () {
        apercent = 0;
       var index = controlmanager.prev();
       $scope.trigger("player:change",index)
    })
    $scope.find(".list-btn").on("click",function () {
        playList.show(controlmanager);
    })
}
$scope.on("player:change",function (event,index,flag) {
    // console.log(6369)
    root.render(songList[index]);
    audiomanager.changeSource(songList[index].audio)
    if (audiomanager.status == "play" || flag) {
        proccessor.start(0);
        audiomanager.play();
    }
    proccessor.renderAllTime(songList[index].duration);
    proccessor.upDate(0);
})
function getData (url){
    $.ajax({
        type:"GET",
        url:url,
        success : successFn
    })
}
function successFn (data) {
    songList = data;
    $scope.trigger("player:change",0)
    bindClick();
    bindTouch();
    playList.renderPlayList(data);
    controlmanager = new root.controlManager(data.length);

}
getData("/mock/data.json")
