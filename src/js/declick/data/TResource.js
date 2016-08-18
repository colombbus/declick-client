define(['jquery'], function($) {
    var TResource = function() {
        var cacheEnabled = false;
        var log = false;
        
        /*
         * Set cache support (i.e. use of localStorage)
         * If true, check validity of cached data, ensuring that it is no older than 1 day
         * @param {boolean} value
         */
        this.setCacheEnabled = function(value, version) {
            cacheEnabled = value;
            if (cacheEnabled) {
                // check validity of data
                var oldVersion = localStorage.getItem("version");
                if (oldVersion) {
                    oldVersion = parseInt(oldVersion);
                    if (version !== oldVersion) {
                        // Versions differ: clear cache
                        localStorage.clear();
                    }
                } else {
                    // cache does not contain version: clear it
                    localStorage.clear();
                }
                try {
                    localStorage.setItem("version", version);
                } catch (e) {
                    // in case setItem throws an exception (e.g. private mode)
                    // set cacheEnabled to false
                    cacheEnabled = false;
                }                
            }
            return cacheEnabled;
        };
        
        /*
         * Get value from a JSON resource file
         * @param {String} name the name of resource file
         * @param {Array} fields the fields to retrieve from resource file. If empty, returns all file content
         * @param {Function} callback
         */
        this.get = function(name, fields, callback) {
            if (cacheEnabled) {
                // try to retrieve value from local storage
                var value = localStorage.getItem(name);
                if (value) {
                    // value is available from local storage
                    callback.call(this,JSON.parse(value));
                    return;
                }
            }
            var self = this;
            $.ajax({
                dataType: "json",
                url: name,
                success: function(data) {
                    var value;
                    if (fields.length>0) {
                        value = {};
                        for (var i=0; i<fields.length; i++) {
                            if (typeof data[fields[i]] !== 'undefined') {
                                value[fields[i]] = data[fields[i]];
                                self.log("found field '"+fields[i]+"' in resource '"+name);
                            }
                        }
                    } else {
                        value = data;
                    }
                    if (cacheEnabled) {
                        try  {
                            localStorage.setItem(name,JSON.stringify(value));
                        } catch (e) {
                            this.error("Error trying to cache value "+value+": "+e);
                        }
                    }
                    callback.call(this, value);
                },
                error: function(data, status, error) {
                    this.error("Error loading resource '"+name+"'");
                    callback.call(this, {});
                }
            });
        };
        
        
         /*
         * Get value from a text resource file
         * @param {String} name the name of resource file
         * @param {Function} callback
         */
        this.getPlain = function(name, callback) {
            if (cacheEnabled) {
                // try to retrieve value from local storage
                var value = localStorage.getItem(name);
                if (value) {
                    // value is available from local storage
                    // postpone callback execution
                    setTimeout(function() {
                        callback.call(this,value);
                    }, 0);
                    return;
                }
            }
            $.ajax({
                dataType: "text",
                url: name,
                success: function(data) {
                    if (cacheEnabled) {
                        try {
                            localStorage.setItem(name,data);
                        } catch (e) {
                            this.error("Error trying to cache value "+data+": "+e);
                        }

                    }
                    callback.call(this, data);
                },
                error: function(data, status, error) {
                    this.error("Error loading resource '"+name+"'");
                    callback.call(this, "");
                }
            });
        };
        
        this.setLog = function(value) {
            log = value;
        };
        
        this.setError = function(value) {
            error = value;
        };

        this.log = function(message) {
            if (log) {
                window.console.log(message);
            }
        };

        this.error = function(message) {
            if (error) {
                window.console.error(message);
            } else {
                this.log("ERROR> "+message);
            }
        };
    };
    
    var resourceInstance = new TResource();
    
    return resourceInstance;
});
