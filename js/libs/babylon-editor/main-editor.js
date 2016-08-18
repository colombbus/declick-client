/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// 
// - - - BABYLON EDITOR - - - 
//
// © 2013, Muriel Surmely
//

var globalColorPick = false;
window.onload = function () {
    var canvas = document.getElementById('canvas');
    canvas.onselectstart = function () { return false; } // ie
    canvas.onmousedown = function () { return false; } // mozilla
    var scaleLocked = false;
    var grid = 20;

    var babyEdit = new BABYLON.Editor(canvas);
    var controlPanel = new PANEL.control();
    babyEdit.createBasicScene();

    // Add Object 
    document.getElementById("addMeshButton").addEventListener("click", function (event) {
        var type = document.getElementById("addMeshButton").value;
        var segmentValue = 25;
        var heightValue = 6;
        var diameterValue = 6;
        var dianmeterTopValue = 5;
        var dianmeterBottomValue = 1;
        var thicknessValue = 1;

        if (document.getElementById("segmentValue") != null) {
            segmentValue = document.getElementById("segmentValue").value;
        }
        if (document.getElementById("heightValue") != null) {
            heightValue = document.getElementById("heightValue").value;
        }
        if (document.getElementById("diameterValue") != null) {
            diameterValue = document.getElementById("diameterValue").value;
        }
        if (document.getElementById("dianmeterTopValue") != null) {
            dianmeterTopValue = document.getElementById("dianmeterTopValue").value;
        }
        if (document.getElementById("dianmeterBottomValue") != null) {
            dianmeterBottomValue = document.getElementById("dianmeterBottomValue").value;
        }
        if (document.getElementById("thicknessValue") != null) {
            thicknessValue = document.getElementById("thicknessValue").value;
        }

        var newMesh = new Object;
        newMesh.oParametersMesh = {
            heightValue: isNaN(parseInt(heightValue)) ? 6 : parseInt(heightValue),
            segmentValue: isNaN(parseInt(segmentValue)) ? 25 : parseInt(segmentValue),
            diameterValue: isNaN(parseInt(diameterValue)) ? 6 : parseInt(diameterValue),
            dianmeterTopValue: isNaN(parseInt(dianmeterTopValue)) ? 5 : parseInt(dianmeterTopValue),
            dianmeterBottomValue: isNaN(parseInt(dianmeterBottomValue)) ? 1 : parseInt(dianmeterBottomValue),
            thicknessValue: isNaN(parseInt(thicknessValue)) ? 1 : parseInt(thicknessValue)
        };
        babyEdit.addMesh(type, babyEdit.getNumberObject(), newMesh.oParametersMesh);
        babyEdit.setNumberObject(babyEdit.getNumberObject() + 1);
    });

    // Add Light
    document.getElementById("pointlight").addEventListener("click", function (event) {
        babyEdit.addLight(event.target.id, babyEdit.getNumberObject());
        babyEdit.setNumberObject(babyEdit.getNumberObject() + 1);
    });
    document.getElementById("hemisphericlight").addEventListener("click", function (event) {
        babyEdit.addLight(event.target.id, babyEdit.getNumberObject());
        babyEdit.setNumberObject(babyEdit.getNumberObject() + 1);
    });

    // update color
    document.getElementById('BottomPanel').addEventListener("mousemove", function (event) {
        var alpha = document.getElementById("transparence").value;
        var colorDiff = null;
        var colorEmi = null;

        if (document.getElementById("diffuseColor").value) {
            colorDiff = hexToRgb(document.getElementById("diffuseColor").value);
        }
        if (document.getElementById("emissivepick").value) {
            colorEmi = hexToRgb(document.getElementById("emissivepick").value);
        }
        babyEdit.updateColor(colorDiff, colorEmi, alpha);
    });
    document.getElementById('transparence').addEventListener("change", function (event) {
        var alpha = document.getElementById("transparence").value;
        var colorDiff = null;
        var colorEmi = null;

        if (document.getElementById("diffuseColor").value) {
            colorDiff = hexToRgb(document.getElementById("diffuseColor").value);
        }
        if (document.getElementById("emissivepick").value) {
            var colorEmi = hexToRgb(document.getElementById("emissivepick").value);
        }
        babyEdit.updateColor(colorDiff, colorEmi, alpha);
    });

    // Control object
    document.getElementById("multiflech").addEventListener("click", function (event) {
        document.getElementById("panning").style.color = "#00B3E0";
        document.getElementById("rotating").style.color = "#2E2E2E";
        document.getElementById("scaling").style.color = "#2E2E2E";
        babyEdit.updateControl(1);
    });
    document.getElementById("rotate").addEventListener("click", function (event) {
        document.getElementById("panning").style.color = "#2E2E2E";
        document.getElementById("rotating").style.color = "#00B3E0";
        document.getElementById("scaling").style.color = "#2E2E2E";
        babyEdit.updateControl(2);
    });
    document.getElementById("scale").addEventListener("click", function (event) {
        document.getElementById("panning").style.color = "#2E2E2E";
        document.getElementById("rotating").style.color = "#2E2E2E";
        document.getElementById("scaling").style.color = "#00B3E0";
        babyEdit.updateControl(3, scaleLocked);
    });
    document.getElementById("scaleLocked").addEventListener("click", function (event) {
        if (!scaleLocked) {
            scaleLocked = true;
            document.getElementById("scaleLocked").style.background = 'url("./Images/icones/LockOn.png")';
            babyEdit.updateControl(3, scaleLocked);
        }
        else {
            scaleLocked = false;
            document.getElementById("scaleLocked").style.background = 'url("./Images/icones/LockOff.png")';
            babyEdit.updateControl(3, scaleLocked);
        }
    });

    // update position
    document.getElementById("positionX").addEventListener("change", function (event) {
        var valueX = document.getElementById("positionX").value;
        var valueY = document.getElementById("positionY").value;
        var valueZ = document.getElementById("positionZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 1);
    });
    document.getElementById("positionY").addEventListener("change", function (event) {
        var valueX = document.getElementById("positionX").value;
        var valueY = document.getElementById("positionY").value;
        var valueZ = document.getElementById("positionZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 1);
    });
    document.getElementById("positionZ").addEventListener("change", function (event) {
        var valueX = document.getElementById("positionX").value;
        var valueY = document.getElementById("positionY").value;
        var valueZ = document.getElementById("positionZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 1);
    });

    // update rotation
    document.getElementById("RotationX").addEventListener("change", function (event) {
        var valueX = document.getElementById("RotationX").value;
        var valueY = document.getElementById("RotationY").value;
        var valueZ = document.getElementById("RotationZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 2, "x");
    });
    document.getElementById("RotationY").addEventListener("change", function (event) {
        var valueX = document.getElementById("RotationX").value;
        var valueY = document.getElementById("RotationY").value;
        var valueZ = document.getElementById("RotationZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 2, "y");
    });
    document.getElementById("RotationZ").addEventListener("change", function (event) {
        var valueX = document.getElementById("RotationX").value;
        var valueY = document.getElementById("RotationY").value;
        var valueZ = document.getElementById("RotationZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 2, "z");
    });

    document.addEventListener("keypress", function (event) {
        if (event.keyCode == 13)
        {
            var valuePX = document.getElementById("positionX").value;
            var valuePY = document.getElementById("positionY").value;
            var valuePZ = document.getElementById("positionZ").value;
            babyEdit.newValueVector(valuePX, valuePY, valuePZ, 1);

            var valueRX = document.getElementById("RotationX").value;
            var valueRY = document.getElementById("RotationY").value;
            var valueRZ = document.getElementById("RotationZ").value;
            babyEdit.newValueVector(valueRX, valueRY, valueRZ, 2, "x");
        }
    });

    // update scaling
    document.getElementById("scalingX").addEventListener("change", function (event) {
        var valueX = document.getElementById("scalingX").value;
        var valueY = document.getElementById("scalingY").value;
        var valueZ = document.getElementById("scalingZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 3);
    });
    document.getElementById("scalingY").addEventListener("change", function (event) {
        var valueX = document.getElementById("scalingX").value;
        var valueY = document.getElementById("scalingY").value;
        var valueZ = document.getElementById("scalingZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 3);
    });
    document.getElementById("scalingZ").addEventListener("change", function (event) {
        var valueX = document.getElementById("scalingX").value;
        var valueY = document.getElementById("scalingY").value;
        var valueZ = document.getElementById("scalingZ").value;
        babyEdit.newValueVector(valueX, valueY, valueZ, 3);
    });

    // delete mesh
    document.getElementById("Delete").addEventListener("click", function (event) {
        babyEdit.delete();
    });

    // Change grid
    document.getElementById("gridMoins").addEventListener("change", function (event) {
        // grid = grid + 1;
        if (grid <= 100)
            babyEdit.updateGrid(document.getElementById("gridMoins").value);
    });

    // Sensibility camera
    document.getElementById("sensdCam").addEventListener("change", function (event) {
        babyEdit.updateSensibility(document.getElementById("sensdCam").value);
    });
    // Clone object
    document.getElementById("clone").addEventListener("click", function (event) {
        babyEdit.cloneMesh(babyEdit.getNumberObject());
        babyEdit.setNumberObject(babyEdit.getNumberObject() + 1);
    });

    // link Mesh
    document.getElementById("grouping").addEventListener("click", function (event) {
        if (babyEdit.getGroupMode() == false) {
            babyEdit.setGroupMode(true);
            document.getElementById("grouping").style.background = 'url("./Images/icones/ChaineOff.png")';
            document.getElementById("link").style.display = "block";
            document.getElementById("cancelLink").style.display = "block";
        }
        else {
            babyEdit.setGroupMode(false);
            document.getElementById("grouping").style.background = 'url("./Images/icones/ChaineOff.png")';
            babyEdit.resetSelectGroup();
            document.getElementById("link").style.display = "none";
            document.getElementById("cancelLink").style.display = "none";
        }
    });
    document.getElementById("cancelLink").addEventListener("click", function (event) {
        if (babyEdit.getGroupMode() == true) {
            babyEdit.setGroupMode(false);
            document.getElementById("grouping").style.background = 'url("./Images/icones/ChaineOff.png")';;
            babyEdit.resetSelectGroup();
            document.getElementById("grouping").style.background = 'url("./Images/icones/ChaineOff.png")';
            document.getElementById("link").style.display = "none";
            document.getElementById("cancelLink").style.display = "none";
        }
    });
    document.getElementById("link").addEventListener("click", function (event) {
        babyEdit.newMesh(babyEdit.getNumberObject());
        babyEdit.setNumberObject(babyEdit.getNumberObject() + 1);
        babyEdit.setGroupMode(false);
        document.getElementById("grouping").style.background = 'url("./Images/icones/ChaineOff.png")';
        document.getElementById("link").style.display = "none";
        document.getElementById("cancelLink").style.display = "none";
        babyEdit.resetSelectGroup();
    });
};

// - - - TOOLS - - - 

$(document).ready(function () {
    $("#emissivepick").colorpicker({
        history: false,
    });
    $("#diffuseColor").colorpicker({
        history: false,
    });

});

function verif_integer(champb) {
    var chiffresb = new RegExp("[0-9]");
    var verifb;
    for (x = 0; x < champb.value.length; x++) {
        verifb = chiffresb.test(champb.value.charAt(x));
        if (verifb == false) {
            champb.value = champb.value.substr(0, x) + champb.value.substr(x + 1, champb.value.length - x + 1); x--;
        }
    }
};

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};