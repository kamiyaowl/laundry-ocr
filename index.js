const config = require("config");
const NodeWebcam = require( "node-webcam" );
let opts = config.cameraOption;

// const Webcam = NodeWebcam.create( opts );
NodeWebcam.capture( "capture", opts, function( err, filename ) {
    console.log(err, filename);
});