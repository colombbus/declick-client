define(['TObject'], function(TObject) {
	// TODO Add documentation.
	// TODO Improve performances ?
	//	    Seems complicated while keeping OOP cohesion.
	// TODO Add 'propagate' method.
	// TODO Add pivot position choice support for the 'rotate' method ?
	// TODO Add boundaries check.

	var Matrix = function (data, width, height) {
		this.data = data || [];
		var dimensions;
		if (width === undefined || height === undefined)
			dimensions = Matrix.measure(data);
		this.width = (width != undefined) ? width : dimensions.width;
		this.height = (height != undefined) ? height : dimensions.height;
	};

	Matrix.prototype = Object.create(TObject);
	Matrix.prototype.constructor = Matrix;

	Matrix.prototype.reset = function () {
		this.data = [];
		return this;
	};

	Matrix.prototype.get = function (XPosition, YPosition) {
		if (!this.data[YPosition])
			return undefined;
		return this.data[YPosition][XPosition];
	};

	Matrix.prototype.set = function (XPosition, YPosition, value) {
		if (!this.data[YPosition])
			this.data[YPosition] = [];
		this.data[YPosition][XPosition] = value;
		return this;
	};

	Matrix.prototype.edit = function (XPosition, YPosition, task) {
		this.set(XPosition, YPosition, task(this.get(XPosition, YPosition),
			XPosition, YPosition));
		return this;
	};

	Matrix.prototype.select = function (XOffset, YOffset, width, height) {
		return new Matrix.Selection(this, XOffset, YOffset, width, height);
	};

	Matrix.prototype.filter = function (filter) {
		return new Matrix.Mask(this, filter);
	};

	Matrix.prototype.copy = function () {
		var copy = [];
		for (var YIndex = 0; YIndex < this.height; YIndex++)
			for (var XIndex = 0; XIndex < this.width; XIndex++) {
				var value = this.get(XIndex, YIndex);
				if (value !== undefined) {
					if (copy[YIndex] === undefined) copy[YIndex] = [];
					copy[YIndex][XIndex] = value;
				}
			}
		return new Matrix(copy, this.width, this.height);
	};

	Matrix.prototype.transform = function (task) {
		for (var YIndex = 0; YIndex < this.height; YIndex++)
			for (var XIndex = 0; XIndex < this.width; XIndex++)
				this.edit(XIndex, YIndex, task);
		return this;
	};

	Matrix.prototype.apply = function (task) {
		var callback = function (element, x, y) {
			if (element !== undefined) return task(element, x, y);
			return element;
		};
		for (var YIndex = 0; YIndex < this.height; YIndex++)
			for (var XIndex = 0; XIndex < this.width; XIndex++)
				this.edit(XIndex, YIndex, callback);
		return this;
	};

	Matrix.prototype.replace = function (matrix) {
		var XLimit = Math.min(this.width, matrix.width);
		var YLimit = Math.min(this.height, matrix.height);
		for (YIndex = 0; YIndex < YLimit; YIndex++)
			for (XIndex = 0; XIndex < XLimit; XIndex++)
				this.set(XIndex, YIndex, matrix.get(XIndex, YIndex));
		return this;
	};

	Matrix.prototype.insert = function (matrix) {
		var XLimit = Math.min(this.width, matrix.width);
		var YLimit = Math.min(this.height, matrix.height);
		for (YIndex = 0; YIndex < YLimit; YIndex++)
			for (XIndex = 0; XIndex < XLimit; XIndex++)
				if (this.get(XIndex, YIndex) === undefined) {
					var value = matrix.get(XIndex, YIndex);
					if (value !== undefined) this.set(XIndex, YIndex, value);
				}
		return this;
	};

	Matrix.prototype.extract = function () {
		var value = this.copy();
		this.reset();
		return value;
	};

	Matrix.prototype.shift = function (direction, intensity) {
		if (intensity === undefined)
			intensity = 1;
		if (intensity < 0) {
			intensity = -intensity;
			if (direction === Direction.TOP) direction = Direction.BOTTOM;
			else if (direction === Direction.BOTTOM) direction = Direction.TOP;
			else if (direction === Direction.LEFT) direction = Direction.RIGHT;
			else if (direction === Direction.RIGHT) direction = Direction.LEFT;
		}
		switch (direction) {
			case Direction.TOP:
				this.replace(this.select(0, intensity).copy());
				this.select(0, this.height - intensity).reset();
				break;
			case Direction.BOTTOM:
				this.select(0, intensity).replace(this.copy());
				this.select(0, 0, this.width, intensity).reset();
				break;
			case Direction.LEFT:
				this.replace(this.select(intensity, 0).copy());
				this.select(this.width - intensity, 0).reset();
				break;
			case Direction.RIGHT:
				this.select(intensity, 0).replace(this.copy());
				this.select(0, 0, intensity, this.height).reset();
				break;
		}
		return this;
	};

	Matrix.prototype.rotate = function (direction) {
		var copy = this.copy();
		this.reset();
		for (XIndexA = 0; XIndexA < this.width; XIndexA++) {
			var XIndexB = (direction === Direction.CLOCKWISE) ?
				XIndexA : this.width - 1 - XIndexA;
			for (YIndexA = 0; YIndexA < this.height; YIndexA++) {
				var YIndexB = (direction === Direction.ANTICLOCKWISE) ?
					YIndexA : this.height - 1 - YIndexA;
				this.set(YIndexB, XIndexB, copy.get(XIndexA, YIndexA));
			}
		}
		this.width = copy.height;
		this.height = copy.width;
		return this;
	};

	Matrix.prototype.reverse = function () {
		var copy = this.copy();
		for (YIndex = 0; YIndex < this.height; YIndex++)
			for (XIndex = 0; XIndex < this.width; XIndex++)
				this.set(this.width - 1 - XIndex, this.height - 1 - YIndex,
					copy.get(XIndex, YIndex));
		return this;
	};

	Matrix.prototype.print = function () {
		for (var YIndex = 0; YIndex < this.height; YIndex++) {
			var line = '';
			for (var XIndex = 0; XIndex < this.width; XIndex++) {
				var value = this.get(XIndex, YIndex);
				if (value === undefined) line += 'undef\t';
				else line += value + '\t';
			}
			console.log(line);
		}
	};

	Matrix.measure = function (data) {
		var dimensions = {};
		for (var YIndex = 0; YIndex < data.length; YIndex++)
			if (data[YIndex] && (dimensions.width === undefined ||
				data[YIndex].length > dimensions.width))
				dimensions.width = data[YIndex].length;
		if (dimensions.width === undefined) dimensions.width = 0;
		dimensions.height = data.length;
		return dimensions;
	};

	Matrix.conflict = function (matrixA, matrixB) {
		var XLimit = Math.min(matrixA.width, matrixB.width);
		var YLimit = Math.min(matrixA.height, matrixB.height);
		for (var YIndex = 0; YIndex < YLimit; YIndex++)
			for (var XIndex = 0; Xindex < XLimit; XIndex++)
				if (matrixA.get(XIndex, YIndex) !== undefined &&
					matrixB.get(XIndex, YIndex) !== undefined)
					return true;
		return false;
	};

	Matrix.Selection = function (matrix, XOffset, YOffset, width, height) {
		this.matrix = matrix;
		this.XOffset = XOffset;
		this.YOffset = YOffset;
		this.width = (width !== undefined) ? width : matrix.width - XOffset;
		this.height = (height !== undefined) ? height :
			matrix.height - YOffset;
	};

	Matrix.Selection.prototype = Object.create(Matrix.prototype);
	Matrix.Selection.prototype.constructor = Matrix.Selection;

	Matrix.Selection.prototype.reset = function () {
		for (var YIndex = 0; YIndex < this.height; YIndex++)
			for (var XIndex = 0; XIndex < this.width; XIndex++)
				this.matrix.set(this.XOffset + XIndex, this.YOffset + YIndex,
					undefined);
		return this;
	};

	Matrix.Selection.prototype.get = function (XPosition, YPosition) {
		return this.matrix.get(this.XOffset + XPosition,
			this.YOffset + YPosition);
	};

	Matrix.Selection.prototype.set = function (XPosition, YPosition, value) {
		this.matrix.set(this.XOffset + XPosition, this.YOffset + YPosition,
			value);
		return this;
	};

	Matrix.Selection.prototype.edit = function (XPosition, YPosition, task) {
		this.set(XPosition, YPosition, task(this.get(XPosition, YPosition),
			XPosition + this.XOffset, YPosition + this.YOffset));
		return this;
	};

	Matrix.Mask = function (matrix, filter) {
		this.matrix = matrix;
		this.filter = filter;
		var dimensions = Matrix.measure(filter);
		this.width = dimensions.width;
		this.height = dimensions.height;
	};

	Matrix.Mask.prototype = Object.create(Matrix.prototype);
	Matrix.Mask.prototype.constructor = Matrix.Mask;

	Matrix.Mask.prototype.reset = function () {
		for (var YIndex = 0; YIndex < this.height; YIndex++)
			for (var XIndex = 0; XIndex < this.width; XIndex++)
				if (this.filter[YPosition] &&
					this.filter[YPosition][XPosition])
					this.matrix.set(this.XOffset + XIndex,
						this.YOffset + YIndex, undefined);
		return this;
	};

	Matrix.Mask.prototype.get = function (XPosition, YPosition) {
		if (this.filter[YPosition] && this.filter[YPosition][XPosition])
			return this.matrix.get(XPosition, YPosition);
		return undefined;
	};

	Matrix.Mask.prototype.set = function (XPosition, YPosition, value) {
		if (this.filter[YPosition] && this.filter[YPosition][XPosition])
			this.matrix.set(XPosition, YPosition, value);
		return this;
	};

	Matrix.Direction = {
		TOP: 0,
		BOTTOM: 1,
		LEFT: 2,
		RIGHT: 3,
		CLOCKWISE: 4,
		ANTICLOCKWISE: 5
	};

	return Matrix;
});
