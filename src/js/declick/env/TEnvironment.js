define(['jquery', 'TResource'], function ($, TResource) {
    /**
     * TEnvironment defines the environment variables (language, project,
     * and project's availability), get several URLs, and have several other
     * interactions with the environment.
     * @exports TEnvironment
     */
    var TEnvironment = function () {
        var project;
        var projectAvailable = false;
        var support3D = null;

        this.messages = {};

        // TODO: change this
        this.language = "fr";

        // Config parameters: default values
        this.config = {"debug": false, "backend-path": "/declick-server/web/app.php/", "cache": true, "log": false, "error": true, "cache-version": 0};
        this.debug;

        /**
         * Loads environment (config, messages), and calls callback if existing
         * @param {Function} callback
         */
        this.load = function (callback) {
            window.console.log("*** Loading Declick Environment ***");
            window.console.log("* Loading config");
            var configFile = this.getResource("config.json");
            var self = this;
            $.ajax({
                dataType: "json",
                url: configFile,
                success: function (data) {
                    $.extend(self.config, data);
                    self.debug = self.config['debug'];
                    if (self.config['document-domain']) {
                        document.domain = self.config['document-domain'];
                    }
                    TResource.setCacheEnabled(self.isCacheEnabled(), self.config['cache-version']);
                    window.console.log("* Cache revision: " + self.config['cache-version']);
                    TResource.setLog(self.config['log']);
                    TResource.setError(self.config['error']);
                    self.log("* Retrieving translated messages");
                    var messageFile = self.getResource("messages.json");
                    var language = self.language;
                    TResource.get(messageFile, [language], function (data) {
                        if (typeof data[language] !== 'undefined') {
                            self.log("found messages in language: " + language);
                            self.messages = data[language];
                        } else {
                            self.log("found no messages for language: " + language);
                        }
                        if (typeof callback !== 'undefined') {
                            callback.call(self);
                        }
                    });
                }
            });
        };

        /**
         * Get the base URL.
         * @returns {String}
         */
        this.getBaseUrl = function () {
            return window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/");
        };

        /**
         * Get the URL of objects.
         * @returns {String}
         */
        this.getObjectsUrl = function () {
            return this.getBaseUrl() + "/js/declick/objects";
        };

        /**
         * Get the URL of the list of objects.
         * @returns {String}
         */
        this.getObjectListUrl = function () {
            return this.getObjectsUrl() + "/objects.json";
        };

        /**
         * Get the URL of the module entered in parameter.
         * @param {String} module
         * @returns {String} Returns the URL of module.
         */
        this.getBackendUrl = function (module) {
            var url = window.location.protocol + "//" + window.location.host;
            url += this.config['backend-path'] + "assets/";
            if (typeof module !== "undefined") {
                url = url + module;
            }
            return url;
        };

        /**
         * Get language.
         * @returns {String}
         */
        this.getLanguage = function () {
            return this.language;
        };

        /**
         * Set language to the one entered in parameter.
         * @param {String} language
         */
        this.setLanguage = function (language) {
            this.language = language;
        };

        /**
         * Get URL of the resource entered in parameter.
         * @param {String} name
         * @returns {String} Returns the URL of the resource.
         */
        this.getResource = function (name) {
            return this.getBaseUrl() + "/resources/" + name;
        };

        /**
         * Get resource entered in parameter of var project.
         * @param {String} name
         * @returns {Resource}
         */
        this.getProjectResource = function (name) {
            return project.getResourceLocation(name);
        };

        /**
         * Get a message. There are two possibilities :
         * - A message is associated in the array of messages. If there's more
         *   than one variable entered in parameters, other variables
         *   are replaced in the associated message. This message is returned.
         * - The paramater isn't associated to any message. It is returned.
         * @param {type} code
         * @returns {String}
         */
        this.getMessage = function (code) {
            if (typeof this.messages[code] !== 'undefined') {
                var message = this.messages[code];
                if (arguments.length > 1) {
                    // message has to be parsed
                    var elements = arguments;
                    message = message.replace(/{(\d+)}/g, function (match, number) {
                        number = parseInt(number) + 1;
                        return typeof elements[number] !== 'undefined' ? elements[number] : match;
                    });
                }
                return message;
            } else {
                return code;
            }
        };

        /**
         * Set the project to the one entered in parameter.
         * @param {String} value
         */
        this.setProject = function (value) {
            project = value;
        };

        /**
         * Get the current project.
         * @returns {String}
         */
        this.getProject = function () {
            return project;
        };

        /**
         * Set the avaibility of the project.
         * @param {Boolean} value
         */
        this.setProjectAvailable = function (value) {
            projectAvailable = value;
        };

        /**
         * Get the avaibility of the project.
         * @returns {Boolean}
         */
        this.isProjectAvailable = function () {
            return projectAvailable;
        };

        /**
         * Get the configuration of the value entered in parameter.
         * @param {String} value
         * @returns {Object}
         */
        this.getConfig = function (value) {
            return this.config[value];
        };

        /**
         * Checks the suppport of 3D and write a message in log.
         * @returns {Boolean}   Returns true if 3D is supported, else false.
         */
        this.is3DSupported = function () {
            var canvas, gl;
            if (support3D !== null)
                return support3D;
            try {
                canvas = document.createElement('canvas');
                gl = canvas.getContext('webgl');
            } catch (e) {
                gl = null;
            }
            if (gl === null) {
                try {
                    gl = canvas.getContext("experimental-webgl");
                }
                catch (e) {
                    gl = null;
                }
            }
            if (gl === null) {
                support3D = false;
                this.log("3D functions not supported");
            } else {
                support3D = true;
                this.log("3D functions supported");
            }
            return support3D;
        };

        /**
         * Checks if cache (i.e. localStorage) is enabled.
         * @returns {Boolean}   Returns true cache is enabled, otherwise false
         */
        this.isCacheEnabled = function () {
            return (typeof window.localStorage !== 'undefined' && this.config['cache']);
        };

        this.log = function (message) {
            if (this.config["log"]) {
                window.console.log(message);
            }
        };

        this.error = function (message) {
            if (this.config["error"]) {
                window.console.error(message);
            } else {
                this.log("ERROR> " + message);
            }
        };

        this.isLogEnabled = function () {
            return this.config["log"];
        };

        this.getFirstBrowserLanguage = function () {
            var nav = window.navigator;
            var browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'];
            var i;
            var language;
            // support for HTML 5.1 "navigator.languages"
            if (Array.isArray(nav.languages)) {
                for (i = 0; i < nav.languages.length; i++) {
                    language = nav.languages[i];
                    if (language && language.length) {
                        return language;
                    }
                }
            }

            // support for other well known properties in browsers
            for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
                language = nav[browserLanguagePropertyKeys[i]];
                if (language && language.length) {
                    return language;
                }
            }

            return null;
        };

    };

    var environmentInstance = new TEnvironment();

    return environmentInstance;
});
