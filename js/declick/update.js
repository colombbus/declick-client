// Worker to udpate infos from backend

// Interval for polling info
var pollingInterval = 5000;
var polling;
var pollingUrl;

onmessage = function(event) {
    var data = event.data;
    switch (data.operation) {
        case 'init': // init poll info
            pollingUrl = data.url;
            pollingInterval = data.interval;
            break;
        case 'reset': // reset poll interval
            reset();
            break;
        case 'start': // start poll interval
            start();
            break;
        case 'stop': // start poll interval
            stop();
            break;
    }
};

poll = function() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", fullUrl, true);
    httpRequest.onload = function() {
        var output = httpRequest.responseText;
        if (output) {
            output = output.trim();
            if (output.length() > 0) {
                postMessage(output);
            }
        }
    };
    httpRequest.send(null);
};

start = function() {
    polling = window.setInterval(poll, pollingInterval);
};

stop = function() {
    window.clearInterval(polling);
};

reset = function() {
    stop();
    start();
};

