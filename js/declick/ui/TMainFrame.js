define(['ui/TComponent', 'ui/TLearnFrame', 'ui/TCreateFrame', 'TEnvironment', 'TProject', 'TRuntime', 'TUI', 'jquery', 'env/TRouter'], function(TComponent, TLearnFrame, TCreateFrame, TEnvironment, TProject, TRuntime, TUI, $, TRouter) {
    function TMainFrame(callback) {
        var createFrame, learnFrame, $createFrame, $learnFrame, $loading;
        var self = this;
        var createInitialized = false;
        var learnInitialized = false;
        var createProject;
        var create = false;
        var learn = false;
        
        TComponent.call(this, "TMainFrame.html", function(component) {
            $loading = component.find("#tmainframe-loading");
            var loadingText = $loading.find("p");
            loadingText.text(TEnvironment.getMessage('loading-message'));
            createFrame = new TCreateFrame(function(c) {
                $createFrame = c;
                component.find("#TCreateFrame").replaceWith(c);
                learnFrame = new TLearnFrame(function(d) {
                    $learnFrame = d;
                    component.find("#TLearnFrame").replaceWith(d);
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component);
                    }
                });
            });
        });
        
        this.onDOMReady = function() {
            $createFrame.hide();
            $learnFrame.hide();
            TUI.setMainFrame(this);
            createProject = new TProject();
            createProject.init(function() {
                TRouter.route();
                $loading.fadeOut(1000, function() {
                    $(this).remove();
                });
                window.addEventListener("hashchange", function() {
                    TRouter.route();
                }, false);
            });
        };
        
        this.create = function() {
            if (!create) {
                TEnvironment.setProject(createProject);
                $learnFrame.hide();
                $createFrame.show();
                if (!createInitialized) {
                    createFrame.onDOMReady();
                    createInitialized = true;
                } else {
                    var graphics = TRuntime.getGraphics();
                    graphics.setCanvas("tcanvas");
                }
                TUI.clear(false);
                TUI.enableEditor(false);
                learn = false;
                create = true;
            }
        };
        
        this.learn = function(id) {
            if (!learn) {
                $createFrame.hide();
                $learnFrame.show();
                if (!learnInitialized) {
                    learnFrame.onDOMReady();
                    learnInitialized = true;
                } else {
                    var graphics = TRuntime.getGraphics();
                    graphics.setCanvas("tlearncanvas");
                }
                learnFrame.clear();
                learn = true;
                create = false;
            }
            learnFrame.load(id);
        };

    }

    TMainFrame.prototype = Object.create(TComponent.prototype);
    TMainFrame.prototype.constructor = TMainFrame;

    return TMainFrame;
});
