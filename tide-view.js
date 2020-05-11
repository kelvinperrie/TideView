
var GraphModel = function() {
    var self = this;

    self.canvasWidth = 800;
    self.graphLeft = 30;
    self.graphHeight = 400;
    self.graphWidth = self.canvasWidth - self.graphLeft;
    self.horizontalMidLine = self.graphHeight / 2;
    self.maxValue = 2.5;
    self.verticalFactor = (self.graphHeight / 2) / self.maxValue;

    self.plotData = [];

    self.draw = function() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        var plotWidth = self.graphWidth / self.plotData.length;
        for(var i = 0; i < self.plotData.length; i++) {
            var x = self.graphLeft + (i * plotWidth);
            var y = self.horizontalMidLine + (self.verticalFactor * self.plotData[i].value);
            //console.log("drawing data " + i + " at " + x + "," + y);
            ctx.save();
            //ctx.translate(x, y);
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }

        // draw the center line
        ctx.beginPath();
        ctx.moveTo(self.graphLeft + 0, self.horizontalMidLine);
        ctx.lineTo(self.graphLeft + self.graphWidth, self.horizontalMidLine);
        ctx.stroke();

        // draw the y axis

    };

    self.parseData = function(data) {
        // i dunno, seems good enough
        self.plotData = data.values;
        self.draw();
    };

    self.getData = function() {
        // https://api.niwa.co.nz/tides/data?lat=-39.1196925&long=173.9669005&numberOfDays=1&datum=LAT&interval=10&apikey=bUkpipT5MeooRJdzSaeXssGiWtmvXizG

        $.ajax({
            method: "GET",
            url: "https://api.niwa.co.nz/tides/data?datum=MSL&apikey=bUkpipT5MeooRJdzSaeXssGiWtmvXizG",
            data: { lat: -39.1196925, long: 173.9669005, interval: 10, numberOfDays: 5 }
        })
        .done(function( data ) {
            console.log(data);
            self.parseData(data);
        });
    };
    self.getData();
};