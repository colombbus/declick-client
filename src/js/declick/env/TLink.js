define(['jquery', 'TUtils', 'TEnvironment', 'TError', 'TParser'], function($, TUtils, TEnvironment, TError, TParser) {
    /**
     * TLink is the bridge between client and server.
     * It loads projects.
     * @exports TLink
     */
    var TLink = function() {
        var projectId = false;

        /**
         * Set the ID project to value.
         * @param {Number} value
         */
        this.setProjectId = function(value) {
            projectId = value;
        };
        
        /**
         * Get the list of programs.
         * @param {Function} callback
         */
        this.getProgramList = function(callback) {
            if (TEnvironment.debug)
                callback.call(this, ["bob.tgr", "pomme.tgr", "cubeQuest.tgr"]);
            else {
                var url = TEnvironment.getBackendUrl('getprograms');
                var input = {};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    data: input,
                    type: "POST",
                    global: false,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this, data['programs'], data['id']);                            
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Get the code of the current program.
         * @param {String} name
         * @param {Function} callback
         */
        this.getProgramCode = function(name, callback) {
            var url;
            name = TUtils.getString(name);
            if (TEnvironment.debug) {
                url = TEnvironment.getProjectResource(name);
                $.ajax({
                    dataType: "text",
                    url: url,
                    global: false,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);                            
                        } else {
                            callback.call(this, data);
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            } else {
                url = TEnvironment.getBackendUrl('getcode');
                var input = {'name': name};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);                            
                        } else {
                            callback.call(this, data['code']);
                        }
                        code = data['code'];
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);                            
                    }
                });
            }
        };

        /**
         * Get statements of the current program.
         * @param {String} name
         * @param {Function} callback
         */
        this.getProgramStatements = function(name, callback) {
            try {
                this.getProgramCode(name, function(code) {
                    if (code instanceof TError) {
                        callback.call(this, code);
                    } else {
                        var statements = TParser.parse(code, name);
                        callback.call(this, statements);
                    }
                });
            }
            catch (e) {
                var error = new TError(e);
                error.setProgramName(name);
                error.setCode(code);
                callback.call(this, error);
            }
        };

        /**
         * Save the current program. Does not save the whole project.
         * @param {String} name
         * @param {String} code
         * @param {String[]} statements
         * @param {Function} callback
         */
        this.saveProgram = function(name, code, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('setprogramcontent');
                var input = {'name': name, 'code': code};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this);
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Create a new program.
         * @param {String} name Program's name
         * @param {Function} callback
         */
        this.createProgram = function(name, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('createprogram');
                var input = {'name': name};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this);
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Rename the current program.
         * @param {String} name Actual name
         * @param {type} newName    New name
         * @param {type} callback
         */
        this.renameProgram = function(name, newName, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('renameprogram');
                var input = {'name': name, 'new': newName};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this);
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Get resources of the project.
         * @param {Function} Callback
         */
        this.getResources = function(callback) {
            if (TEnvironment.debug) {
                callback.call(this, {"arbre.gif": {"type": "image"}, "arrivee.png": {"type": "image"}, "bat1.png": {"type": "image"}, "bat2.png": {"type": "image"}, "bob.png": {"type": "image"}, "bob_droite_1.png": {"type": "image"}, "bob_droite_2.png": {"type": "image"}, "bob_droite_3.png": {"type": "image"}, "bob_droite_4.png": {"type": "image"}, "bob_droite_5.png": {"type": "image"}, "bob_droite_6.png": {"type": "image"}, "bob_face.png": {"type": "image"}, "bob_gauche_1.png": {"type": "image"}, "bob_gauche_2.png": {"type": "image"}, "bob_gauche_3.png": {"type": "image"}, "bob_gauche_4.png": {"type": "image"}, "bob_gauche_5.png": {"type": "image"}, "bob_gauche_6.png": {"type": "image"}, "boum.png": {"type": "image"}, "cle.png": {"type": "image"}, "ennemi.png": {"type": "image"}, "ennemi2.png": {"type": "image"}, "ennemi3.png": {"type": "image"}, "fini.png": {"type": "image"}, "fond.png": {"type": "image"}, "game over.png": {"type": "image"}, "gameover.png": {"type": "image"}, "maison.gif": {"type": "image"}, "mechant1.png": {"type": "image"}, "mechant2.png": {"type": "image"}, "menujeu.png": {"type": "image"}, "niveau1.png": {"type": "image"}, "niveau2.png": {"type": "image"}, "niveau3.png": {"type": "image"}, "niveau4.png": {"type": "image"}, "niveau5.png": {"type": "image"}, "niveau6.png": {"type": "image"}, "niveau7.png": {"type": "image"}, "niveau8.png": {"type": "image"}, "nok1.png": {"type": "image"}, "nok2.png": {"type": "image"}, "nok3.png": {"type": "image"}, "ok.png": {"type": "image"}, "perso.png": {"type": "image"}, "pomme.gif": {"type": "image"}, "porte.png": {"type": "image"}, "porte_ouverte.png": {"type": "image"}, "sol.gif": {"type": "image"}});
            } else {
                var url = TEnvironment.getBackendUrl('getresources');
                var input = {};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    data: input,
                    type: "POST",
                    global: false,
                    success: function(data) {
                        if (typeof callback !== 'undefined') {
                            var e = checkError(data);
                            if (e!==false) {
                                callback.call(this, e);
                            } else {
                                callback.call(this, data['resources'], data['id']);                                
                            }
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };
        
        /**
         * Get Resource's URL.
         * @param {type} name
         * @param {type} version
         * @returns {String}
         */
        this.getResourceLocation = function(name, version) {
            if (TEnvironment.debug) {
                return TEnvironment.getBaseUrl() + "/tests/" + name;
            } else {
                if (projectId) {
                    return TEnvironment.getBackendUrl('getresource') + "/" + projectId + "/" + version + "/" + encodeURIComponent(name);
                } else {
                    return TEnvironment.getBackendUrl('getresource') + "/" + version + "/" + encodeURIComponent(name);
                }
            }
        };

        /**
         * Rename a resource.
         * @param {String} name Actual name
         * @param {type} newName    New name
         * @param {type} callback
         */
        this.renameResource = function(name, newBaseName, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('renameresource');
                var input = {'name': name, 'new': newBaseName};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this, data['updated']);
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Delete the current program.
         * @param {String}  name
         * @param {Function}    callback
         */
        this.deleteProgram = function(name, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('removeprogram');
                var input = {'name': name};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this);
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Delete the current resource.
         * @param {String}  name
         * @param {Function}    callback
         */
        this.deleteResource = function(name, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('removeresource');
                var input = {'name': name};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                         } else {
                            callback.call(this);
                         }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Set a content for the resource "name".
         * @param {String} name
         * @param {String} data
         * @param {Function} callback
         */
        this.setResourceContent = function(name, data, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('setresource');
                var input = {'name': name, 'data': data};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this, {'name': data.updated, 'data': data.data});
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };
        
        /**
         * Get content of resource "name".
         * @param {String} name
         * @param {Function} callback
         */
        this.getResourceContent = function(name, version, callback) {
            var url = this.getResourceLocation(name, version);
            $.get(url, null, function(data) {
                callback.call(this, data);
            }, "text");
        };

        /**
         * Duplicate resource "name".
         * @param {String} name
         * @param {Function} callback
         */
        this.duplicateResource = function(name, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('duplicateresource');
                var input = {'name': name};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this, {'name': data.created, 'data': data.data});
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Create a new resource.
         * @param {String} name
         * @param {String} data
         * @param {Function} callback
         */
        this.createResource = function(name, data, callback) {
            if (!TEnvironment.debug) {
                var url = TEnvironment.getBackendUrl('createresource');
                var input = {'name': name, 'data': data};
                if (projectId) {
                    input['project_id'] = projectId;
                }
                $.ajax({
                    dataType: "json",
                    url: url,
                    type: "POST",
                    global: false,
                    data: input,
                    success: function(data) {
                        var e = checkError(data);
                        if (e !== false) {
                            callback.call(this, e);
                        } else {
                            callback.call(this, {'name': data.created, 'data': data.data});
                        }
                    },
                    error: function(data, status, error) {
                        var e = new TError(error);
                        callback.call(this, e);
                    }
                });
            }
        };

        /**
         * Checks if there is an error in data.
         * @param {type} data
         * @returns {TError|Boolean}    Returns error if existing, else false.
         */
        function checkError(data) {
            if (typeof data !== 'undefined' && typeof data['error'] !== 'undefined') {
                var e = new TError(TEnvironment.getMessage("backend-error-" + data['error']));
                return e;
            } else {
                return false;
            }
        }

    };

    var linkInstance = new TLink();

    return linkInstance;
});