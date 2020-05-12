
san = function(value) {
    return Math.floor(value) + 0.5;
}


var GraphModel = function() {
    var self = this;

    self.canvasWidth = 800;
    self.canvasHeight = 500;
    self.graphTop = 30;
    self.graphFooterHeight = 70;
    self.graphHeight = self.canvasHeight - (self.graphTop + self.graphFooterHeight);
    self.graphBottom = self.graphHeight + self.graphTop;
    self.graphLeft = 30;
    self.graphWidth = self.canvasWidth - self.graphLeft;
    self.horizontalMidLine = self.graphHeight / 2;
    self.maxYValue = 4.5;
    self.minYValue = 0;
    self.verticalFactor = self.graphHeight  / self.maxYValue;
    self.yAxisIncrement = 0.25;

    self.plotData = [];

    self.draw = function() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        var plotWidth = self.graphWidth / self.plotData.length;


        // draw the y axis
        ctx.beginPath();
        ctx.moveTo(self.graphLeft, self.graphTop);
        ctx.lineTo(self.graphLeft, self.graphBottom);
        ctx.stroke();
        // draw y axis labels
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.font = '10px serif';
        for(var i = self.minYValue + self.yAxisIncrement; i < self.maxYValue; i+=self.yAxisIncrement) {
            ctx.save();
            ctx.beginPath();
            var y = self.graphBottom - (self.verticalFactor * i);
            y = san(y);
            ctx.fillText(i, self.graphLeft-4, y, 30);
            ctx.moveTo(self.graphLeft-2, y);
            ctx.lineTo(self.graphLeft+2, y);
            ctx.stroke();
            
            // draw a horizontal grid line
            ctx.beginPath();
            ctx.strokeStyle = '#d1d1d1';
            ctx.moveTo(self.graphLeft+4, y);
            ctx.lineTo(self.canvasWidth, y);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // draw the vertical bars for the date changes
        var previousTime = null;
        for(var i = 0; i < self.plotData.length; i++) {
            var thisTime = self.plotData[i].time.substring(0, 10);
            if(previousTime && previousTime != thisTime) {
                // the date has just changed ...
                var x = self.graphLeft + (i * plotWidth);
                x = Math.floor(x) + 0.5;
                ctx.save();
                // draw a vertical grid line
                ctx.beginPath();
                ctx.strokeStyle = '#d1d1d1';
                ctx.moveTo(x, self.graphTop);
                ctx.lineTo(x, self.graphBottom);
                ctx.stroke();
                // put the date in ... somewhere
                var plotMoment = moment.utc(self.plotData[i].time);
                var output = plotMoment.format("ddd Do MMM");
                //ctx.moveTo(x, self.graphBottom);
                ctx.beginPath();
                ctx.fillText(output, x + 4, self.graphBottom);
                ctx.stroke();

                ctx.restore();
            }

            previousTime = thisTime;
        }

        // draw the tide height values
        for(var i = 0; i < self.plotData.length; i++) {
            var x = self.graphLeft + (i * plotWidth);
            var y = self.graphBottom - (self.verticalFactor * self.plotData[i].value);
            //console.log("drawing data " + i + " at " + x + "," + y);
            ctx.save();
            //ctx.translate(x, y);
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }
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