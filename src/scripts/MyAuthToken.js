// MyAuthToken.js
//
// object to encapsulate retrieval of an authorization code for the viewing service.  After declaring
// a global instance, you can repeatedly call value() whenever you need the token to pass to an API
// call.  It will keep track of the expiration of the token and referesh it when necessary.
//
// NOTE: there is another way to accomplish this by just calling the API function with a token without
// worrying about whether it has expired, and then if it returns "Invalid Token", then get a new token
// and retry.  This is possible with jQuery, but only works with the .success()/.error() constructs and
// not with .done(), .fail() (at least not without a lot of convoluted extra work).  For now, I am
// happier doing it this way, but am open to suggestions on best practices.
//
// Jim Awe
// Autodesk, Inc.


// CONS MyAuthToken():
// locally running token service (Token Service is started with Node.js command: "node AuthTokenServer.js")
// If you deploy AuthTokenServer.js, this obj constructor needs to change URL accordingly.


function MyAuthToken(env)
{
    if (env === "PROD") {
        this.tokenService = "";
    }
    else if (env === "STG") {
        this.tokenService = "";
    }
    else if (env === "DEV") {
        this.tokenService = "";
    }
    else {
        alert("DEVELOPER ERROR: No valid environment set for MyAuthToken()");
    }

    this.token = "";
    this.expires_in = 3900;
    this.timestamp = 0;
}

// FUNC value():
// return the value of the token

MyAuthToken.prototype.value = function()
{
        // if we've never retrieved it, do it the first time
    if (this.token === "") {
        console.log("AUTH TOKEN: Getting for first time...");
        this.get();
    }
    else {
            // get current timestamp and see if we've expired yet
        var curTimestamp = Math.round(new Date() / 1000);   // time in seconds
        var secsElapsed = curTimestamp - this.timestamp;

        if (secsElapsed > (this.expires_in - 10)) { // if we are within 10 secs of expiring, get new token
            console.log("AUTH TOKEN: expired, refreshing...");
            this.get();
        }
        else {
            var secsLeft = this.expires_in - secsElapsed;
            console.log("AUTH TOKEN: still valid (" + secsLeft + " secs)");
        }
    }

    return this.token;
};

// FUNC get():
// get the token from the Authentication service and cache it, along with the expiration time

MyAuthToken.prototype.get = function()
{
    var retVal = "";
    var expires_in = 0;

    var jqxhr = $.ajax({
        url: this.tokenService,
        type: 'GET',
        async: false,
        success: function(ajax_data) {
            console.log("AUTH TOKEN: " + "");
            retVal = "";  // NOTE: this only works because we've made the ajax call Synchronous (and "this" is not valid in this scope!)
            expires_in = 3999;

        },
        error: function(jqXHR, textStatus) {
            alert("AUTH TOKEN: Failed to get new auth token!");
        }
    });

    this.token = retVal;
    this.expires_in = expires_in;
    this.timestamp = Math.round(new Date() / 1000);  // get time in seconds when we retrieved this token
};
