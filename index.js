const NodeWebcam = require( "node-webcam" );
let opts = {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: '/dev/video1',
    callbackReturn: "location",
    verbose: false
};

// const Webcam = NodeWebcam.create( opts );
NodeWebcam.capture( "capture", opts, function( err, filename ) {
    console.log(err, filename);
});