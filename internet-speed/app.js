let appInsights = require("applicationinsights");

var instrumentationKey = process.argv[2];
console.log("Using AppInsights Key " + instrumentationKey)

appInsights.setup(instrumentationKey)
    .setAutoCollectExceptions(true)
    .setUseDiskRetryCaching(true)
    .start();

let client = appInsights.defaultClient;

var fiveMinutes = 1000*60*5;
setInterval(function(){captureInternetSpeed();},fiveMinutes)

function captureInternetSpeed(){
    const { exec } = require('child_process');

    var command = "curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python -"
    
    var now = new Date();
    console.log(now.toString() + " initiating speed test...")

    exec(command, (err, stdout, stderr) => {
    if (err) {
        // node couldn't execute the command
        return;
    }

    var uploadSpeedMatch = stdout.match("[\n\r].*Upload:\s*([^\n\r]*)")[1];
    var downloadSpeedMatch = stdout.match("[\n\r].*Download:\s*([^\n\r]*)")[1];
    
    var uploadSpeed = uploadSpeedMatch.trim();
    var downloadSpeed = downloadSpeedMatch.trim();

    logSpeedData(uploadSpeed,downloadSpeed);
    console.log("  done")
    });
}

function logSpeedData(uploadSpeed,downloadSpeed){

    var speedData = {upload: uploadSpeed, download: downloadSpeed};

    client.trackEvent({name: "internet-speed", properties: speedData});
    client.flush();
    
}