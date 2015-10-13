require.config({
    "baseUrl": 'js/tangara',
    paths: {
        "jquery": '../libs/jquery-1.11.1/jquery-1.11.1.min',
        "quintus": '../libs/quintus-0.2.0/quintus-all.min',
        "acorn": '../libs/acorn/acorn',
        "TObject": 'objects/tobject/TObject',
        "TObject3D": 'objects/tobject3d/TObject3D',
        "TGraphicalObject": 'objects/tgraphicalobject/TGraphicalObject',
        "babylon": '../libs/babylonjs/babylon.1.14',
        "TProject": "data/TProject",
        "TProgram": "data/TProgram",
        "TEnvironment": "env/TEnvironment",
        "TLink": "env/TLink",
        "TI18n": "env/TI18n",
        "TInterpreter": "run/TInterpreter",
        "TParser": "run/TParser",
        "TRuntime": "run/TRuntime",
        "TGraphics": "run/TGraphics",
        "TUI": "ui/TUI",
        "CommandManager": "utils/CommandManager",
        "ResourceManager": "utils/ResourceManager",
        "SynchronousManager": "utils/SynchronousManager",
        "TError": "utils/TError",
        "TUtils": "utils/TUtils",
        "TResource": "data/TResource"
    }
});

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TCanvas', 'TProject', 'TError'], function($, TEnvironment, TRuntime, TCanvas, TProject, TError) {
        window.console.log("*******************");
        window.console.log("* Loading Environment *");
        window.console.log("*******************");
        TEnvironment.load(function() {
            TEnvironment.log("*******************");
            TEnvironment.log("* Loading Runtime *");
            TEnvironment.log("*******************");
            TRuntime.load(function() {
                var canvas = new TCanvas(function(component) {
                    $("body").append(component);
                    $(document).ready(function() {
                        canvas.displayed();
                        // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
                        $(window).resize();
                        canvas.showLoading();
                        var currentProject = new TProject();
                        currentProject.init(function() {
                            TEnvironment.setProject(currentProject);
                            currentProject.getProgramStatements(init_programName, function(statements) {
                                if (statements instanceof TError) {
                                    window.console.error(statements.getMessage());
                                }
                                currentProject.preloadResources(function(count, total) {
                                        canvas.setLoadingValue(count, total);
                                    }, function() {
                                    canvas.removeLoading();
                                    canvas.giveFocus();
                                    TRuntime.executeStatements(statements, init_programName);
                                });
                            });
                        }, init_projectId);
                    });
                });
            });
        });
    });
}

// TODO: handle loading
var loading = new Image();
loading.src = "images/loader2.gif";
if (loading.complete) {
    load();
} else {
    loading.onload = load();
}


