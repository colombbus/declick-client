define(['jquery', 'babylon', 'TEnvironment', 'TObject3D'], function($, babylon, TEnvironment, TObject3D) {
    /**
     * 
     * @returns Cylinder3D
     */
    var Cylinder3D = function(sizeX, sizeY, sizeZ, colorName) {
        /*
         this.object3d.position.x = sizeX;
         this.object3d.position.y = sizeY;
         this.object3d.position.z = sizeZ;
         */
    };

    Cylinder3D.prototype = Object.create(TObject3D.prototype);
    Cylinder3D.prototype.constructor = Cylinder3D;
    Cylinder3D.prototype.className = "Cylinder3D";

    Cylinder3D.prototype._setSpace = function(scene3d) {
        TObject3D.prototype._setSpace.call(this, scene3d);
        this.object3d = this.getMesh().CreateCylinder(this.createName(), 3, 1, 1, 16, this.scene);
        this.object3d.position.y = 1;
    };

    Cylinder3D.prototype._setHeight = function(height) {
    };
    Cylinder3D.prototype._setRadius = function(radius) {
    };

    return Cylinder3D;
});

/* 
e=new Espace3D()
c=new Cylindre3D()
e.addObject(c)
c.cacher()

e=new Espace3D()
c=new Boîte3D()
e.ajouterObjet(c)
c.cacher()

e=new Espace3D()
c=new Cylindre3D()
e.ajouterObjet(c)
d=new Cylindre3D()
e.ajouterObjet(d)
s=new Sphère3D()
e.ajouterObjet(s)
tangara.écrire("nom " + d.getName())
tangara.écrire("nom " + s.getName())


e=new Espace3D()
c=new Cylindre3D()
d=new Cylindre3D()
e.addObject(c)
e.addObject(d)
tangara.écrire("nom " + c.getName())
tangara.écrire("nom " + d.getName())
* @param Space3D space
     
 
 */