// 
// - - - BABYLON EDITOR - - - 
//
// © 2013, Muriel Surmely
//
var BABYLON = BABYLON || {};

(function () {

    // Contructor
    BABYLON.Editor = function (connectedCanvas) {
        this.connectedCanvas = connectedCanvas;
        this.switchObjects = new Array();
        this.objectSelected = null;
        this.multiSelect = new Array();
        this.switchLight = new Array();
        this.numberObject = null;
        this.groupingMode = false;
        var that = this;

        // Check support
        if (!BABYLON.Engine.isSupported()) {
            window.alert('Browser not supported');
        } else {
            // Babylon
            this.engine = new BABYLON.Engine(this.connectedCanvas, true);
            this.scene = new BABYLON.Scene(this.engine);

            //Adding Camera
            this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 1.3, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
            this.camera.angularSensibility = 1000;
            this.camera.attachControl(this.connectedCanvas, true);

            // Resize
            window.addEventListener("resize", function () {
                that.engine.resize();
            });

            var sceneLoaded = function (sceneFile, babylonScene) {
                document.title = "BabylonJS - " + sceneFile.name;
                that.newSceneLoaded = babylonScene;
                that.newScene();
            };
            var progressCallback = function () {
            };
            var additionnalRenderLoopLogic = function () {

            };
            var filesInput = new BABYLON.FilesInput(this.engine, this.scene, this.connectedCanvas, sceneLoaded, progressCallback, additionnalRenderLoopLogic);
            filesInput.monitorElementForDragNDrop(this.connectedCanvas);
        }
        this.connectedCanvas.addEventListener("mousedown", function (event) {
            that._selectMesh(event);
        });
        this._createGrid();
        document.body.addEventListener("mousemove", function (event) {
            that.infoMesh();
            that._blockChange();
        });
    };

    BABYLON.Editor.prototype.newScene = function () {
        if (this.newSceneLoaded) {
            for (var it = 0; it < this.engine.scenes.length - 1; it++) {
                this.engine.scenes[it] = null;
            }
            var tmpTab = this.engine.scenes[it];
            this.engine.scenes = [];
            this.engine.scenes[0] = tmpTab;
            this.maxBoundinSphere = 0;

            for (var i = 0; i < this.newSceneLoaded.meshes.length; i++) {
                this.newSceneLoaded.meshes[i].name = i;
                this.newSceneLoaded.meshes[i].mesh = this.newSceneLoaded.meshes[i];
                this.switchObjects[i] = this.newSceneLoaded.meshes[i];
            }
            this.numberObject = i;
            if (this.newSceneLoaded.activeCamera.maxZ < 1000)
                this.newSceneLoaded.activeCamera.maxZ = 1000;

            this.newSceneLoaded.activeCamera.checkCollisions = false;
            this.newSceneLoaded.activeCamera.applyGravity = false;
            this.objectSelected = null;
            this.switchLight = [];
            this._createGrid();
        }
    };

    BABYLON.Editor.prototype.getNumberObject = function () {
        return this.numberObject;
    };

    BABYLON.Editor.prototype.setNumberObject = function (value) {
        this.numberObject = value;
        console.log(this.numberObject);
    };

    BABYLON.Editor.prototype._blockChange = function () {
        if (this.objectSelected != null) {
            document.getElementById("voile").style.display = "none";
            document.getElementById("ContentControlColors").style.position = "relative";
            document.getElementById("ContentControlScale").style.position = "relative";
            document.getElementById("scaleLocked").style.position = "relative";
            BABYLON.Manipulator.isSelected = true;
            document.getElementById("testMumuevo-cp1").style.display = "block";
            document.getElementById("testMumuevo-cp0").style.display = "block";
        }
        else {
            document.getElementById("voile").style.display = "block";
            document.getElementById("ContentControlColors").style.position = "inherit";
            document.getElementById("ContentControlScale").style.position = "inherit";
            document.getElementById("scaleLocked").style.position = "inherit";
            document.getElementById("testMumuevo-cp1").style.display = "none";
            document.getElementById("testMumuevo-cp0").style.display = "none";
            BABYLON.Manipulator.isSelected = false;
            document.getElementById("positionX").value = 0;
            document.getElementById("positionY").value = 0;
            document.getElementById("positionZ").value = 0;
            document.getElementById("scalingX").value = 0;
            document.getElementById("scalingY").value = 0;
            document.getElementById("scalingZ").value = 0;
            document.getElementById("RotationX").value = 0;
            document.getElementById("RotationY").value = 0;
            document.getElementById("RotationZ").value = 0;
        }

        if (this.switchLight[this.objectSelected] != null) {
            document.getElementById("titleObject").innerHTML = "light";
            document.getElementById("rotate").style.display = "none";
            document.getElementById("contentGroup").style.display = "none";
            document.getElementById("scale").style.display = "none";
            document.getElementById("contentRotate").style.display = "none";
            document.getElementById("ContentControlScale").style.display = "none";
            document.getElementById("transparence").style.display = "none";
            document.getElementById("contentGroup").style.display = "none";
            document.getElementById("clone").style.display = "none";
            document.getElementById("titreTransparence").style.display = "none";
            document.getElementById("blockEmissive").style.display = "none";
            document.getElementById("textTitleEmissive").style.display = "none";
            document.getElementById("ContentSlideMesh").style.width = "900px";

        }
        else if (this.switchLight[this.objectSelected] == null) {
            document.getElementById("titleObject").innerHTML = "object";
            document.getElementById("rotate").style.display = "block";
            document.getElementById("contentGroup").style.display = "block";
            document.getElementById("scale").style.display = "block";
            document.getElementById("contentRotate").style.display = "block";
            document.getElementById("ContentControlScale").style.display = "block";
            document.getElementById("transparence").style.display = "block";
            document.getElementById("contentGroup").style.display = "block";
            document.getElementById("clone").style.display = "block";
            document.getElementById("titreTransparence").style.display = "block";
            document.getElementById("blockEmissive").style.display = "block";
            document.getElementById("textTitleEmissive").style.display = "block";
            document.getElementById("ContentSlideMesh").style.width = "1788px";
        }
    };

    BABYLON.Editor.prototype.createBasicScene = function () {
        var lumiere = this.addLight("pointlight", 0);
        lumiere.parent.position.y = 23;
        lumiere.parent.position.x = 18;
        lumiere.parent.position.z = 26;
        var newMesh = new Object;
        newMesh.oParametersMesh = {
            heightValue: 6
        };
        var cube = this.addMesh(BABYLON.Manipulator.OBJECTTYPE_BOX, 1, newMesh.oParametersMesh);
        this.switchObjects[1] = new BABYLON.Manipulator(cube, this.connectedCanvas, BABYLON.Manipulator.CONTROLMODE_POSITION, false, this.pickedPoint);
        this.objectSelected = cube.name;
        this.numberObject = 2;
    };

    BABYLON.Editor.prototype.addLight = function (type, lightId) {
        var parentLight = null;
        var parentLightTexture = null;
        var haloLight = null;
        var haloLightTexture = null;
        var light = null;
        var matObjectLight = null;

        switch (type) {
            case "pointlight":
                parentLight = new BABYLON.Mesh.CreateCylinder(lightId, 2, 2, 0.5, 20, this.scene);
                parentLightTexture = new BABYLON.StandardMaterial("MaterialLight", this.scene);
                parentLightTexture.diffuseColor = new BABYLON.Color3(0, 0, 0);
                parentLightTexture.specularColor = new BABYLON.Color3(0, 0, 0);
                parentLightTexture.ambientColor = new BABYLON.Color3(0, 0, 0);
                parentLightTexture.emissiveColor = new BABYLON.Color3(242 / 255, 230 / 255, 6 / 255);
                parentLightTexture.alpha = 1;
                parentLight.material = parentLightTexture;

                haloLight = new BABYLON.Mesh.CreateCylinder(lightId, 2, 4, 2, 20, this.scene);
                haloLight.isPickable = false;
                haloLight.position.y = -2;

                haloLightTexture = new BABYLON.StandardMaterial("MaterialLight", this.scene);
                haloLightTexture.diffuseColor = new BABYLON.Color3(0, 0, 0);
                haloLightTexture.specularColor = new BABYLON.Color3(0, 0, 0);
                haloLightTexture.ambientColor = new BABYLON.Color3(0, 0, 0);
                haloLightTexture.emissiveColor = new BABYLON.Color3(242 / 255, 230 / 255, 6 / 255);
                haloLightTexture.alpha = 0.2;
                haloLight.material = haloLightTexture;
                haloLight.parent = parentLight;

                light = new BABYLON.PointLight(lightId, new BABYLON.Vector3(1, 1, 0), this.scene);
                light.specular = new BABYLON.Color3(1, 1, 1);
                light.parent = parentLight;
                this.switchObjects[lightId] = parentLight;
                this.switchLight[lightId] = light;
                break;
            case "hemisphericlight":
                parentLight = new BABYLON.Mesh.CreateSphere(lightId, 25, 1.0, this.scene);
                matObjectLight = new BABYLON.StandardMaterial("Material", this.scene);
                matObjectLight.diffuseColor = new BABYLON.Color3(0, 0, 0);
                matObjectLight.specularColor = new BABYLON.Color3(0, 0, 0);
                matObjectLight.ambientColor = new BABYLON.Color3(0, 0, 0);
                matObjectLight.emissiveColor = new BABYLON.Color3(242 / 255, 230 / 255, 6 / 255);
                parentLight.material = matObjectLight;

                haloLight = new BABYLON.Mesh.CreateSphere(lightId, 25, 3.0, this.scene);
                haloLight.isPickable = false;

                haloLightTexture = new BABYLON.StandardMaterial("Material", this.scene);
                haloLightTexture.diffuseColor = new BABYLON.Color3(0, 0, 0);
                haloLightTexture.specularColor = new BABYLON.Color3(0, 0, 0);
                haloLightTexture.ambientColor = new BABYLON.Color3(0, 0, 0);
                haloLightTexture.emissiveColor = new BABYLON.Color3(242 / 255, 230 / 255, 6 / 255);
                haloLightTexture.alpha = 0.2;
                haloLight.material = haloLightTexture;
                haloLight.parent = parentLight;

                light = new BABYLON.HemisphericLight(lightId, new BABYLON.Vector3(0, 0, 0), this.scene);
                light.specular = new BABYLON.Color3(1, 1, 1);
                light.parent = parentLight;
                this.switchObjects[lightId] = parentLight;
                this.switchLight[lightId] = light;
                break;
        }
        if (light != null) {
            return light;
        }
    };

    BABYLON.Editor.prototype._createGrid = function () {
        this.grid = BABYLON.Mesh.CreatePlane("Plane", 130.0, this.scene);
        this.grid.isPickable = false;
        this.gridTexture = new BABYLON.StandardMaterial("planetesture", this.scene);
        this.gridTexture.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.gridTexture.specularColor = new BABYLON.Color3(0, 0, 0);
        this.gridTexture.ambientColor = new BABYLON.Color3(0, 0, 0);
        this.gridTexture.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.gridTexture.diffuseTexture = new BABYLON.Texture("../../../images/grilleBis.png", this.scene);
        this.gridTexture.diffuseTexture.uScale = 20;
        this.gridTexture.diffuseTexture.vScale = 20;
        this.gridTexture.backFaceCulling = false;
        this.gridTexture.diffuseTexture.hasAlpha = true;
        this.gridTexture.diffuseTexture.anisotropicFilteringLevel = 16;
        this.grid.material = this.gridTexture;

        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.x = 0;
        this.grid.position.z = 0;
        this.grid.position.y = -5;

        var gridGuide = BABYLON.Mesh.CreatePlane("Plane", 130.0, this.scene);
        gridGuide.isPickable = false;
        var gridGuideTexture = new BABYLON.StandardMaterial("planetesture", this.scene);
        gridGuideTexture.diffuseColor = new BABYLON.Color3(0, 0, 0);
        gridGuideTexture.specularColor = new BABYLON.Color3(0, 0, 0);
        gridGuideTexture.ambientColor = new BABYLON.Color3(0, 0, 0);
        gridGuideTexture.emissiveColor = new BABYLON.Color3(0, 0, 0);
        gridGuideTexture.diffuseTexture = new BABYLON.Texture("../../../images/grille0.png", this.scene);
        gridGuideTexture.backFaceCulling = false;
        gridGuideTexture.diffuseTexture.hasAlpha = true;
        gridGuide.material = gridGuideTexture;
        gridGuide.parent = this.grid;
    };

    BABYLON.Editor.prototype.updateGrid = function (scale) {
        this.gridTexture = new BABYLON.StandardMaterial("planetesture", this.scene);
        this.gridTexture.diffuseTexture = new BABYLON.Texture("../../../images/grilleBis.png", this.scene);
        this.gridTexture.diffuseTexture.uScale = scale;
        this.gridTexture.diffuseTexture.vScale = scale;
        this.gridTexture.backFaceCulling = false;
        this.gridTexture.diffuseTexture.hasAlpha = true;
        this.grid.material = this.gridTexture;
    };

    BABYLON.Editor.prototype.updateSensibility = function (sensibility) {
        this.camera.angularSensibility = sensibility;
    };

    BABYLON.Editor.prototype.addMesh = function (objectType, objectId, oParametersMesh) {
        var object = null;
        switch (objectType) {
            case BABYLON.Manipulator.OBJECTTYPE_BOX:
                object = new BABYLON.Mesh[objectType](objectId, oParametersMesh.heightValue, this.scene);
                break;
            case BABYLON.Manipulator.OBJECTTYPE_SPHERE:
                object = new BABYLON.Mesh[objectType](objectId, oParametersMesh.segmentValue, oParametersMesh.diameterValue, this.scene);
                break;
            case BABYLON.Manipulator.OBJECTTYPE_CYLINDER:
                object = new BABYLON.Mesh[objectType](objectId, oParametersMesh.heightValue, 3, 3, oParametersMesh.segmentValue, this.scene);
                break;
            case BABYLON.Manipulator.OBJECTTYPE_TORUS:
                object = new BABYLON.Mesh[objectType](objectId, oParametersMesh.heightValue, oParametersMesh.thicknessValue, oParametersMesh.segmentValue, this.scene);
                break;
            case "CreateCylinderCone":
                object = new BABYLON.Mesh.CreateCylinder(objectId, oParametersMesh.heightValue, oParametersMesh.dianmeterBottomValue, oParametersMesh.dianmeterTopValue, oParametersMesh.segmentValue, this.scene);
                break;
        }
        if (object != null) {
            this.switchObjects[objectId] = object;
            return object;
        }
    };

    // Checking an object has selected backup was this one and deselection of the previously selected object
    // Check the type of the object light or object.
    BABYLON.Editor.prototype._selectMesh = function (evt) {
        if (this.newSceneLoaded) {
            this.scene = this.newSceneLoaded;
        }
        var pickResult = null;
        var multiSelectMaterial = null;
        var id = null;
        if (this.objectSelected != null) {
            pickResult = this.scene.pick(
                   evt.clientX,
                   evt.clientY,
                   function (mesh) {
                       if (mesh.name == "x" || mesh.name == "y" || mesh.name == "z") {
                           return true;
                       }
                       else {
                           return false;
                       }
                   },
                   false);
        }
        else if (this.objectSelected == null) {
            pickResult = this.scene.pick(evt.clientX, evt.clientY);
        }
        if (pickResult.hit) {
            this.pickedPoint =  pickResult.pickedPoint;
            id = parseInt(pickResult.pickedMesh.name);
            if (!isNaN(id)) {
                for (i = 0; i != this.switchObjects.length ; i++) {
                    if (typeof (this.switchObjects[i]) != "undefined") {
                        if (i == id) {
                            if (typeof (this.switchObjects[id].control) == "undefined") {
                                this.switchObjects[id] = new BABYLON.Manipulator(pickResult.pickedMesh, this.connectedCanvas, BABYLON.Manipulator.CONTROLMODE_POSITION, false, this.pickedPoint);
                                this.objectSelected = id;
                                if (this.groupingMode == true && (this.multiSelect[pickResult.pickedMesh.name] == undefined)) {
                                    this.multiSelect[i] = (this.switchObjects[i]);
                                    multiSelectMaterial = new BABYLON.StandardMaterial("Material", this.scene);
                                    multiSelectMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                                    multiSelectMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                                    multiSelectMaterial.specularPower = 32;
                                    multiSelectMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);
                                    multiSelectMaterial.emissiveColor = new BABYLON.Color3(253 / 255, 251 / 255, 151 / 255);
                                    this.switchObjects[i].mesh.material = multiSelectMaterial;
                                }
                            }
                        }
                        else if (typeof (this.switchObjects[i].control) != "undefined") {
                            this.switchObjects[i] = this.switchObjects[i].reset();
                        }
                    }
                }
            }
        }
        else {
            for (i = 0; i != this.switchObjects.length ; i++) {
                if (this.switchObjects[i] && typeof (this.switchObjects[i].control) != "undefined") {
                    this.switchObjects[i] = this.switchObjects[i].reset();
                    this.objectSelected = null;
                }
            }
        }
    };

    BABYLON.Editor.prototype.resetSelectGroup = function () {
        for (i = 0 ; i != this.multiSelect.length; i++) {
            if (typeof (this.multiSelect[i]) != "undefined" && this.groupingMode == false) {
                this.multiSelect[i].mesh.material = null;
            }
        }
        this.multiSelect = new Array();
    };

    BABYLON.Editor.prototype.setGroupMode = function (boolValue) {
        this.groupingMode = boolValue;
    };

    BABYLON.Editor.prototype.getGroupMode = function () {
        return this.groupingMode;
    };

    BABYLON.Editor.prototype._linkingMeshs = function (objectName, arrayObj) {
        var arrayPos = [];
        var arrayNormal = [];
        var arrayUv = [];
        var arrayUv2 = [];
        var arrayColor = [];
        var arrayMatricesIndices = [];
        var arrayMatricesWeights = [];
        var arrayIndice = [];
        var savedPosition = [];
        var savedNormal = [];
        var newMesh = new BABYLON.Mesh(objectName, this.scene);
        var UVKind = true;
        var UV2kind = true;
        var ColorKind = true;
        var MatricesIndicesKind = true;
        var MatricesWeightsKind = true;
        var xMin = arrayObj[0].mesh.position.x;
        var xMax = arrayObj[0].mesh.position.x;
        var yMin = arrayObj[0].mesh.position.y;
        var yMax = arrayObj[0].mesh.position.y;
        var zMin = arrayObj[0].mesh.position.z;
        var zMax = arrayObj[0].mesh.position.z;

        for (i = 0; i != arrayObj.length ; i++) {
            if (!arrayObj[i].mesh.isVerticesDataPresent([BABYLON.VertexBuffer.UVKind])) {
                UVKind = false;
            }
            if (!arrayObj[i].mesh.isVerticesDataPresent([BABYLON.VertexBuffer.UV2Kind])) {
                UV2kind = false;
            }
            if (!arrayObj[i].mesh.isVerticesDataPresent([BABYLON.VertexBuffer.ColorKind])) {
                ColorKind = false;
            }
            if (!arrayObj[i].mesh.isVerticesDataPresent([BABYLON.VertexBuffer.MatricesIndicesKind])) {
                MatricesIndicesKind = false;
            }
            if (!arrayObj[i].mesh.isVerticesDataPresent([BABYLON.VertexBuffer.MatricesWeightsKind])) {
                MatricesWeightsKind = false;
            }

            if (xMin > arrayObj[i].mesh.position.x) {
                xMin = arrayObj[i].mesh.position.x;
            }
            if (xMax < arrayObj[i].mesh.position.x) {
                xMax = arrayObj[i].mesh.position.x;
            }
            if (yMin > arrayObj[i].mesh.position.y) {
                yMin = arrayObj[i].mesh.position.y;
            }
            if (yMax < arrayObj[i].mesh.position.y) {
                yMax = arrayObj[i].mesh.position.y;
            }
            if (zMin > arrayObj[i].mesh.position.z) {
                zMin = arrayObj[i].mesh.position.z;
            }
            if (zMax < arrayObj[i].mesh.position.z) {
                zMax = arrayObj[i].mesh.position.z;
            }
        }

        var x = xMin + ((xMax - xMin) / 2);
        var y = yMin + ((yMax - yMin) / 2);
        var z = zMin + ((zMax - zMin) / 2);

        for (i = 0; i != arrayObj.length ; i++) {
            var ite = 0;
            var iter = 0;
            arrayPos[i] = arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            arrayNormal[i] = arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
            if (UVKind) {
                arrayUv = arrayUv.concat(arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.UVKind));
            }
            if (UV2kind) {
                arrayUv2 = arrayUv2.concat(arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.UV2Kind));
            }
            if (ColorKind) {
                arrayColor = arrayColor.concat(arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind));
            }
            if (MatricesIndicesKind) {
                arrayMatricesIndices = arrayMatricesIndices.concat(arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind));
            }
            if (MatricesWeightsKind) {
                arrayMatricesWeights = arrayMatricesWeights.concat(arrayObj[i].mesh.getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind));
            }
            var maxValue = savedPosition.length / 3;
            var worldMatrix = arrayObj[i].mesh.getWorldMatrix();

            while (ite < arrayPos[i].length) {
                var vertex = new BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(arrayPos[i][ite], arrayPos[i][ite + 1], arrayPos[i][ite + 2]), worldMatrix);
                savedPosition.push(vertex.x - x);
                savedPosition.push(vertex.y - y);
                savedPosition.push(vertex.z - z);
                ite = ite + 3;
            }
            while (iter < arrayNormal[i].length) {
                var vertex = new BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(arrayNormal[i][iter], arrayNormal[i][iter + 1], arrayNormal[i][iter + 2]), worldMatrix);
                savedNormal.push(vertex.x);
                savedNormal.push(vertex.y);
                savedNormal.push(vertex.z);
                iter = iter + 3;
            }
            if (i > 0) {
                var tmp = arrayObj[i].mesh.getIndices();
                for (it = 0 ; it != tmp.length; it++) {
                    tmp[it] = tmp[it] + maxValue;
                }
                arrayIndice = arrayIndice.concat(tmp);
            }
            else {
                arrayIndice = arrayObj[i].mesh.getIndices();
            }

            arrayObj[i].mesh.dispose(false);
        }

        newMesh.setVerticesData(savedPosition, BABYLON.VertexBuffer.PositionKind, false);
        newMesh.setVerticesData(savedNormal, BABYLON.VertexBuffer.NormalKind, false);
        if (arrayUv.length > 0) {
            newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.UVKind, false);
        }
        if (arrayUv2.length > 0) {
            newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.UV2Kind, false);
        }
        if (arrayColor.length > 0) {
            newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.ColorKind, false);
        }
        if (arrayMatricesIndices.length > 0) {
            newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.MatricesIndicesKind, false);
        }

        if (arrayMatricesWeights.length > 0) {
            newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.MatricesWeightsKind, false);
        }
        newMesh.setIndices(arrayIndice);
        return newMesh;
    };

    BABYLON.Editor.prototype.newMesh = function (objectName) {
        var newMesh = null;
        if (this.objectSelected != null) {
            this.switchObjects[this.objectSelected] = this.switchObjects[this.objectSelected].reset();
            this.objectSelected = null;
        }
        var arrayNewObject = new Array();

        for (i = 0 ; i != this.multiSelect.length; i++) {
            if (typeof (this.multiSelect[i]) != "undefined" && !this.multiSelect[i].childMesh) {
                arrayNewObject.push(this.multiSelect[i]);
            }
        }
        if (arrayNewObject.length > 1) {
            newMesh = this._linkingMeshs(objectName, arrayNewObject);
            this.switchObjects[objectName] = newMesh;
        }
    };

    BABYLON.Editor.prototype.updateColor = function (colorDiff, colorEmi, alpha) {
        var updateColDiff = null;
        var updateColEmi = null;
        var object = null;
        var matObject = null;

        if (!this.groupingMode) {
            if (colorDiff != null) {
                updateColDiff = new BABYLON.Color3(colorDiff.r / 255, colorDiff.g / 255, colorDiff.b / 255);
            }
            if (colorEmi != null) {
                updateColEmi = new BABYLON.Color3(colorEmi.r / 255, colorEmi.g / 255, colorEmi.b / 255);
            }
            if (this.objectSelected != null && this.switchLight[this.objectSelected] == null) {
                object = this.switchObjects[this.objectSelected];
                matObject = new BABYLON.StandardMaterial("matObject", this.scene);
                if (updateColEmi != null) {
                    matObject.emissiveColor = updateColEmi;
                }
                if (updateColDiff != null) {
                    matObject.diffuseColor = updateColDiff;
                }
                if (this.switchLight[this.objectSelected] == null) {
                    matObject.alpha = alpha / 100;
                }
                if (typeof (object.mesh) != "undefined") {
                    if (object.mesh.material != null && (object.mesh.material.diffuseTexture != null || object.mesh.material.reflectionTexture != null || object.mesh.material.ambientTexture != null || object.mesh.material.subMaterials || object.mesh.material.ambientColor != null)) {
                        object.mesh.material.emissiveColor = updateColEmi;
                        object.mesh.material.diffuseColor = updateColDiff;
                        object.mesh.material.alpha = alpha / 100;
                        return;
                    }
                    object.mesh.material = matObject;
                }

            }
            else if (this.switchLight[this.objectSelected] != null && colorDiff != null) {
                this.switchLight[this.objectSelected].diffuse = updateColDiff;
                this.switchLight[this.objectSelected].specular = updateColDiff;
            }
        }
    };

    BABYLON.Editor.prototype.infoMesh = function () {
        BABYLON.Editor.LoadScene;
        var colorDiff = null;
        var colorEmi = null;

        if (this.objectSelected != null) {
            var object = this.switchObjects[this.objectSelected];
            if (object != "reset") {
                // POSITION
                document.getElementById("positionX").value = Math.round(object.mesh.position.x * 10000) / 10000;
                document.getElementById("positionY").value = Math.round(object.mesh.position.y * 10000) / 10000;
                document.getElementById("positionZ").value = Math.round(object.mesh.position.z * 10000) / 10000;
                // and light position
                if (this.switchLight[this.objectSelected] != null && this.switchLight[this.objectSelected].direction != "undefined") {
                    if (this.switchLight[this.objectSelected].direction != "undefined") {
                        this.switchLight[this.objectSelected].direction = object.mesh.position;
                    }
                    this.switchLight[this.objectSelected].position = object.mesh.position;
                }
                // SCALE
                document.getElementById("scalingX").value = Math.round(object.mesh.scaling.x * 10000) / 10000;
                document.getElementById("scalingY").value = Math.round(object.mesh.scaling.y * 10000) / 10000;
                document.getElementById("scalingZ").value = Math.round(object.mesh.scaling.z * 10000) / 10000;
                // ROTATION
                if (object.mesh.rotationQuaternion) {
                    document.getElementById("RotationX").value = Math.round((object.mesh.rotationQuaternion.x * 180 / Math.PI) * 10000) / 10000;
                    document.getElementById("RotationY").value = Math.round((object.mesh.rotationQuaternion.y * 180 / Math.PI) * 10000) / 10000;
                    document.getElementById("RotationZ").value = Math.round((object.mesh.rotationQuaternion.z * 180 / Math.PI) * 10000) / 10000;
                }
                else if (!object.mesh.rotationQuaternion) {
                    document.getElementById("RotationX").value = Math.round((object.mesh.rotation.x * 180 / Math.PI) * 10000) / 10000;
                    document.getElementById("RotationY").value = Math.round((object.mesh.rotation.y * 180 / Math.PI) * 10000) / 10000;
                    document.getElementById("RotationZ").value = Math.round((object.mesh.rotation.z * 180 / Math.PI) * 10000) / 10000;
                }
                // COLOR
                function rgbToHex(r, g, b) {
                    if (r < 0 || r > 255) alert("r is out of bounds; " + r);
                    if (g < 0 || g > 255) alert("g is out of bounds; " + g);
                    if (b < 0 || b > 255) alert("b is out of bounds; " + b);
                    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7);
                }
                if (this.switchLight[this.objectSelected] != null) {
                    colorDiff = this.switchLight[this.objectSelected].diffuse;

                    if (colorDiff != null) {
                        document.getElementById("testMumuevo-cp1").style.background = rgbToHex(colorDiff.r * 255, colorDiff.g * 255, colorDiff.b * 255);
                        document.getElementById("diffuseColor").value = rgbToHex(colorDiff.r * 255, colorDiff.g * 255, colorDiff.b * 255);
                    }
                }
                else if (object.mesh.material && this.switchLight[this.objectSelected] == null) {
                    document.getElementById("transparence").value = (object.mesh.material.alpha) * 100;
                    colorDiff = object.mesh.material.diffuseColor;
                    if (object.mesh.material.emissiveColor) {
                        colorEmi = object.mesh.material.emissiveColor;
                        document.getElementById("testMumuevo-cp1").style.background = rgbToHex(colorDiff.r * 255, colorDiff.g * 255, colorDiff.b * 255);
                        document.getElementById("testMumuevo-cp0").style.background = rgbToHex(colorEmi.r * 255, colorEmi.g * 255, colorEmi.b * 255);
                        document.getElementById("diffuseColor").value = rgbToHex(colorDiff.r * 255, colorDiff.g * 255, colorDiff.b * 255);
                        document.getElementById("emissivepick").value = rgbToHex(colorEmi.r * 255, colorEmi.g * 255, colorEmi.b * 255);
                    }
                }
                else {
                    document.getElementById("testMumuevo-cp1").style.background = rgbToHex(255, 255, 255);
                    document.getElementById("testMumuevo-cp0").style.background = rgbToHex(0, 0, 0);
                    document.getElementById("diffuseColor").value = rgbToHex(255, 255, 255);
                    document.getElementById("emissivepick").value = rgbToHex(0, 0, 0);
                }

            }
        }
    };

    BABYLON.Editor.prototype.newValueVector = function (valueX, valueY, valueZ, control, type) {
        if (this.objectSelected != null) {
            var objtect = this.switchObjects[this.objectSelected];
            switch (control) {
                case 1:
                    objtect.updatePosition(valueX, valueY, valueZ);
                    break;
                case 2:
                    objtect.updateRotation(valueX, valueY, valueZ, type);
                    break;
                case 3:
                    objtect.updateScale(valueX, valueY, valueZ);
                    break;
            }
        }
    };

    BABYLON.Editor.prototype.updateControl = function (control, locked) {
        var changeMesh = null;
        var idChangeMesh = null;

        if (this.objectSelected != null) {
            changeMesh = this.switchObjects[this.objectSelected];
            idChangeMesh = this.objectSelected;
            if (typeof (changeMesh.mesh.scaling) != "undefined" && this.switchLight[this.objectSelected] == null) {
                this.pickedPoint = this.switchObjects[this.objectSelected].pickedPoint;
                this.switchObjects[this.objectSelected] = this.switchObjects[this.objectSelected].reset();
                this.switchObjects[idChangeMesh] = new BABYLON.Manipulator(changeMesh.mesh, this.connectedCanvas, control, locked, this.pickedPoint);
            }
        }
    };

    BABYLON.Editor.prototype.cloneMesh = function (idClone) {
        var changeMesh = null;
        var idChangeMesh = null;
        var clone = null;

        if (this.objectSelected != null) {
            changeMesh = this.switchObjects[this.objectSelected];
            idChangeMesh = this.objectSelected;
            if (typeof (changeMesh.mesh.scaling) != "undefined" && this.switchLight[this.objectSelected] == null) {
                clone = changeMesh.mesh.clone(idClone, false);
                clone.isPickable = true;
                this.switchObjects[idClone] = clone;
            }
        }
    };

    BABYLON.Editor.prototype.delete = function () {
        if (this.objectSelected != null) {
            this.switchObjects[this.objectSelected].mesh.dispose(false);
            this.switchObjects[this.objectSelected] = this.switchObjects[this.objectSelected].reset();
            if (this.switchLight[this.objectSelected] != null) {
                this.switchLight[this.objectSelected].dispose(false);
            }
            this.objectSelected = null;
        }
    };

})();