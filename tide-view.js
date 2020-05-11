
var GraphModel = function() {
    var self = this;

    self.canvasWidth = 800;
    self.graphLeft = 30;
    self.graphHeight = 400;
    self.graphWidth = self.canvasWidth - self.graphLeft;
    self.horizontalMidLine = self.graphHeight / 2;
    self.maxYValue = 2.5;
    self.verticalFactor = (self.graphHeight / 2) / self.maxYValue;
    self.yAxisIncrement = 0.25;

    self.plotData = [];

    self.draw = function() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        var plotWidth = self.graphWidth / self.plotData.length;
        for(var i = 0; i < self.plotData.length; i++) {
            var x = self.graphLeft + (i * plotWidth);
            var y = self.horizontalMidLine + (self.verticalFactor * self.plotData[i].value * -1);
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
        ctx.moveTo(self.graphLeft, self.horizontalMidLine);
        ctx.lineTo(self.graphLeft + self.graphWidth, self.horizontalMidLine);
        ctx.stroke();

        // draw the y axis
        ctx.beginPath();
        ctx.moveTo(self.graphLeft, 0);
        ctx.lineTo(self.graphLeft, self.graphHeight);
        ctx.stroke();
        // draw y axis labels
        // start from the midline and go up
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.font = '10px serif';
        for(var i = self.yAxisIncrement; i < self.maxYValue; i+=self.yAxisIncrement) {
            ctx.beginPath();
            var y = self.horizontalMidLine + (self.verticalFactor * i * -1);
            ctx.fillText(i, self.graphLeft-4, y, 30);
            ctx.moveTo(self.graphLeft-2, y);
            ctx.lineTo(self.graphLeft+2, y);
            ctx.stroke();
        }
        for(var i = 0; i > (self.maxYValue * -1); i-=self.yAxisIncrement) {
            console.log(i);
            ctx.beginPath();
            var y = self.horizontalMidLine + (self.verticalFactor * i * -1);
            ctx.fillText(i, self.graphLeft-4, y, 30);
            ctx.moveTo(self.graphLeft-2, y);
            ctx.lineTo(self.graphLeft+2, y);
            ctx.stroke();
        }
        ctx.restore();

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
            url: "https://api.niwa.co.nz/tides/data?datum=LAT&apikey=bUkpipT5MeooRJdzSaeXssGiWtmvXizG",
            data: { lat: -39.1196925, long: 173.9669005, interval: 10, numberOfDays: 5 }
        })
        .done(function( data ) {
            console.log(data);
            self.parseData(data);
        });
    };
    self.getData();
};