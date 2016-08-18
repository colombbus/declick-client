define(['TLink', 'TProgram', 'TEnvironment', 'TUtils', 'TError', 'TRuntime'], function(TLink, TProgram, TEnvironment, TUtils, TError, TRuntime) {
    /**
     * TProject is used to manage Declick's projects.
     * @exports TProject
     */
    function TProject() {

        var name="";
        var id=-1;
        var programs = [];
        var resourcesNames = [];
        var resources = {};
        var editedPrograms = {};
        var sessions = {};
        var editedProgramsNames = [];
        var editedProgramsArray = [];

        /**
         * 
         * @param {type} value
         * @returns {undefined}Set Project's name.
         * @param {String} value
         */
        this.setName = function(value) {
            name = value;
        };

        /**
         * Get Project's name.
         */
        this.getName = function() {
            return name;
        };

        /**
         * Set Project's ID.
         * @param {Number} value
         */
        this.setId = function(value) {
            if (value !== false && typeof value !== "number") {
                value = parseInt(value);
            }
            if (isNaN(value)) {
                value = false;
            } 
            id = value;
            TLink.setProjectId(value);
        };

        /**
         * Get Project's ID.
         */
        this.getId = function() {
            return id;
        };

        /**
         * 
         * @param {type} oldName
         * @param {type} newName
         * @param {type} callback
         * @returns {undefined}Rename 'oldname' program.
         * @param {String} oldName  Program to rename
         * @param {String} newName  New name of the program
         * @param {Function} callback
         */
        this.renameProgram = function(oldName, newName, callback) {
            if (typeof editedPrograms[oldName] !== 'undefined') {
                var program = editedPrograms[oldName];
                program.rename(newName, function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        // add newname records
                        programs.push(newName);
                        sessions[newName] = sessions[oldName];
                        editedPrograms[newName] = editedPrograms[oldName];

                        // remove oldname records
                        var i = programs.indexOf(oldName);
                        if (i > -1) {
                            // Should always be the case
                            programs.splice(i, 1);
                        }
                        delete sessions[oldName];
                        delete editedPrograms[oldName];

                        // update programs lists
                        programs = TUtils.sortArray(programs);
                        updateEditedPrograms();
                        callback.call(this);
                    }
                });
            }
        };

        /**
         * Create a new Program for Project, and return it.
         * @returns {TProgram}
         */
        this.createProgram = function() {
            var program = new TProgram(programs);
            var name = program.getName();
            programs.push(name);
            programs = TUtils.sortArray(programs);
            editedPrograms[name] = program;
            updateEditedPrograms();
            return program;
        };

        /**
         * TBD
         * @param {TProgram} program
         * @param {?} session
         */
        this.updateSession = function(program, session) {
            sessions[program.getName()] = session;
            program.setCode(session.getValue());
        };

        /**
         * Save the current program.
         * @param {TProgram} program
         * @param {Function} callback
         * @param {?} session
         */
        this.saveProgram = function(program, callback, session) {
            if (typeof session !== 'undefined') {
                this.updateSession(program, session);
            }
            program.save(callback);
        };

        /**
         * Get 'name' if it's an edited program.
         * @param {String} name
         * @returns {TProgram|Boolean} If 'name' is edited, returns it.
         * Else return false.
         */
        this.getEditedProgram = function(name) {
            if (typeof editedPrograms[name] !== 'undefined') {
                return editedPrograms[name];
            }
            return false;
        };

        /**
         * Edit 'name' program.
         * @param {String} name
         * @param {Function} callback
         * @param {?} session
         */
        this.editProgram = function(name, callback, session) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                program.load(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        editedPrograms[name] = program;
                        // sort editing programs alphabetically
                        updateEditedPrograms();
                        callback.call(this);
                    }
                });
            }
        };

        /**
         * Get statements of a program given in parameter.
         * Send it in parameter to callback.
         * @param {String} name
         * @param {Function} callback
         */
        this.getProgramStatements = function(name, callback) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                program.load(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        editedPrograms[name] = program;
                        // sort editing programs alphabetically
                        updateEditedPrograms();
                        var result;
                        try {
                            result = program.getStatements();
                        } catch(e) {
                            result = new TError(e);
                        }
                        callback.call(this, result);
                    }
                });
            } else {
                var program = editedPrograms[name];
                callback.call(this, program.getStatements());
            }
        };
        
        /**
         * Get code of a program given in parameter.
         * Send it in parameter to callback.
         * @param {String} name
         * @param {Function} callback
         */
        this.getProgramCode = function(name, callback) {
            if (typeof editedPrograms[name] === 'undefined') {
                var program = new TProgram(name);
                program.load(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        editedPrograms[name] = program;
                        // sort editing programs alphabetically
                        updateEditedPrograms();
                        callback.call(this, program.getCode());
                    }
                });
            } else {
                var program = editedPrograms[name];
                callback.call(this, program.getCode());
            }
        };

        /**
         * 
         * @param {type} name
         * @returns {Boolean}Checks if a program is edited.
         * @param {String} name
         * @returns {Boolean}
         */
        this.isProgramEdited = function(name) {
            return (typeof editedPrograms[name] !== 'undefined');
        };

        /**
         * 
         * @param {type} name
         * @returns {Boolean}Close a program.
         * @param {String} name
         * @returns {Boolean}
         */
        this.closeProgram = function(name) {
            if (typeof editedPrograms[name] === 'undefined') {
                return false;
            }
            var program = editedPrograms[name];
            if (program.isModified()) {
                var goOn = window.confirm(TEnvironment.getMessage('close-confirm', name));
                if (!goOn) {
                    return false;
                }
            }
            delete editedPrograms[name];
            delete sessions[name];
            updateEditedPrograms();
            if (program.isNew()) {
                // program is still new (i.e. not saved) : we remove it from programs list
                var i = programs.indexOf(program.getName());
                if (i > -1) {
                    // Should always be the case
                    programs.splice(i, 1);
                }
            }
            return true;
        };

        /**
         * Find previous edited program
         * @param {String} name
         * @returns {TProgram|Boolean} Return false if there is
         * no edited program.
         */
        this.findPreviousEditedProgram = function(name) {
            if (editedProgramsNames.length === 0) {
                return false;
            }
            var value = editedProgramsNames[0];
            name = name.toLowerCase();
            for (var i = 1; i < editedProgramsNames.length; i++) {
                if (name.localeCompare(editedProgramsNames[i].toLowerCase()) > 0) {
                    value = editedProgramsNames[i];
                }
            }
            return editedPrograms[value];
        };

        /**
         * Get session of 'program'.
         * @param {TProgram} program
         */
        this.getSession = function(program) {
            return sessions[program.getName()];
        };

        /**
         * Set the session of 'program' to 'session'.
         * @param {TProgram} program
         * @param {?} session
         */
        this.setSession = function(program, session) {
            sessions[program.getName()] = session;
        };

        /**
         * Get Programs names.
         */
        this.getProgramsNames = function() {
            return programs;
        };

        /**
         * Returns the array of edited programs.
         * @returns {TProgram[]}
         */
        this.getEditedPrograms = function() {
            return editedPrograms;
        };

        /**
         * Returns the array of programs names.
         * @returns {String[]}
         */
        this.getEditedProgramsNames = function() {
            return editedProgramsNames;
        };
        
        /**
         * Returns the array of edited programs.
         * @returns {TProgram[]}
         */
        this.getEditedPrograms = function() {
            return editedProgramsArray;
        };

        /**
         * Initialize Project, get Programs list and Resources.
         * @param {Function} callback
         * @param {Number} id
         */
        this.init = function(callback, id) {
            programs = [];
            editedPrograms = {};
            resources = {};
            resourcesNames = [];
            sessions = {};
            editedProgramsNames = [];
            editedProgramsArray = [];
            if (typeof id !== 'undefined') {
                this.setId(id);
            } else {
                this.setId(false);
            }
            // get program list
            var self = this;
            TLink.getProgramList(function(arg, id) {
                if (arg instanceof TError) {
                    // error sent: stop there
                    TEnvironment.setProjectAvailable(false);
                    TEnvironment.error(arg.getMessage());
                    callback.call(this);                    
                } else {
                    self.setId(id);
                    programs = arg;
                    // sort programs and resources alphabetically
                    programs = TUtils.sortArray(programs);
                    // get resource list
                    TLink.getResources(function(arg) {
                        if (arg instanceof TError) {
                            // error sent: stop there
                            TEnvironment.setProjectAvailable(false);
                        } else {
                            resources = arg;
                            resourcesNames = Object.keys(resources);
                            resourcesNames = TUtils.sortArray(resourcesNames);
                            TEnvironment.setProjectAvailable(true);
                            self.preloadImages();
                        }
                        callback.call(this);
                    });
                }
            });
        };

        /**
         * Return resources names.
         * @returns {String[]}
         */
        this.getResourcesNames = function() {
            return resourcesNames;
        };

        /**
         * Return resources.
         * @returns {Resource[]}
         */
        this.getResources = function() {
            return resources;
        };

        /**
         * Return a resource. Throw an error if 'name' resource is unknown.
         * @param {String} name
         * @returns {Resource}
         */
        this.getResourceInfo = function(name) {
            if (typeof resources[name] !== 'undefined') {
                return resources[name];
            } else {
                var e = new TError(TEnvironment.getMessage("resource-unknown", name));
                throw e;
            }
        };

        /**
         * Returns the first index available.
         * Throw an error if resource 'name' already exists.
         * @param {String} name
         * @returns {Number}
         */
        this.getNewResourceIndex = function(name) {
            var i;
            for (i = 0; i < resourcesNames.length; i++) {
                var current = resourcesNames[i];
                var result = current.toLowerCase().localeCompare(name.toLowerCase());
                if (result === 0) {
                    // problem: resource name already exists
                    var e = new TError(TEnvironment.getMessage("resource-name-exists", name));
                    throw e;
                }
                if (result > 0) {
                    break;
                }
            }
            return i;
        };

        /**
         * TBD
         * @param {String} name
         */
        this.uploadingResource = function(name) {
            if (typeof resources[name] !== 'undefined') {
                var e = new TError(TEnvironment.getMessage("resource-already-exists", name));
                throw e;
            }
            resources[name] = {'type': 'uploading'};
            var i = this.getNewResourceIndex(name);
            resourcesNames.splice(i, 0, name);
            return i;
        };

        /**
         * TBD
         * @param {String} name
         * @param {Resource} data
         */
        this.resourceUploaded = function(name, data) {
            resources[name] = data;
            if (data.type === 'image') {
                // preload image
                var img = new Image();
                img.src = this.getResourceLocation(name);
            }
        };

        /**
         * TBD
         * @param {String} name
         */
        this.removeUploadingResource = function(name) {
            if (typeof resources[name] !== 'undefined') {
                resources[name] = undefined;
            }
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                resourcesNames.splice(i, 1);
            }
        };

        /**
         * Rename a resource.
         * @param {String} name
         * @param {String} newBaseName
         * @param {Function} callback
         */
        this.renameResource = function(name, newBaseName, callback) {
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                // resource exists
                var resource = resources[name];
                // check that resource is not uploading
                var type = resource.type;
                if (type === 'uploading') {
                    throw new TError(TEnvironment.getMessage('resource-not-uploaded'));
                }
                var self = this;
                TLink.renameResource(name, newBaseName, function(newName) {
                    if (newName instanceof TError) {
                        // error: just forward it
                        callback.call(this, newName);
                    } else {
                        // remove old name
                        resourcesNames.splice(i, 1);
                        // add new name
                        resourcesNames.push(newName);
                        resources[newName] = resources[name];
                        resources[newName]['base-name'] = newBaseName;
                        delete resources[name];

                        // update programs lists
                        resourcesNames = TUtils.sortArray(resourcesNames);

                        // preload image if required with new name
                        if (type === 'image') {
                            self.preloadImage(newName);
                        }
                        callback.call(this, newName);
                    }
                });
            }
        };

        /**
         * TBD
         * @param {String} name
         * @param {type} data
         * @param {Function} callback
         */
        this.setResourceContent = function(name, data, callback) {
            var self = this;
            TLink.setResourceContent(name, data, function(newData) {
                if (newData instanceof TError) {
                    // error: just forward it
                    callback.call(this, newData);
                } else {
                    var newName = newData['name'];
                    if (newName !== name) {
                        // name has changed
                        // remove old name
                        var i = resourcesNames.indexOf(name);
                        resourcesNames.splice(i, 1);
                        // add new name
                        resourcesNames.push(newName);
                        delete resources[name];
                        // update programs lists
                        resourcesNames = TUtils.sortArray(resourcesNames);
                        name = newName;
                    }
                    resources[name] = newData['data'];
                    // preload image
                    self.preloadImage(name);
                    callback.call(this, name);
                }
            });
        };

        /**
         * Return location of 'name' resource.
         * @param {String} name
         * @return {String}
         */
        this.getResourceLocation = function(name) {
            return TLink.getResourceLocation(name, resources[name].version);
        };

        /**
         * Return base name of 'name' resource.
         * @param {String} name
         * @return {String}
         */
        this.getResourceBaseName = function(name) {
            return resources[name]['base-name'];
        };

        /**
         * Preload an image.
         * @param {String} name
         */
        this.preloadImage = function(name) {
            var img = new Image();
            img.src = this.getResourceLocation(name);
        };

        /**
         * Preload all images. (in development)
         */
        this.preloadImages = function() {
            /*for (var i=0; i<resourcesNames.length; i++) {
             var name = resourcesNames[i];
             if (resources[name].type === 'image') {
             this.preloadImage(name);
             }
             }*/
        };

        /**
         * Returns true if a least one program is modified.
         * @returns {Boolean}
         */
        this.isUnsaved = function() {
            for (var i = 0; i < editedProgramsNames.length; i++) {
                var program = editedPrograms[editedProgramsNames[i]];
                if (program.isModified()) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Delete a program.
         * @param {String} name
         * @param {Function} callback
         */
        this.deleteProgram = function(name, callback) {
            if (typeof editedPrograms[name] !== 'undefined') {
                var program = editedPrograms[name];
                program.delete(function(error) {
                    if (typeof error !== 'undefined') {
                        callback.call(this, error);
                    } else {
                        // delete corresponding records
                        var i = programs.indexOf(name);
                        if (i > -1) {
                            // Should always be the case
                            programs.splice(i, 1);
                        }
                        delete sessions[name];
                        delete editedPrograms[name];

                        // update programs lists
                        updateEditedPrograms();
                        callback.call(this);
                    }
                });
            }
        };

        /**
         * Delete a resource.
         * @param {String} name
         * @param {Function} callback
         */
        this.deleteResource = function(name, callback) {
            var i = resourcesNames.indexOf(name);
            if (i > -1) {
                // resource exists
                var resource = resources[name];
                // check that resource is not uploading
                var type = resource.type;
                if (type === 'uploading') {
                    //TODO: find a way to cancel upload?
                    callback.call(this, new TError(TEnvironment.getMessage('resource-not-uploaded')));
                }
                TLink.deleteResource(name, function(error) {
                    if (typeof error !== 'undefined') {
                        // error: just forward it
                        callback.call(this, error);
                    } else {
                        // remove name
                        resourcesNames.splice(i, 1);
                        delete resources[name];
                        callback.call(this);
                    }
                });
            }
        };

        /**
         * Duplicate an existing resource.
         * @param {String} name
         * @param {Function} callback
         */
        this.duplicateResource = function(name, callback) {
            var self = this;
            TLink.duplicateResource(name, function(newData) {
                if (newData instanceof TError) {
                    // error: just forward it
                    callback.call(this, newData);
                } else {
                    var newName = newData['name'];
                    resourcesNames.push(newName);
                    resourcesNames = TUtils.sortArray(resourcesNames);
                    resources[newName] = newData['data'];
                    // preload image
                    self.preloadImage(newName);
                    callback.call(this, newName);
                }
            });
        };

        /**
         * Create a new resource.
         * @param {String} name
         * @param {Number} width
         * @param {Number} height
         * @param {Function} callback
         */
        this.createResource = function(name, width, height, callback) {
            // create image
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var imageData = canvas.toDataURL();
            var self = this;
            TLink.createResource(name, imageData, function(newData) {
                if (newData instanceof TError) {
                    // error: just forward it
                    callback.call(this, newData);
                } else {
                    var newName = newData['name'];
                    resourcesNames.push(newName);
                    resourcesNames = TUtils.sortArray(resourcesNames);
                    resources[newName] = newData['data'];
                    // preload image
                    self.preloadImage(newName);
                    callback.call(this, newName);
                }
            });
        };
        
        /**
         * Get the content of 'name' resource.
         * @param {String} name
         * @param {Function} callback
         */
        this.getResourceContent = function(name, callback) {
            return TLink.getResourceContent(name, resources[name].version, callback);
        };

        /**
         * Update array of edited programs. (sorted alphabetically)
         */
        var updateEditedPrograms = function() {
            editedProgramsNames = Object.keys(editedPrograms);
            editedProgramsNames = TUtils.sortArray(editedProgramsNames);
            editedProgramsArray = [];
            for (var i = 0; i < editedProgramsNames.length; i++) {
                editedProgramsArray.push(editedPrograms[editedProgramsNames[i]]);
            }
        };
        
        /**
         * TBD
         * @param {type} progress
         * @param {Function} callback
         */
        this.preloadResources = function(progress, callback) {
            // TODO: handle preload of other resource types
            var graphicalResources = [];
            for (var name in resources) {
                var resource = resources[name];
                if (resource.type === "image") {
                    graphicalResources.push(this.getResourceLocation(name));
                }
            }
            var g = TRuntime.getGraphics();
            if (graphicalResources.length>0) {
                g.preload(graphicalResources, progress, callback);
            } else {
                callback.call(this);
            }
        };

    }

    return TProject;

});

