(function ($) {
var img= '../../declick/plugins/flip.png';
// extend menu
$.extend(true, $.fn.wPaint.menus.main.items, {
horizontal: {
icon: 'generic',
title: 'Horizontal',
img: img,
index: 1,
callback: function () {
    this.horizontal();
}
},
vertical: {
icon: 'generic',
title: 'Vertical',
img: img,
index: 0,
callback: function () {
    this.vertical();
}
}
});
// extend functions
$.fn.wPaint.extend({
    horizontal:function() {
        var operationCanvas = document.createElement('canvas');
        $(operationCanvas).css({display: 'none', position: 'absolute', left: 0, top: 0})
        .attr('width', this.width)
        .attr('height', this.height);
        var operationCanvasContext = operationCanvas.getContext('2d');
        operationCanvasContext.translate(Math.round(this.width), 0);
        operationCanvasContext.scale(-1,1);
        operationCanvasContext.drawImage(this.canvas,0,0);
        var context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.width, this.height);
        context.drawImage(operationCanvas,0,0);
        this._addUndo();
    },
    vertical:function() {
        var operationCanvas = document.createElement('canvas');
        $(operationCanvas).css({display: 'none', position: 'absolute', left: 0, top: 0})
        .attr('width', this.width)
        .attr('height', this.height);
        var operationCanvasContext = operationCanvas.getContext('2d');
        operationCanvasContext.translate(0, Math.round(this.height));
        operationCanvasContext.scale(1,-1);
        operationCanvasContext.drawImage(this.canvas,0,0);
        var context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.width, this.height);
        context.drawImage(operationCanvas,0,0);
        this._addUndo();
    }
});
})(jQuery);