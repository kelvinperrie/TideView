
san = function(value) {
    return Math.floor(value) + 0.5;
}


var GraphModel = function() {
    var self = this;

    var canvas = document.getElementById('canvas');
    
    self.canvasWidth = canvas.width;
    self.canvasHeight = canvas.height;
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

    self.lat = 0;
    self.long = 0;
    self.days = 0;

    self.plotData = [];

    self.draw = function() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, self.canvasWidth, self.canvasHeight);

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

        // draw vertical grid lines
        var previousDate = null;
        for(var i = 0; i < self.plotData.length; i++) {
            var thisDate = self.plotData[i].time.substring(0, 10);
            var thisTime = self.plotData[i].time.substring(11,19);
            // draw the vertical bars for the date changes
            if(previousDate && previousDate != thisDate) {
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
                ctx.fillText(output, x + 4, self.graphBottom + 15);
                ctx.stroke();

                ctx.restore();
            }
            // draw lesser lines at lunchtime
            // don't draw one if first time is lunchtime
            if(i > 0 && thisTime == "12:00:00") {
                var x = san(self.graphLeft + (i * plotWidth));
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([8, 8]);
                ctx.strokeStyle = '#d1d1d1';
                ctx.moveTo(x, self.graphTop);
                ctx.lineTo(x, self.graphBottom);
                ctx.stroke();
                ctx.restore();
            }

            previousDate = thisDate;
        }

        // draw the tide height values
        var direction = "increasing";
        for(var i = 0; i < self.plotData.length; i++) {
            var x = self.graphLeft + (i * plotWidth);
            var y = self.graphBottom - (self.verticalFactor * self.plotData[i].value);
            //console.log("drawing data " + i + " at " + x + "," + y);
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();

            // draw the labels at high and low tides indicating the times
            if(i < self.plotData.length -1) {
                if(direction === "increasing" && self.plotData[i].value > self.plotData[i+1].value) {
                    direction = "decreasing";
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'left';
                    ctx.font = '10px serif';
                    ctx.translate(x, y);
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.fillText(self.plotData[i].time.substring(11,16), 5, 0);
                    ctx.stroke();
                    ctx.restore();

                } else if(direction === "decreasing" && self.plotData[i].value < self.plotData[i+1].value) {
                    direction = "increasing";
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'right';
                    ctx.font = '10px serif';
                    ctx.translate(x, y);
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.fillText(self.plotData[i].time.substring(11,16), -5, 0);
                    ctx.stroke();
                    ctx.restore();
                    
                }
            }
        }
    };

    
    self.parseData = function(data) {
        // i dunno, seems good enough for now
        self.plotData = data.values;
        self.draw();
    };

    self.getData = function() {
        // https://api.niwa.co.nz/tides/data?lat=-39.1196925&long=173.9669005&numberOfDays=1&datum=LAT&interval=10&apikey=bUkpipT5MeooRJdzSaeXssGiWtmvXizG

        $.ajax({
            method: "GET",
            url: "https://api.niwa.co.nz/tides/data?datum=LAT&apikey=bUkpipT5MeooRJdzSaeXssGiWtmvXizG",
            data: { lat: self.lat, long: self.long, interval: 10, numberOfDays: self.days }
        })
        .done(function( data ) {
            console.log(data);
            self.parseData(data);
        });
    };

    self.createGraph = function(lat, long, days) {
        self.lat = lat;
        self.long = long;
        self.days = days;
        self.getData();
    }
};