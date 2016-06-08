define(['ui/TComponent', 'TUI', 'TEnvironment', 'TError', 'jquery', 'ui/TSidebarPrograms', 'ui/TSidebarResources'], function(TComponent, TUI, TEnvironment, TError, $,  TSidebarPrograms, TSidebarResources) {

    function TSidebar(callback) {

        var $sidebar, $switchPrograms, $switchResources;
        var programs, resources;

        TComponent.call(this, "TSidebar.html", function(component) {
            $sidebar = component;
            $switchPrograms = component.find("#tsidebar-switch-programs");
            $switchPrograms.prop("title", TEnvironment.getMessage("switch-programs"));
            $switchPrograms.click(function(e) {
                TUI.togglePrograms();
            });
            $switchResources = component.find("#tsidebar-switch-resources");
            $switchResources.prop("title", TEnvironment.getMessage("switch-resources"));
            $switchResources.click(function(e) {
                TUI.toggleResources();
            });

            var self = this;
            programs = new TSidebarPrograms(function(c) {
                component.find("#TSidebarPrograms").replaceWith(c);
                resources = new TSidebarResources(function(c) {
                    component.find("#TSidebarResources").replaceWith(c);
                    if (typeof callback !== 'undefined') {
                        init =  true;
                        callback.call(self, component);
                    }
                });
            });
        });

        /**
         * Display Sidebar.
         */
        this.onDOMReady = function() {
            this.displayPrograms();
            programs.init();
            resources.init();
        };

        /**
         * Loads Programs and Resources.
         */
        this.load = function() {
            programs.load();
            resources.load();
        };

        /**
         * Update Programs.
         */
        this.updatePrograms = function() {
            programs.update();
        };

        this.updateResources = function() {
            resources.update();
        };
        
        this.update = function() {
            this.updatePrograms();
            this.updateResources();
        };

        this.updateProgramInfo = function(program) {
            programs.updateInfo(program);
        };

        this.showLoadingProgram = function(name) {
            programs.showLoading(name);
        };

        this.removeLoadingProgram = function(name) {
            programs.removeLoading(name);
        };

        this.showRenamingProgram = function(name) {
            programs.showRenaming(name);
        };

        this.showRenamingResource = function(name) {
            resources.showRenaming(name);
        };

        this.show = function() {
            $sidebar.show();
        };

        this.hide = function() {
            $sidebar.hide();
        };

        this.displayPrograms = function() {
            resources.hide();
            $switchResources.removeClass("active");
            $switchPrograms.addClass("active");
            $sidebar.stop().animate({width: "260px"}, 200, function() {
                programs.show();
                programs.setEditionEnabled(programs.hasCurrent());
            });
        };

        this.displayResources = function() {
            if (!TEnvironment.isProjectAvailable()) {
                // Project is not available: we cannot manage resources
                var error = new TError(TEnvironment.getMessage('resources-unavailable-user-not-logged'));
                TUI.addLogError(error);
                return false;
            } else {
                programs.hide();
                $switchPrograms.removeClass("active");
                $switchResources.addClass("active");
                $sidebar.stop().animate({width: "440px"}, 200, function() {
                    resources.show();
                    resources.setEditionEnabled(resources.hasCurrent());
                });
                return true;
            }
        };
        
        this.close = function() {
            programs.hide();
            resources.hide();
            $switchPrograms.removeClass("active");
            $switchResources.removeClass("active");
            $sidebar.stop().animate({width: "65px"}, 200);
        };

        this.selectResource = function(name) {
            resources.select(name);
        };

        this.viewResource = function(name) {
            resources.view(name);
        };

        this.getCurrentResourceName = function() {
            return resources.getCurrentName();
        };

        this.createResource = function() {
            resources.create();
        };
        
        this.setEditionEnabled = function(value) {
            programs.setEditionEnabled(value);
            resources.setEditionEnabled(value);
        };

        this.setProgramsEditionEnabled = function(value) {
            programs.setEditionEnabled(value);
        };

        this.setResourcesEditionEnabled = function(value) {
            resources.setEditionEnabled(value);
        };

    }

    TSidebar.prototype = Object.create(TComponent.prototype);
    TSidebar.prototype.constructor = TSidebar;

    return TSidebar;
});
