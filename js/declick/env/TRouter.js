define(['TUI'], function(TUI) {
    var TRouter = function() {
        
        var getPart = function(hash, part) {
            var fragments = hash.split("&");
            for (var i=0; i<fragments.length;i++) {
                var parts = fragments[i].split("=");
                if (parts[0] === part) {
                    if (parts.length>0) {
                        return parts[1];
                    }   
                }
            }
            return false;
        };
        
        var getOperation = function(hash) {
            return getPart(hash, "op");
        };
        
        var getId = function(hash) {
            var strId = getPart(hash, "id");
            if (strId !== false) {
                var id = parseInt(strId);
                if (!isNaN(id)) {
                    return id;
                }
            }
            return false;
        };
        
        this.route = function() {
            var hash = document.location.hash;
            // remove #
            hash = hash.substring(1);
            var operation = getOperation(hash);
            if (operation !== false) {
                switch (operation) {
                    case "create":
                        TUI.create();
                        return;
                    case "learn":
                        var id = getId(hash);
                        if (id !== false) {
                            TUI.learn(id);
                            return;
                        }
                        break;
                    case "page":
                        var id = getId(hash);
                        if (id !== false) {
                            TUI.page(id);
                            return;
                        }
                        break;
                }
            }
            TUI.create();
        };
    };
    
    var routerInstance = new TRouter();
    
    return routerInstance;
});


