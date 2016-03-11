define(['TObject'], function(TObject) {
	// TODO Add documentation.
	// TODO Improve performances ?
	//	    Seems complicated while keeping OOP cohesion.
	// TODO Add 'propager' method.
	// TODO Add pivot position choice support for the 'pivoter' method ?
	// TODO Add boundaries check.

	var Matrice = function (data, largeur, hauteur) {
		this.data = data || [];
		var dimensions;
		if (this.data && (largeur === undefined || hauteur === undefined))
			dimensions = Matrice.mesurer(this.data);
		this.largeur = (largeur !== undefined) ? largeur : dimensions.largeur;
		this.hauteur = (hauteur !== undefined) ? hauteur : dimensions.hauteur;
	};

	Matrice.prototype = Object.create(TObject.prototype);
	Matrice.prototype.constructor = Matrice;

	Matrice.prototype.compter = function () {
		var result = 0;
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var Index = 0; XIndex < this.largeur; XIndex++)
				if (this.obtenir(XIndex, YIndex) !== undefined)
					result += 1;
		return result;
	};

	Matrice.prototype.parcourir = function (direction, task) {
		if (direction == Matrice.Direction.HAUT) {
			for (var XIndex = 0; XIndex < this.largeur; XIndex++)
				for (var YIndex = this.hauteur - 1; YIndex >= 0; YIndex--) {
					this.changer(XIndex, YIndex, task);
				}
		}
	};

	// TODO Remove recursion.
	// TODO Shorten.
	// TODO Kill it with fire.
	Matrice.prototype.propager = function (XPosition, YPosition, callback,
		Masque) {
		if (Masque === undefined) {
			filtrer = new Matrice([]);
			filtrer.largeur = this.largeur;
			filtrer.hauteur = this.hauteur;
			Masque = new Matrice.Masque(this, filtrer);
		}

		var value = this.obtenir(XPosition, YPosition);
		if (   XPosition >= 0 && XPosition < this.largeur
			&& YPosition >= 0 && YPosition < this.hauteur) {
			Masque.filtrer.mettre(XPosition, YPosition, true);
		}

		if (   (XPosition - 1) >= 0 && (XPosition - 1) < this.largeur
			&& YPosition >= 0 && YPosition < this.hauteur)
			if (!Masque.filtrer.obtenir(XPosition - 1, YPosition)) {
				var result = callback(value, this.obtenir(XPosition - 1, YPosition));
				Masque.filtrer.mettre(XPosition - 1, YPosition, result);
				if (result === true) {
					this.propager(XPosition - 1, YPosition, callback, Masque);
				}
			}

		if (   (XPosition + 1) >= 0 && (XPosition + 1) < this.largeur
			&& YPosition >= 0 && YPosition < this.hauteur)
			if (!Masque.filtrer.obtenir(XPosition + 1, YPosition)) {
				var result = callback(value, this.obtenir(XPosition + 1, YPosition));
				Masque.filtrer.mettre(XPosition + 1, YPosition, result);
				if (result === true)
					this.propager(XPosition + 1, YPosition, callback, Masque);
			}


		if (   XPosition >= 0 && XPosition < this.largeur
			&& (YPosition - 1) >= 0 && (YPosition - 1) < this.hauteur)
			if (!Masque.filtrer.obtenir(XPosition, YPosition - 1)) {
				var result = callback(value, this.obtenir(XPosition, YPosition - 1));
				Masque.filtrer.mettre(XPosition, YPosition - 1, result);
				if (result === true)
					this.propager(XPosition, YPosition - 1, callback, Masque);
			}

		if (   XPosition >= 0 && XPosition < this.largeur
			&& (YPosition + 1) >= 0 && (YPosition + 1) < this.hauteur)
			if (!Masque.filtrer.obtenir(XPosition, YPosition + 1)) {
				var result = callback(value, this.obtenir(XPosition, YPosition + 1));
				Masque.filtrer.mettre(XPosition, YPosition + 1, result);
				if (result === true)
					this.propager(XPosition, YPosition + 1, callback, Masque);
			}

		return Masque;
	}

	Matrice.prototype.compter = function () {
		var compteur = 0;
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var Index = 0; XIndex < this.largeur; XIndex++)
				if (this.obtenir(XIndex, YIndex) !== undefined)
					compteur++;
		return compteur;
	};

	Matrice.prototype.réinitialiser = function () {
		this.data = [];
		return this;
	};

	Matrice.prototype.obtenir = function (XPosition, YPosition) {
		if (!this.data[YPosition])
			return undefined;
		return this.data[YPosition][XPosition];
	};

	Matrice.prototype.mettre = function (XPosition, YPosition, value) {
		if (!this.data[YPosition])
			this.data[YPosition] = [];
		this.data[YPosition][XPosition] = value;
		return this;
	};

	Matrice.prototype.changer = function (XPosition, YPosition, task) {
		this.mettre(XPosition, YPosition, task(this.obtenir(XPosition, YPosition),
			XPosition, YPosition));
		return this;
	};

	Matrice.prototype.sélectionner = function (XOffobtenir, YOffobtenir, largeur, hauteur) {
		return new Matrice.Sélection(this, XOffobtenir, YOffobtenir, largeur, hauteur);
	};

	Matrice.prototype.filtrer = function (filtrer) {
		return new Matrice.Masque(this, new Matrice(filtrer));
	};

	Matrice.prototype.copier = function () {
		var copier = [];
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var XIndex = 0; XIndex < this.largeur; XIndex++) {
				var value = this.obtenir(XIndex, YIndex);
				if (value !== undefined) {
					if (copier[YIndex] === undefined) copier[YIndex] = [];
					copier[YIndex][XIndex] = value;
				}
			}
		return new Matrice(copier, this.largeur, this.hauteur);
	};

	Matrice.prototype.transformer = function (task) {
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var XIndex = 0; XIndex < this.largeur; XIndex++)
				this.changer(XIndex, YIndex, task);
		return this;
	};

	Matrice.prototype.appliquer = function (task) {
		var callback = function (element, x, y) {
			if (element !== undefined) return task(element, x, y);
			return element;
		};
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var XIndex = 0; XIndex < this.largeur; XIndex++)
				this.changer(XIndex, YIndex, callback);
		return this;
	};

	Matrice.prototype.remplacer = function (Matrice) {
		var XLimit = Math.min(this.largeur, Matrice.largeur);
		var YLimit = Math.min(this.hauteur, Matrice.hauteur);
		for (YIndex = 0; YIndex < YLimit; YIndex++)
			for (XIndex = 0; XIndex < XLimit; XIndex++)
				this.mettre(XIndex, YIndex, Matrice.obtenir(XIndex, YIndex));
		return this;
	};

	Matrice.prototype.insérer = function (Matrice) {
		var XLimit = Math.min(this.largeur, Matrice.largeur);
		var YLimit = Math.min(this.hauteur, Matrice.hauteur);
		for (YIndex = 0; YIndex < YLimit; YIndex++)
			for (XIndex = 0; XIndex < XLimit; XIndex++)
				if (this.obtenir(XIndex, YIndex) === undefined) {
					var value = Matrice.obtenir(XIndex, YIndex);
					if (value !== undefined) this.mettre(XIndex, YIndex, value);
				}
		return this;
	};

	Matrice.prototype.extraire = function () {
		var value = this.copier();
		this.réinitialiser();
		return value;
	};

	Matrice.prototype.décaler = function (direction, intensity) {
		if (intensity === undefined)
			intensity = 1;
		if (intensity < 0) {
			intensity = -intensity;
			if (direction === Matrice.Direction.HAUT) direction = Matrice.Direction.BAS;
			else if (direction === Matrice.Direction.BAS) direction = Matrice.Direction.HAUT;
			else if (direction === Matrice.Direction.GAUCHE) direction = Matrice.Direction.DROITE;
			else if (direction === Matrice.Direction.DROITE) direction = Matrice.Direction.GAUCHE;
		}
		switch (direction) {
			case Matrice.Direction.HAUT:
				this.remplacer(this.sélectionner(0, intensity).copier());
				this.sélectionner(0, this.hauteur - intensity).réinitialiser();
				break;
			case Matrice.Direction.BAS:
				this.sélectionner(0, intensity).remplacer(this.copier());
				this.sélectionner(0, 0, this.largeur, intensity).réinitialiser();
				break;
			case Matrice.Direction.GAUCHE:
				this.remplacer(this.sélectionner(intensity, 0).copier());
				this.sélectionner(this.largeur - intensity, 0).réinitialiser();
				break;
			case Matrice.Direction.DROITE:
				this.sélectionner(intensity, 0).remplacer(this.copier());
				this.sélectionner(0, 0, intensity, this.hauteur).réinitialiser();
				break;
		}
		return this;
	};

	Matrice.prototype.pivoter = function (direction) {
		var copier = this.copier();
		this.réinitialiser();
		for (XIndexA = 0; XIndexA < this.largeur; XIndexA++) {
			var XIndexB = (direction === Matrice.Direction.HORAIRE) ?
				XIndexA : this.largeur - 1 - XIndexA;
			for (YIndexA = 0; YIndexA < this.hauteur; YIndexA++) {
				var YIndexB = (direction === Matrice.Direction.ANTIHORAIRE) ?
					YIndexA : this.hauteur - 1 - YIndexA;
				this.mettre(YIndexB, XIndexB, copier.obtenir(XIndexA, YIndexA));
			}
		}
		this.largeur = copier.hauteur;
		this.hauteur = copier.largeur;
		return this;
	};

	Matrice.prototype.retourner = function () {
		var copier = this.copier();
		for (YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (XIndex = 0; XIndex < this.largeur; XIndex++)
				this.mettre(this.largeur - 1 - XIndex, this.hauteur - 1 - YIndex,
					copier.obtenir(XIndex, YIndex));
		return this;
	};

	Matrice.prototype.afficher = function () {
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++) {
			var line = '';
			for (var XIndex = 0; XIndex < this.largeur; XIndex++) {
				var value = this.obtenir(XIndex, YIndex);
				if (value === undefined) line += 'undef\t';
				else line += value + '\t';
			}
			console.log(line);
		}
	};

	Matrice.prototype.englobe = function (Matrice) {
		if (Matrice instanceof Matrice.Sélection)
			return this.width >= (Matrice.width + Matrice.XOffset)
				&& this.height >= (Matrice.height + Matrice.YOffset);
		return this.width >= Matrice.width && this.height >= Matrice.height;
	}

	Matrice.mesurer = function (data) {
		var dimensions = {};
		for (var YIndex = 0; YIndex < data.length; YIndex++)
			if (data[YIndex] && (dimensions.largeur === undefined ||
				data[YIndex].length > dimensions.largeur))
				dimensions.largeur = data[YIndex].length;
		if (dimensions.largeur === undefined) dimensions.largeur = 0;
		dimensions.hauteur = data.length;
		return dimensions;
	};

	Matrice.conflit = function (MatriceA, MatriceB) {
		var XLimit = Math.min(MatriceA.largeur, MatriceB.largeur);
		var YLimit = Math.min(MatriceA.hauteur, MatriceB.hauteur);
		for (var YIndex = 0; YIndex < YLimit; YIndex++)
			for (var XIndex = 0; Xindex < XLimit; XIndex++)
				if (MatriceA.obtenir(XIndex, YIndex) !== undefined &&
					MatriceB.obtenir(XIndex, YIndex) !== undefined)
					return true;
		return false;
	};

	Matrice.Sélection = function (Matrice, XOffobtenir, YOffobtenir, largeur, hauteur) {
		this.Matrice = Matrice;
		this.XOffobtenir = XOffobtenir;
		this.YOffobtenir = YOffobtenir;
		this.largeur = (largeur !== undefined) ? largeur : Matrice.largeur - XOffobtenir;
		this.hauteur = (hauteur !== undefined) ? hauteur :
			Matrice.hauteur - YOffobtenir;
	};

	Matrice.Sélection.prototype = Object.create(Matrice.prototype);
	Matrice.Sélection.prototype.constructor = Matrice.Sélection;

	Matrice.Sélection.prototype.réinitialiser = function () {
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var XIndex = 0; XIndex < this.largeur; XIndex++)
				this.Matrice.mettre(this.XOffobtenir + XIndex, this.YOffobtenir + YIndex,
					undefined);
		return this;
	};

	Matrice.Sélection.prototype.obtenir = function (XPosition, YPosition) {
		return this.Matrice.obtenir(this.XOffobtenir + XPosition,
			this.YOffobtenir + YPosition);
	};

	Matrice.Sélection.prototype.mettre = function (XPosition, YPosition, value) {
		this.Matrice.mettre(this.XOffobtenir + XPosition, this.YOffobtenir + YPosition,
			value);
		return this;
	};

	Matrice.Sélection.prototype.changer = function (XPosition, YPosition, task) {
		this.mettre(XPosition, YPosition, task(this.obtenir(XPosition, YPosition),
			XPosition + this.XOffobtenir, YPosition + this.YOffobtenir));
		return this;
	};

	Matrice.Masque = function (Matrice, filtrer) {
		this.Matrice = Matrice;
		this.filtrer = filtrer;
		this.largeur = filtrer.largeur;
		this.hauteur = filtrer.hauteur;
	};

	Matrice.Masque.prototype = Object.create(Matrice.prototype);
	Matrice.Masque.prototype.constructor = Matrice.Masque;

	// TODO Remove loop behaviours.
	Matrice.Masque.prototype.réinitialiser = function () {
		for (var YIndex = 0; YIndex < this.hauteur; YIndex++)
			for (var XIndex = 0; XIndex < this.largeur; XIndex++)
				if (this.filtrer.obtenir(XIndex, YIndex))
					this.Matrice.mettre(XIndex, YIndex, undefined);
		return this;
	};

	Matrice.Masque.prototype.obtenir = function (XPosition, YPosition) {
		if (this.filtrer.obtenir(XPosition, YPosition))
			return this.Matrice.obtenir(XPosition, YPosition);
		return undefined;
	};

	Matrice.Masque.prototype.mettre = function (XPosition, YPosition, value) {
		if (this.filtrer.obtenir(XPosition, YPosition))
			this.Matrice.mettre(XPosition, YPosition, value);
		return this;
	};

	Matrice.Direction = {
		HAUT: 0,
		BAS: 1,
		GAUCHE: 2,
		DROITE: 3,
		HORAIRE: 4,
		ANTIHORAIRE: 5
	};

	return Matrice;
});

/*
function comparaison(A, B)  {
    return A == B
}

matrice = new Matrice([[0, 0, 0, 0, 0, 0, 0],
                       [0, 0, 0, 4, 0, 0, 0],
                       [0, 0, 0, 4, 4, 4, 0],
                       [0, 0, 0, 0, 4, 4, 0],
                       [4, 4, 4, 0, 4, 4, 0],
                       [4, 4, 4, 0, 4, 0, 0],
                       [0, 0, 4, 4, 4, 0, 0],
                       [0, 0, 4, 0, 0, 0, 0]])
// matrice.sélectionner(3, 3, 2, 2).afficher()
matrice.propager(3, 2, comparaison).réinitialiser()
matrice.afficher()
*/
