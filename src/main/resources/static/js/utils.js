var OL = {
    username: "anonymous",
    password: "",
    CHAT_TEXT: "chat",
    SEND_TEXT: "send",
    MSG_MAXTIME: 10000,
    WALKING_FRAMERATE: 10,
    WALKING_SPEED: 250,
    IS_MOBILE: false
};

var touchSense = window.addEventListener('touchstart', function() {			
    OL.IS_MOBILE = true;
    console.log("IS_MOBILE");
    removeEventListener('touchstart', touchSense, false);
});

OL.fadeOutIn = function(passedCallback, context) {
    context.cameras.main.fadeOut(250);
    context.time.addEvent({
        delay: 250,
        callback: function() {
        context.cameras.main.fadeIn(250);
        passedCallback(context);
        },
        callbackScope: context
    });  
}
OL.fadeOutScene = function(sceneName, context) {
    context.cameras.main.fadeOut(250);
    context.time.addEvent({
        delay: 250,
        callback: function() {
            context.scene.start(sceneName);
        },
        callbackScope: context
    });
};