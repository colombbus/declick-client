define(['jquery', 'TResource', 'TEnvironment'], function($, TResource, TEnvironment) {
    /**
     * Internationalization of Declick.
     * Allows the program to be adapted to various languages.
     * @exports TI18n
     */
    var TI18n = function() {
        var processedFiles = {};
        var hiddenMethods = {};
        var waiting = {};
        var translatedClasses = [];
        var self;

        /**
         * If the function is called for the first time for "aClass", load
         * tranlation file.
         * Translate each method which isn't into "hideMethods".
         * @param {String} aClass
         * @param {String} file
         * @param {String} language
         * @param {String[]} hideMethods
         * @param {Function} callback
         */
        var addTranslatedMethods = function(file, language, hideMethods, callback) {
            var translatedMethods = {};
            if (typeof processedFiles[file] !== "undefined") {
                hideMethods = hideMethods.concat(hiddenMethods[file]);
                // translation already loaded: we use it
                $.each(processedFiles[file], function(name, value) {
                    if (hideMethods.indexOf(name) === -1) {
                        translatedMethods[name] = value;
                    }
                });
                if (typeof (callback !== 'undefined')) {
                    callback.call(null, translatedMethods, hideMethods);
                }
            } else {
                // load translation file
                TResource.get(file, [language, 'hide'], function(data) {
                    processedFiles[file] = {};
                    if (typeof data.hide !== "undefined") {
                        // there are methods to hide
                        hiddenMethods[file] = data.hide;
                        hideMethods = hideMethods.concat(data.hide);
                    } else {
                        hiddenMethods[file] = [];
                    }
                    if (typeof data[language] !== "undefined") {
                        $.each(data[language]['methods'], function(key, val) {
                            if (hideMethods.indexOf(val.name) === -1) {
                                var value = {translated: val.translated, displayed: val.displayed};
                                processedFiles[file][val.name] = value;
                                translatedMethods[val.name] = value;
                            }
                        });
                    } else {
                        TEnvironment.error("Error loading translated methods (" + file + "): ");
                    }
                    if (typeof callback !== 'undefined') {
                        callback.call(self, translatedMethods, hideMethods);
                    }
                });
            }
        };

        /**
         * If the function is called for the first time for "aClass", load
         * message file.
         * Translate each messages.
         * @param {String} aClass
         * @param {String} file
         * @param {String} language
         * @param {Function} callback
         */
        var addTranslatedMessages = function(aClass, file, language, callback) {
            if (typeof aClass.messages === "undefined") {
                aClass.messages = {};
            }
            if (typeof processedFiles[file] !== "undefined") {
                // file has already been processed
                $.each(processedFiles[file], function(name, value) {
                    if (typeof aClass.messages[name] === 'undefined') {
                        // only set message if not already set
                        aClass.messages[name] = value;
                    }
                });
                if (typeof (callback !== 'undefined')) {
                    callback.call(self);
                }
            } else {
                // load message file
                TResource.get(file, [language], function(data) {
                    processedFiles[file] = {};
                    if (typeof data[language] !== 'undefined') {
                        $.each(data[language], function(name, value) {
                            if (typeof aClass.messages[name] === 'undefined') {
                                // only set message if not already set
                                aClass.messages[name] = value;
                                processedFiles[file][name] = value;
                            }
                        });
                        TEnvironment.log("found messages in language: " + language);
                    } else {
                        TEnvironment.log("found no messages for language: " + language);
                    }
                    if (typeof callback !== 'undefined') {
                        callback.call(self);
                    }
                });
            }
        };

        /**
         * Tranlates Methods, then Messages of "aClass", and recall himself
         * with ParentPrototype.
         * @param {String} aClass
         * @param {String} prototype
         * @param {Boolean} parents
         * @param {String} language
         * @param {String[]} translated
         * @param {String[]} hidden
         * @param {Function} callback
         */
        var i18nClass = function(aClass, prototype, parents, language, translated, hidden, callback) {
            var translationFile = prototype.getResource("i18n.json");
            var messageFile = prototype.getResource("messages.json");
            // 1st load translated methods
            addTranslatedMethods(translationFile, language, hidden, function(newTranslated, hidden) {
                $.extend(translated, newTranslated);
                addTranslatedMessages(aClass, messageFile, language, function() {
                    if (parents) {
                        var parentPrototype = Object.getPrototypeOf(prototype);
                        if (parentPrototype !== Object.prototype) {
                            // Check if parent has been translated
                            var parentClassName = parentPrototype.className;
                            if (translatedClasses.indexOf(parentClassName) !== -1) {
                                i18nClass(aClass, parentPrototype, parents, language, translated, hidden, callback);
                            } else {
                                // not translated yet: wait for translation
                                if (typeof waiting[parentClassName] === 'undefined') {
                                    waiting[parentClassName] = [];
                                }
                                waiting[parentClassName].push(function() {
                                    i18nClass(aClass, parentPrototype, parents, language, translated, hidden, callback);
                                });
                            }
                        } else {
                           if (typeof callback !== 'undefined') {
                                callback.call(self, translated);
                            }
                        }
                    } else if (typeof callback !== 'undefined') {
                        callback.call(self, translated);
                    }
                });
            });
        };

        /**
         * Internationalize both Methods and Message of "initialClass".
         * @param {String} initialClass
         * @param {Boolean} parents
         * @param {String} language
         * @param {Function} callback
         */
        this.internationalize = function(initialClass, parents, language, callback) {
            self = this;
            i18nClass(initialClass, initialClass.prototype, parents, language, {}, [], function(translated) {
                // declare translated methods in object prototype
                var translatedMethods = {};
                var translatedMethodsDisplay = {};
                for (var name in translated) {
                    var value = translated[name];
                    translatedMethods[name] = value.translated;
                    translatedMethodsDisplay[value.translated] = value.displayed;
                }
                initialClass.prototype.translatedMethods = translatedMethods;
                initialClass.prototype.translatedMethodsDisplay = translatedMethodsDisplay;
                var className = initialClass.prototype.className;
                translatedClasses.push(className);
                if (typeof waiting[className] !== 'undefined') {
                    for (var i=0;i<waiting[className].length;i++) {
                        var f = waiting[className][i];
                        f.call(this);
                    }
                    delete waiting[className];
                }
                if (typeof callback !== 'undefined') {
                    callback.call(self);
                }
            });
        };

    };

    var TI18nInstance = new TI18n();

    return TI18nInstance;

});
