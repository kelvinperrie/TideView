san = function(value) {
    return Math.floor(value) + 0.5;
}


var TideModel = function(data) {
    var self = this;

    self.canvasId = 'canvas';
    self.canvas = document.getElementById('canvas');
    self.ctx = self.canvas.getContext('2d');
    
    self.expectedGraphHeight = 500;
    self.canvasWidth = self.canvas.width;
    self.canvasHeight = self.canvas.height;


    self.graphs = [];

    self.draw = function() {
        var graphCount = self.graphs.length;
        $("#"+self.canvasId).attr("height", self.expectedGraphHeight * graphCount);
        
        self.canvasWidth = canvas.width;
        self.canvasHeight = canvas.height;
        self.ctx.clearRect(0, 0, self.canvasWidth, self.canvasHeight);
        

        // self.ctx.save();
        // self.ctx.strokeStyle = '#ff0000';
        // self.ctx.beginPath();
        // self.ctx.arc(50, 30, 1, 0, 2 * Math.PI);
        // self.ctx.stroke();
        // self.ctx.beginPath();
        // self.ctx.arc(50, 430, 1, 0, 2 * Math.PI);
        // self.ctx.stroke();
        // self.ctx.beginPath();
        // self.ctx.arc(50, 500, 1, 0, 2 * Math.PI);
        // self.ctx.stroke();
        // self.ctx.restore();




        self.drawAllGraphs();
    };

    self.drawAllGraphs = function() {

        for(var i = 0; i < self.graphs.length; i++) {
            var settings = new graphSettings(self.expectedGraphHeight, self.canvas.width, i * self.expectedGraphHeight)
            self.drawGraph(self.graphs[i], settings);
        }
    };

    self.drawGraph = function(graphData, graphSettings) {
        console.log("drawing graph")
        console.log(graphSettings);
        console.log(graphData);
        var graphPlotData = graphData.plots;
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        //ctx.clearRect(0, 0, self.canvasWidth, self.canvasHeight);

        var plotWidth = graphSettings.dataWidth / graphPlotData.length;

        // draw the graph label
        ctx.save();
        ctx.beginPath();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = '50px sans-serif';
        ctx.strokeStyle = '#999999';
        ctx.translate(50, graphSettings.dataHorizontalMidLine);
        ctx.rotate(270 * Math.PI / 180);
        ctx.strokeText(graphData.month, 0, 0);
        ctx.stroke();
        ctx.restore();

        // draw the y axis
        ctx.beginPath();
        ctx.moveTo(graphSettings.dataLeft, graphSettings.dataTop);
        ctx.lineTo(graphSettings.dataLeft, graphSettings.dataBottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(graphSettings.dataRight, graphSettings.dataTop);
        ctx.lineTo(graphSettings.dataRight, graphSettings.dataBottom);
        ctx.stroke();
        // draw y axis labels
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.font = '10px serif';
        for(var i = graphSettings.minYValue + graphSettings.yAxisIncrement; i < graphSettings.maxYValue; i+=graphSettings.yAxisIncrement) {
            ctx.save();
            var y = graphSettings.dataBottom - (graphSettings.verticalFactor * i);
            y = san(y);
            // labels on the left
            ctx.beginPath();
            ctx.textAlign = 'right';
            ctx.fillText(i, graphSettings.dataLeft-4, y, 30);
            ctx.moveTo(graphSettings.dataLeft-2, y);
            ctx.lineTo(graphSettings.dataLeft+2, y);
            ctx.stroke();
            // labels on the right
            ctx.beginPath();
            ctx.textAlign = 'left';
            ctx.fillText(i, graphSettings.dataRight+4, y, 30);
            ctx.moveTo(graphSettings.dataRight-2, y);
            ctx.lineTo(graphSettings.dataRight+2, y);
            ctx.stroke();
            
            // draw a horizontal grid line
            ctx.beginPath();
            ctx.strokeStyle = '#EFEFEF';
            ctx.moveTo(graphSettings.dataLeft+4, y);
            ctx.lineTo(graphSettings.dataRight-4, y);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // draw vertical grid lines
        for(var i = 0; i < graphPlotData.length; i++) {

            var x = graphSettings.dataLeft + (i * plotWidth);
            x = Math.floor(x) + 0.5;
            ctx.save();
            // draw a vertical grid line
            ctx.beginPath();
            ctx.strokeStyle = '#EFEFEF';
            ctx.moveTo(x, graphSettings.dataTop);
            ctx.lineTo(x, graphSettings.dataBottom);
            ctx.stroke();
            // x axis labels - put the date in ... somewhere
            var output = graphPlotData[i].dayMoment.format("D");
            ctx.beginPath();
            ctx.textAlign = 'center';
            ctx.fillText(output, x + (plotWidth / 2), graphSettings.dataBottom + 15);
            ctx.stroke();

            ctx.restore();
        }

        // draw the tide height values
        var direction = "increasing";
        for(var i = 0; i < graphPlotData.length; i++) {
            // draw each tide for the day
            for(var j = 0; j < graphPlotData[i].tides.length; j++) {
                // plot the tide height
                var thisTide = graphPlotData[i].tides[j];
                var percentageIndent = thisTide.tideMoment.format("HHmm") / 2400;

                var x = graphSettings.dataLeft + (i * plotWidth) + (plotWidth * percentageIndent);
                var y = graphSettings.dataBottom - (graphSettings.verticalFactor * thisTide.height);
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.restore();
                // do the value indicating the time
                ctx.save();
                ctx.beginPath();
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.font = '10px serif';
                ctx.translate(x, y);
                ctx.rotate(270 * Math.PI / 180);
                var plotLabel = thisTide.height + " - " + thisTide.tideMoment.format("HH:mm");
                ctx.fillText(plotLabel, 5, 0);
                ctx.stroke();
                ctx.restore();
            }
        }
    };


    self.parseData = function(data) {

        function ParseTide(tides, parts, time, height) {
            if(time) {
                var dateString = `${parts[0]}-${parts[2]}-${parts[3]} ${time}`;
                var date = moment(dateString, "DD-MM-YYYY HH:mm")
                tides.push({
                    tideMoment: date,
                    height: height
                });
            }
        }

        function ParseTides() {
            var tides= [];
            ParseTide(tides, parts, parts[4], parts[5]);
            ParseTide(tides, parts, parts[6], parts[7]);
            ParseTide(tides, parts, parts[8], parts[9]);
            ParseTide(tides, parts, parts[10], parts[11]);
            return tides;
        }

        function ParseDay(parts) {
            var dateString = `${parts[0]}-${parts[2]}-${parts[3]} 00:00`;
            var date = moment(dateString, "DD-MM-YYYY HH:mm")
            var tides = ParseTides();
            return {
                dayMoment: date,
                tides: tides
            };
        }

        var lines = data.split(/\r?\n/);
        var graphData = null;
        var graphCount = -1;
        var month = "";
        for(var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(",");
            // a heap of the lines are random garbage, ignore them if they don't look like what we want
            if(parts.length===12) {
                // what is the date / month for this line
                var dateString = `${parts[0]}-${parts[2]}-${parts[3]} 00:00`;
                var date = moment(dateString, "DD-MM-YYYY HH:mm")
                var thisMonth = date.format("MMMM");
                // if this is a new month then start the data for a new graph and put it into our data set
                if(thisMonth !== month) {
                    console.log("doing data for " + thisMonth)
                    month = thisMonth;
                    graphCount = graphCount + 1;
                    var yOffset = (graphCount + 1) * self.expectedGraphHeight;
                    graphData = {
                        month : thisMonth,
                        plots : [],
                        graphSettings : {

                        }
                    };
                    self.graphs.push(graphData);
                }
                var day = ParseDay(parts);
                self.graphs[graphCount].plots.push(day);
            }
        }
        console.log(self.plotData)
    };

    var graphSettings = function(expectedGraphHeight, expectedGraphWidth, yOffset) {
        var self = this;

        self.graphTop = yOffset;
        self.yTopMargin = 30;
        self.dataTop = yOffset + self.yTopMargin;
        self.yBottomMargin = 70;
        self.dataHeight = expectedGraphHeight - (self.yTopMargin + self.yBottomMargin);
        self.dataBottom = self.dataHeight + self.dataTop;
        self.dataLeft = 100;
        self.dataRight = expectedGraphWidth - 100;
        self.dataWidth = self.dataRight - self.dataLeft;
        self.dataHorizontalMidLine = self.dataTop + (self.dataHeight / 2);
        self.maxYValue = 4;
        self.minYValue = 0;
        self.verticalFactor = self.dataHeight  / self.maxYValue,
        self.yAxisIncrement = 0.25;
        self.yOffset = yOffset;
    };

    self.initialize = function() {
        self.parseData(data);
        
        self.draw();
    };
    self.initialize();

};

var data = `
076,Port Taranaki,39°03'S,174°02'E                                          
Based on constituent set with reference date:,02-Jul-2007
Local Std or Daylight Time,Tidal heights in metres.
1,We,1,2020,02:26,3.0,08:33,0.9,14:43,3.0,21:06,1.0
2,Th,1,2020,03:11,2.8,09:17,1.0,15:31,2.9,21:53,1.1
3,Fr,1,2020,04:00,2.8,10:09,1.2,16:23,2.8,22:45,1.1
4,Sa,1,2020,04:56,2.7,11:07,1.2,17:20,2.8,23:41,1.1
5,Su,1,2020,05:57,2.7,12:11,1.3,18:18,2.8,,
6,Mo,1,2020,00:40,1.1,07:01,2.7,13:14,1.2,19:15,2.8
7,Tu,1,2020,01:39,1.0,08:00,2.9,14:10,1.1,20:10,2.9
8,We,1,2020,02:33,0.9,08:51,3.0,15:01,0.9,21:00,3.0
9,Th,1,2020,03:22,0.7,09:37,3.2,15:47,0.7,21:48,3.2
10,Fr,1,2020,04:08,0.6,10:21,3.4,16:33,0.6,22:35,3.3
11,Sa,1,2020,04:52,0.4,11:04,3.5,17:18,0.4,23:22,3.4
12,Su,1,2020,05:36,0.3,11:47,3.6,18:03,0.3,,
13,Mo,1,2020,00:08,3.5,06:21,0.3,12:32,3.7,18:50,0.3
14,Tu,1,2020,00:55,3.5,07:06,0.3,13:19,3.6,19:38,0.3
15,We,1,2020,01:44,3.4,07:54,0.4,14:08,3.5,20:29,0.4
16,Th,1,2020,02:34,3.3,08:44,0.6,15:00,3.4,21:21,0.6
17,Fr,1,2020,03:28,3.2,09:40,0.7,15:57,3.2,22:17,0.7
18,Sa,1,2020,04:27,3.0,10:42,0.9,16:59,3.1,23:18,0.8
19,Su,1,2020,05:33,3.0,11:51,1.0,18:05,3.0,,
20,Mo,1,2020,00:24,0.9,06:45,2.9,13:03,1.0,19:13,3.0
21,Tu,1,2020,01:32,0.9,07:55,3.0,14:10,0.9,20:18,3.0
22,We,1,2020,02:35,0.8,08:56,3.1,15:08,0.8,21:16,3.1
23,Th,1,2020,03:30,0.7,09:46,3.2,15:58,0.7,22:06,3.1
24,Fr,1,2020,04:17,0.6,10:30,3.3,16:43,0.6,22:50,3.2
25,Sa,1,2020,04:59,0.5,11:10,3.4,17:24,0.6,23:30,3.2
26,Su,1,2020,05:38,0.5,11:46,3.4,18:02,0.6,,
27,Mo,1,2020,00:07,3.2,06:14,0.5,12:21,3.4,18:38,0.6
28,Tu,1,2020,00:42,3.2,06:49,0.6,12:55,3.3,19:14,0.7
29,We,1,2020,01:17,3.2,07:23,0.7,13:30,3.3,19:49,0.7
30,Th,1,2020,01:52,3.1,07:59,0.8,14:06,3.2,20:26,0.8
31,Fr,1,2020,02:29,3.0,08:36,0.9,14:45,3.0,21:05,0.9
1,Sa,2,2020,03:10,2.9,09:19,1.1,15:30,2.9,21:49,1.0
2,Su,2,2020,03:58,2.8,10:10,1.2,16:21,2.8,22:40,1.1
3,Mo,2,2020,04:56,2.7,11:11,1.3,17:20,2.7,23:41,1.2
4,Tu,2,2020,06:04,2.7,12:21,1.3,18:25,2.7,,
5,We,2,2020,00:49,1.2,07:15,2.8,13:30,1.2,19:31,2.8
6,Th,2,2020,01:57,1.0,08:19,2.9,14:32,1.0,20:33,3.0
7,Fr,2,2020,02:56,0.8,09:13,3.2,15:25,0.8,21:29,3.2
8,Sa,2,2020,03:47,0.6,10:01,3.4,16:14,0.5,22:20,3.4
9,Su,2,2020,04:35,0.4,10:47,3.6,17:01,0.3,23:08,3.5
10,Mo,2,2020,05:20,0.2,11:31,3.8,17:47,0.2,23:54,3.6
11,Tu,2,2020,06:05,0.1,12:16,3.8,18:33,0.1,,
12,We,2,2020,00:40,3.7,06:50,0.1,13:02,3.8,19:20,0.2
13,Th,2,2020,01:26,3.6,07:36,0.3,13:49,3.7,20:07,0.3
14,Fr,2,2020,02:14,3.5,08:24,0.4,14:38,3.5,20:57,0.5
15,Sa,2,2020,03:04,3.3,09:17,0.7,15:32,3.2,21:50,0.7
16,Su,2,2020,04:00,3.1,10:16,0.9,16:31,3.0,22:49,0.9
17,Mo,2,2020,05:04,2.9,11:25,1.1,17:39,2.9,23:57,1.0
18,Tu,2,2020,06:21,2.8,12:43,1.1,18:54,2.8,,
19,We,2,2020,01:12,1.0,07:39,2.9,13:56,1.1,20:07,2.8
20,Th,2,2020,02:21,1.0,08:43,3.0,14:56,0.9,21:07,2.9
21,Fr,2,2020,03:17,0.8,09:33,3.1,15:45,0.8,21:55,3.0
22,Sa,2,2020,04:02,0.7,10:15,3.3,16:27,0.7,22:36,3.2
23,Su,2,2020,04:42,0.6,10:51,3.3,17:05,0.6,23:12,3.2
24,Mo,2,2020,05:18,0.5,11:24,3.4,17:39,0.6,23:45,3.3
25,Tu,2,2020,05:51,0.5,11:56,3.4,18:12,0.5,,
26,We,2,2020,00:17,3.3,06:23,0.5,12:27,3.4,18:44,0.6
27,Th,2,2020,00:48,3.3,06:55,0.6,12:58,3.3,19:16,0.6
28,Fr,2,2020,01:19,3.2,07:27,0.7,13:31,3.2,19:49,0.7
29,Sa,2,2020,01:52,3.1,08:01,0.8,14:06,3.1,20:24,0.8
1,Su,3,2020,02:28,3.0,08:39,1.0,14:45,3.0,21:04,1.0
2,Mo,3,2020,03:11,2.8,09:26,1.1,15:33,2.8,21:52,1.1
3,Tu,3,2020,04:05,2.7,10:25,1.3,16:33,2.7,22:53,1.2
4,We,3,2020,05:15,2.7,11:38,1.3,17:44,2.7,,
5,Th,3,2020,00:07,1.2,06:35,2.7,12:55,1.2,18:59,2.8
6,Fr,3,2020,01:24,1.1,07:48,2.9,14:04,1.0,20:09,2.9
7,Sa,3,2020,02:30,0.8,08:47,3.2,15:02,0.7,21:09,3.2
8,Su,3,2020,03:25,0.6,09:38,3.5,15:53,0.4,22:01,3.4
9,Mo,3,2020,04:14,0.3,10:25,3.7,16:41,0.2,22:49,3.6
10,Tu,3,2020,05:00,0.1,11:11,3.8,17:27,0.1,23:35,3.8
11,We,3,2020,05:45,0.1,11:56,3.9,18:12,0.0,,
12,Th,3,2020,00:20,3.8,06:30,0.1,12:41,3.8,18:58,0.1
13,Fr,3,2020,01:05,3.7,07:16,0.2,13:27,3.7,19:44,0.2
14,Sa,3,2020,01:51,3.5,08:04,0.4,14:15,3.4,20:32,0.5
15,Su,3,2020,02:39,3.3,08:55,0.7,15:07,3.2,21:23,0.7
16,Mo,3,2020,03:34,3.1,09:54,0.9,16:06,2.9,22:21,1.0
17,Tu,3,2020,04:38,2.9,11:03,1.1,17:15,2.7,23:30,1.1
18,We,3,2020,05:56,2.8,12:22,1.2,18:34,2.7,,
19,Th,3,2020,00:49,1.2,07:18,2.8,13:37,1.1,19:50,2.7
20,Fr,3,2020,02:01,1.1,08:22,2.9,14:36,1.0,20:49,2.9
21,Sa,3,2020,02:56,0.9,09:10,3.1,15:23,0.9,21:34,3.0
22,Su,3,2020,03:40,0.8,09:50,3.2,16:03,0.7,22:13,3.1
23,Mo,3,2020,04:18,0.7,10:24,3.3,16:39,0.6,22:47,3.2
24,Tu,3,2020,04:52,0.6,10:56,3.4,17:12,0.6,23:18,3.3
25,We,3,2020,05:24,0.5,11:27,3.4,17:43,0.5,23:49,3.3
26,Th,3,2020,05:55,0.5,11:57,3.4,18:14,0.5,,
27,Fr,3,2020,00:18,3.3,06:26,0.6,12:27,3.3,18:45,0.6
28,Sa,3,2020,00:48,3.3,06:57,0.7,12:59,3.2,19:17,0.7
29,Su,3,2020,01:20,3.2,07:31,0.8,13:33,3.1,19:51,0.8
30,Mo,3,2020,01:55,3.1,08:10,0.9,14:13,3.0,20:31,0.9
31,Tu,3,2020,02:38,2.9,08:57,1.1,15:01,2.8,21:19,1.1
1,We,4,2020,03:33,2.8,09:58,1.2,16:03,2.7,22:21,1.2
2,Th,4,2020,04:44,2.7,11:11,1.2,17:16,2.7,23:36,1.2
3,Fr,4,2020,06:04,2.8,12:27,1.1,18:33,2.8,,
4,Sa,4,2020,00:55,1.1,07:18,3.0,13:36,0.9,19:44,3.0
5,Su,4,2020,02:03,0.8,07:19,3.2,13:35,0.6,19:45,3.2
6,Mo,4,2020,02:00,0.6,08:12,3.5,14:28,0.4,20:38,3.5
7,Tu,4,2020,02:51,0.3,09:00,3.7,15:17,0.2,21:27,3.7
8,We,4,2020,03:38,0.1,09:47,3.8,16:03,0.0,22:13,3.8
9,Th,4,2020,04:24,0.1,10:32,3.8,16:49,0.0,22:58,3.8
10,Fr,4,2020,05:10,0.1,11:18,3.8,17:35,0.1,23:43,3.7
11,Sa,4,2020,05:56,0.3,12:05,3.6,18:21,0.3,,
12,Su,4,2020,00:29,3.5,06:44,0.5,12:54,3.3,19:08,0.5
13,Mo,4,2020,01:17,3.3,07:35,0.7,13:46,3.1,19:58,0.8
14,Tu,4,2020,02:10,3.1,08:33,1.0,14:44,2.8,20:55,1.0
15,We,4,2020,03:13,2.9,09:39,1.1,15:51,2.7,22:02,1.2
16,Th,4,2020,04:27,2.8,10:54,1.2,17:06,2.6,23:18,1.2
17,Fr,4,2020,05:43,2.8,12:05,1.2,18:18,2.7,,
18,Sa,4,2020,00:29,1.2,06:46,2.9,13:03,1.0,19:16,2.8
19,Su,4,2020,01:24,1.0,07:35,3.0,13:50,0.9,20:02,3.0
20,Mo,4,2020,02:09,0.9,08:15,3.1,14:30,0.8,20:41,3.1
21,Tu,4,2020,02:47,0.8,08:50,3.2,15:06,0.7,21:16,3.2
22,We,4,2020,03:22,0.7,09:24,3.3,15:40,0.6,21:48,3.3
23,Th,4,2020,03:55,0.6,09:55,3.3,16:12,0.6,22:19,3.3
24,Fr,4,2020,04:27,0.6,10:27,3.3,16:44,0.6,22:50,3.3
25,Sa,4,2020,04:59,0.6,10:59,3.3,17:16,0.6,23:22,3.3
26,Su,4,2020,05:33,0.7,11:33,3.2,17:50,0.7,23:56,3.2
27,Mo,4,2020,06:10,0.8,12:10,3.1,18:28,0.8,,
28,Tu,4,2020,00:34,3.1,06:52,0.9,12:53,3.0,19:10,0.9
29,We,4,2020,01:19,3.0,07:43,1.0,13:45,2.9,20:01,1.0
30,Th,4,2020,02:16,2.9,08:43,1.1,14:47,2.8,21:02,1.1
1,Fr,5,2020,03:25,2.9,09:52,1.1,15:58,2.8,22:14,1.1
2,Sa,5,2020,04:39,2.9,11:02,1.0,17:10,2.9,23:27,1.0
3,Su,5,2020,05:48,3.1,12:08,0.8,18:19,3.0,,
4,Mo,5,2020,00:35,0.8,06:49,3.3,13:07,0.6,19:19,3.3
5,Tu,5,2020,01:34,0.6,07:43,3.5,14:01,0.4,20:14,3.5
6,We,5,2020,02:26,0.4,08:34,3.6,14:52,0.2,21:03,3.6
7,Th,5,2020,03:16,0.2,09:23,3.7,15:40,0.1,21:51,3.7
8,Fr,5,2020,04:03,0.2,10:10,3.7,16:27,0.1,22:37,3.7
9,Sa,5,2020,04:50,0.2,10:57,3.6,17:13,0.2,23:22,3.6
10,Su,5,2020,05:37,0.4,11:45,3.4,17:59,0.4,,
11,Mo,5,2020,00:08,3.5,06:26,0.6,12:34,3.2,18:46,0.6
12,Tu,5,2020,00:56,3.3,07:17,0.8,13:25,3.0,19:35,0.8
13,We,5,2020,01:47,3.1,08:11,1.0,14:20,2.8,20:28,1.0
14,Th,5,2020,02:45,2.9,09:11,1.1,15:21,2.7,21:28,1.2
15,Fr,5,2020,03:49,2.8,10:15,1.2,16:25,2.7,22:35,1.2
16,Sa,5,2020,04:55,2.8,11:19,1.1,17:31,2.7,23:42,1.2
17,Su,5,2020,05:56,2.8,12:17,1.1,18:30,2.8,,
18,Mo,5,2020,00:41,1.1,06:47,2.9,13:07,1.0,19:20,2.9
19,Tu,5,2020,01:29,1.0,07:31,3.0,13:50,0.9,20:03,3.0
20,We,5,2020,02:11,0.9,08:11,3.1,14:30,0.8,20:41,3.1
21,Th,5,2020,02:49,0.8,08:48,3.2,15:06,0.7,21:17,3.2
22,Fr,5,2020,03:25,0.7,09:23,3.2,15:42,0.6,21:51,3.3
23,Sa,5,2020,04:00,0.7,09:59,3.2,16:17,0.6,22:26,3.3
24,Su,5,2020,04:36,0.7,10:35,3.2,16:53,0.6,23:01,3.3
25,Mo,5,2020,05:14,0.7,11:14,3.2,17:31,0.6,23:39,3.3
26,Tu,5,2020,05:56,0.7,11:56,3.1,18:12,0.7,,
27,We,5,2020,00:21,3.2,06:42,0.8,12:43,3.0,18:57,0.8
28,Th,5,2020,01:09,3.1,07:34,0.9,13:36,3.0,19:48,0.9
29,Fr,5,2020,02:05,3.1,08:31,0.9,14:35,2.9,20:47,0.9
30,Sa,5,2020,03:08,3.0,09:33,0.9,15:39,2.9,21:52,1.0
31,Su,5,2020,04:14,3.1,10:36,0.8,16:46,3.0,23:01,0.9
1,Mo,6,2020,05:19,3.1,11:39,0.7,17:52,3.1,,
2,Tu,6,2020,00:07,0.8,06:20,3.3,12:39,0.6,18:54,3.2
3,We,6,2020,01:09,0.7,07:17,3.4,13:36,0.5,19:50,3.4
4,Th,6,2020,02:04,0.5,08:10,3.5,14:29,0.3,20:43,3.5
5,Fr,6,2020,02:56,0.4,09:02,3.5,15:19,0.3,21:32,3.6
6,Sa,6,2020,03:45,0.4,09:52,3.5,16:08,0.3,22:19,3.6
7,Su,6,2020,04:34,0.4,10:40,3.4,16:54,0.3,23:04,3.5
8,Mo,6,2020,05:21,0.5,11:28,3.3,17:39,0.5,23:49,3.4
9,Tu,6,2020,06:08,0.6,12:15,3.2,18:24,0.6,,
10,We,6,2020,00:34,3.3,06:56,0.7,13:02,3.0,19:10,0.8
11,Th,6,2020,01:21,3.1,07:45,0.9,13:51,2.9,19:57,0.9
12,Fr,6,2020,02:11,3.0,08:35,1.0,14:42,2.8,20:49,1.1
13,Sa,6,2020,03:05,2.9,09:29,1.1,15:37,2.7,21:45,1.2
14,Su,6,2020,04:02,2.8,10:24,1.1,16:35,2.7,22:46,1.2
15,Mo,6,2020,04:59,2.8,11:20,1.1,17:34,2.7,23:47,1.2
16,Tu,6,2020,05:53,2.8,12:14,1.0,18:31,2.8,,
17,We,6,2020,00:42,1.1,06:43,2.9,13:05,1.0,19:21,2.9
18,Th,6,2020,01:31,1.0,07:29,3.0,13:51,0.9,20:06,3.0
19,Fr,6,2020,02:15,0.9,08:12,3.0,14:33,0.8,20:47,3.1
20,Sa,6,2020,02:56,0.8,08:54,3.1,15:14,0.7,21:26,3.2
21,Su,6,2020,03:36,0.7,09:35,3.2,15:54,0.6,22:05,3.3
22,Mo,6,2020,04:17,0.7,10:17,3.2,16:34,0.6,22:44,3.4
23,Tu,6,2020,04:59,0.6,11:00,3.2,17:15,0.5,23:25,3.4
24,We,6,2020,05:43,0.6,11:46,3.2,17:59,0.5,,
25,Th,6,2020,00:10,3.4,06:30,0.6,12:34,3.2,18:45,0.6
26,Fr,6,2020,00:58,3.3,07:21,0.6,13:24,3.1,19:34,0.7
27,Sa,6,2020,01:51,3.3,08:14,0.7,14:19,3.1,20:29,0.8
28,Su,6,2020,02:48,3.2,09:10,0.7,15:17,3.0,21:30,0.9
29,Mo,6,2020,03:49,3.2,10:09,0.7,16:20,3.0,22:35,0.9
30,Tu,6,2020,04:51,3.1,11:11,0.7,17:26,3.1,23:43,0.9
1,We,7,2020,05:54,3.2,12:14,0.7,18:31,3.1,,
2,Th,7,2020,00:48,0.8,06:55,3.2,13:15,0.6,19:32,3.3
3,Fr,7,2020,01:47,0.7,07:53,3.3,14:12,0.5,20:28,3.4
4,Sa,7,2020,02:42,0.6,08:48,3.3,15:04,0.5,21:18,3.5
5,Su,7,2020,03:32,0.5,09:39,3.3,15:52,0.4,22:04,3.5
6,Mo,7,2020,04:19,0.5,10:26,3.3,16:37,0.4,22:48,3.5
7,Tu,7,2020,05:04,0.5,11:11,3.3,17:20,0.5,23:29,3.4
8,We,7,2020,05:48,0.6,11:54,3.2,18:01,0.6,,
9,Th,7,2020,00:10,3.3,06:30,0.7,12:35,3.1,18:41,0.7
10,Fr,7,2020,00:51,3.2,07:12,0.8,13:16,3.0,19:22,0.8
11,Sa,7,2020,01:33,3.1,07:55,0.9,14:00,2.9,20:06,1.0
12,Su,7,2020,02:18,3.0,08:40,1.0,14:46,2.8,20:54,1.1
13,Mo,7,2020,03:08,2.9,09:28,1.1,15:38,2.7,21:49,1.2
14,Tu,7,2020,04:01,2.8,10:21,1.1,16:36,2.7,22:49,1.2
15,We,7,2020,04:57,2.8,11:18,1.1,17:37,2.7,23:51,1.2
16,Th,7,2020,05:53,2.8,12:16,1.1,18:38,2.8,,
17,Fr,7,2020,00:50,1.1,06:48,2.8,13:12,1.0,19:32,2.9
18,Sa,7,2020,01:42,1.0,07:40,2.9,14:03,0.9,20:19,3.1
19,Su,7,2020,02:29,0.9,08:29,3.1,14:49,0.7,21:03,3.2
20,Mo,7,2020,03:14,0.7,09:16,3.2,15:33,0.6,21:45,3.4
21,Tu,7,2020,03:58,0.6,10:01,3.3,16:16,0.4,22:27,3.5
22,We,7,2020,04:42,0.5,10:46,3.4,16:59,0.4,23:10,3.6
23,Th,7,2020,05:27,0.4,11:32,3.4,17:42,0.4,23:54,3.6
24,Fr,7,2020,06:13,0.4,12:18,3.4,18:28,0.4,,
25,Sa,7,2020,00:41,3.5,07:01,0.4,13:06,3.3,19:16,0.5
26,Su,7,2020,01:31,3.4,07:51,0.5,13:57,3.2,20:08,0.7
27,Mo,7,2020,02:24,3.3,08:45,0.6,14:53,3.1,21:06,0.8
28,Tu,7,2020,03:23,3.2,09:42,0.7,15:54,3.0,22:11,0.9
29,We,7,2020,04:26,3.1,10:45,0.8,17:03,3.0,23:22,1.0
30,Th,7,2020,05:33,3.0,11:53,0.8,18:15,3.0,,
31,Fr,7,2020,00:33,0.9,06:41,3.0,13:00,0.8,19:21,3.1
1,Sa,8,2020,01:36,0.8,07:44,3.1,14:00,0.7,20:18,3.2
2,Su,8,2020,02:31,0.7,08:40,3.1,14:52,0.6,21:06,3.3
3,Mo,8,2020,03:20,0.6,09:28,3.2,15:38,0.5,21:49,3.4
4,Tu,8,2020,04:04,0.6,10:12,3.3,16:20,0.5,22:29,3.5
5,We,8,2020,04:45,0.5,10:51,3.3,16:58,0.5,23:06,3.4
6,Th,8,2020,05:23,0.6,11:28,3.3,17:35,0.5,23:41,3.4
7,Fr,8,2020,06:00,0.6,12:04,3.2,18:10,0.6,,
8,Sa,8,2020,00:16,3.3,06:36,0.7,12:39,3.1,18:46,0.7
9,Su,8,2020,00:53,3.2,07:13,0.8,13:16,3.0,19:24,0.9
10,Mo,8,2020,01:32,3.1,07:51,0.9,13:57,2.9,20:06,1.0
11,Tu,8,2020,02:15,2.9,08:34,1.0,14:43,2.8,20:55,1.2
12,We,8,2020,03:06,2.8,09:24,1.1,15:39,2.7,21:54,1.3
13,Th,8,2020,04:03,2.7,10:22,1.2,16:45,2.7,23:02,1.3
14,Fr,8,2020,05:07,2.7,11:29,1.2,17:55,2.7,,
15,Sa,8,2020,00:11,1.2,06:12,2.7,12:36,1.1,19:00,2.9
16,Su,8,2020,01:12,1.1,07:13,2.9,13:35,0.9,19:53,3.1
17,Mo,8,2020,02:05,0.9,08:08,3.1,14:26,0.7,20:40,3.3
18,Tu,8,2020,02:52,0.6,08:57,3.3,15:12,0.5,21:23,3.5
19,We,8,2020,03:37,0.4,09:43,3.4,15:56,0.3,22:06,3.7
20,Th,8,2020,04:22,0.3,10:28,3.6,16:39,0.2,22:49,3.8
21,Fr,8,2020,05:06,0.2,11:12,3.6,17:23,0.2,23:33,3.8
22,Sa,8,2020,05:52,0.2,11:57,3.6,18:08,0.2,,
23,Su,8,2020,00:19,3.7,06:38,0.2,12:44,3.5,18:55,0.4
24,Mo,8,2020,01:07,3.5,07:26,0.4,13:33,3.4,19:46,0.6
25,Tu,8,2020,02:00,3.3,08:18,0.6,14:27,3.2,20:43,0.8
26,We,8,2020,02:58,3.1,09:16,0.8,15:30,3.0,21:50,1.0
27,Th,8,2020,04:05,2.9,10:22,0.9,16:43,2.9,23:06,1.1
28,Fr,8,2020,05:19,2.8,11:36,1.0,18:03,2.9,,
29,Sa,8,2020,00:22,1.0,06:34,2.9,12:49,1.0,19:12,3.0
30,Su,8,2020,01:27,0.9,07:38,3.0,13:49,0.8,20:07,3.2
31,Mo,8,2020,02:20,0.8,08:30,3.1,14:39,0.7,20:51,3.3
1,Tu,9,2020,03:04,0.6,09:14,3.2,15:21,0.6,21:30,3.4
2,We,9,2020,03:44,0.6,09:52,3.3,15:58,0.5,22:05,3.4
3,Th,9,2020,04:20,0.5,10:27,3.3,16:33,0.5,22:38,3.5
4,Fr,9,2020,04:55,0.5,10:59,3.3,17:06,0.5,23:10,3.4
5,Sa,9,2020,05:27,0.5,11:31,3.3,17:39,0.6,23:41,3.3
6,Su,9,2020,06:00,0.6,12:03,3.2,18:11,0.7,,
7,Mo,9,2020,00:14,3.2,06:32,0.7,12:36,3.1,18:45,0.8
8,Tu,9,2020,00:49,3.1,07:08,0.8,13:12,3.0,19:24,1.0
9,We,9,2020,01:29,2.9,07:47,1.0,13:54,2.8,20:10,1.1
10,Th,9,2020,02:17,2.8,08:34,1.1,14:48,2.7,21:08,1.3
11,Fr,9,2020,03:16,2.7,09:34,1.2,15:58,2.6,22:20,1.3
12,Sa,9,2020,04:26,2.6,10:46,1.2,17:16,2.7,23:36,1.2
13,Su,9,2020,05:40,2.7,12:02,1.1,18:27,2.9,,
14,Mo,9,2020,00:43,1.1,06:47,2.9,13:07,0.9,19:25,3.1
15,Tu,9,2020,01:38,0.8,07:45,3.1,14:01,0.7,20:13,3.4
16,We,9,2020,02:27,0.5,08:35,3.4,14:48,0.4,20:58,3.6
17,Th,9,2020,03:13,0.3,09:21,3.6,15:33,0.2,21:42,3.8
18,Fr,9,2020,03:58,0.1,10:06,3.7,16:17,0.1,22:26,3.9
19,Sa,9,2020,04:43,0.0,10:50,3.8,17:01,0.1,23:10,3.9
20,Su,9,2020,05:28,0.0,11:35,3.8,17:46,0.2,23:56,3.7
21,Mo,9,2020,06:14,0.2,12:20,3.6,18:34,0.3,,
22,Tu,9,2020,00:44,3.5,07:02,0.4,13:09,3.4,19:25,0.6
23,We,9,2020,01:37,3.3,07:53,0.6,14:03,3.2,20:23,0.8
24,Th,9,2020,02:36,3.0,08:51,0.9,15:07,3.0,21:32,1.1
25,Fr,9,2020,03:46,2.8,10:00,1.1,16:25,2.8,22:51,1.1
26,Sa,9,2020,05:05,2.7,11:18,1.1,17:48,2.8,,
27,Su,9,2020,00:08,1.1,07:23,2.8,13:33,1.1,19:56,3.0
28,Mo,9,2020,02:11,1.0,08:25,2.9,14:32,0.9,20:47,3.1
29,Tu,9,2020,03:00,0.8,09:13,3.0,15:19,0.8,21:29,3.2
30,We,9,2020,03:42,0.7,09:52,3.2,15:58,0.6,22:04,3.3
1,Th,10,2020,04:19,0.6,10:28,3.3,16:33,0.5,22:37,3.4
2,Fr,10,2020,04:53,0.5,11:00,3.4,17:06,0.5,23:08,3.4
3,Sa,10,2020,05:25,0.5,11:30,3.4,17:38,0.5,23:39,3.4
4,Su,10,2020,05:56,0.5,12:00,3.4,18:09,0.6,,
5,Mo,10,2020,00:09,3.3,06:26,0.6,12:30,3.3,18:40,0.7
6,Tu,10,2020,00:40,3.2,06:58,0.7,13:02,3.2,19:14,0.8
7,We,10,2020,01:14,3.1,07:32,0.8,13:37,3.1,19:52,0.9
8,Th,10,2020,01:53,3.0,08:11,0.9,14:18,2.9,20:37,1.1
9,Fr,10,2020,02:40,2.8,08:57,1.1,15:11,2.8,21:36,1.2
10,Sa,10,2020,03:41,2.7,09:57,1.2,16:21,2.7,22:48,1.3
11,Su,10,2020,04:54,2.6,11:11,1.2,17:40,2.7,,
12,Mo,10,2020,00:03,1.2,06:10,2.7,12:28,1.1,18:53,2.9
13,Tu,10,2020,01:11,1.0,07:19,2.9,13:37,0.9,19:53,3.2
14,We,10,2020,02:09,0.7,08:19,3.2,14:33,0.6,20:44,3.4
15,Th,10,2020,03:00,0.4,09:10,3.4,15:23,0.4,21:31,3.7
16,Fr,10,2020,03:48,0.2,09:58,3.6,16:09,0.2,22:17,3.8
17,Sa,10,2020,04:34,0.0,10:43,3.8,16:55,0.1,23:02,3.9
18,Su,10,2020,05:20,0.0,11:28,3.8,17:41,0.1,23:48,3.8
19,Mo,10,2020,06:05,0.0,12:13,3.8,18:27,0.2,,
20,Tu,10,2020,00:35,3.7,06:52,0.2,12:59,3.6,19:15,0.4
21,We,10,2020,01:24,3.4,07:40,0.4,13:48,3.4,20:07,0.6
22,Th,10,2020,02:17,3.2,08:31,0.7,14:42,3.2,21:05,0.9
23,Fr,10,2020,03:17,2.9,09:28,0.9,15:45,3.0,22:12,1.1
24,Sa,10,2020,04:25,2.8,10:35,1.1,17:00,2.8,23:27,1.1
25,Su,10,2020,05:41,2.7,11:51,1.2,18:18,2.8,,
26,Mo,10,2020,00:40,1.1,06:56,2.7,13:05,1.1,19:24,2.9
27,Tu,10,2020,01:42,1.0,07:57,2.8,14:04,1.0,20:15,3.0
28,We,10,2020,02:31,0.9,08:44,3.0,14:50,0.9,20:57,3.1
29,Th,10,2020,03:12,0.7,09:24,3.1,15:30,0.7,21:33,3.2
30,Fr,10,2020,03:49,0.6,09:59,3.3,16:05,0.6,22:07,3.3
31,Sa,10,2020,04:23,0.6,10:32,3.3,16:39,0.6,22:39,3.3
1,Su,11,2020,04:55,0.5,11:03,3.4,17:11,0.6,23:10,3.3
2,Mo,11,2020,05:27,0.5,11:34,3.4,17:43,0.6,23:42,3.3
3,Tu,11,2020,05:59,0.6,12:05,3.3,18:16,0.7,,
4,We,11,2020,00:15,3.2,06:32,0.6,12:38,3.2,18:52,0.8
5,Th,11,2020,00:50,3.1,07:07,0.7,13:14,3.1,19:32,0.9
6,Fr,11,2020,01:31,3.0,07:47,0.9,13:56,3.0,20:19,1.0
7,Sa,11,2020,02:20,2.9,08:34,1.0,14:48,2.9,21:16,1.1
8,Su,11,2020,03:19,2.8,09:32,1.1,15:54,2.8,22:22,1.1
9,Mo,11,2020,04:27,2.7,10:41,1.1,17:07,2.9,23:31,1.0
10,Tu,11,2020,05:39,2.8,11:54,1.1,18:17,3.0,,
11,We,11,2020,00:37,0.9,06:48,2.9,13:03,0.9,19:19,3.2
12,Th,11,2020,01:37,0.7,07:49,3.2,14:04,0.7,20:14,3.4
13,Fr,11,2020,02:32,0.4,08:44,3.4,14:58,0.4,21:05,3.6
14,Sa,11,2020,03:23,0.2,09:35,3.6,15:47,0.3,21:54,3.7
15,Su,11,2020,04:12,0.1,10:23,3.7,16:36,0.2,22:42,3.7
16,Mo,11,2020,04:59,0.1,11:09,3.8,17:23,0.2,23:30,3.7
17,Tu,11,2020,05:46,0.1,11:56,3.7,18:11,0.3,,
18,We,11,2020,00:18,3.5,06:33,0.2,12:43,3.6,19:00,0.4
19,Th,11,2020,01:08,3.4,07:21,0.4,13:31,3.4,19:52,0.6
20,Fr,11,2020,02:00,3.1,08:10,0.7,14:23,3.2,20:46,0.8
21,Sa,11,2020,02:56,2.9,09:04,0.9,15:20,3.0,21:46,1.0
22,Su,11,2020,03:56,2.8,10:03,1.1,16:24,2.9,22:50,1.1
23,Mo,11,2020,05:02,2.7,11:10,1.2,17:32,2.8,23:55,1.1
24,Tu,11,2020,06:09,2.7,12:19,1.2,18:35,2.8,,
25,We,11,2020,00:56,1.1,07:12,2.8,13:22,1.1,19:30,2.9
26,Th,11,2020,01:49,1.0,08:05,2.9,14:13,1.0,20:17,3.0
27,Fr,11,2020,02:35,0.9,08:49,3.0,14:57,0.9,20:58,3.1
28,Sa,11,2020,03:16,0.8,09:29,3.1,15:36,0.8,21:35,3.2
29,Su,11,2020,03:54,0.7,10:05,3.2,16:13,0.7,22:11,3.2
30,Mo,11,2020,04:29,0.6,10:39,3.3,16:48,0.7,22:46,3.2
1,Tu,12,2020,05:04,0.6,11:13,3.3,17:23,0.7,23:21,3.2
2,We,12,2020,05:38,0.6,11:47,3.3,17:59,0.7,23:58,3.2
3,Th,12,2020,06:14,0.6,12:22,3.3,18:37,0.7,,
4,Fr,12,2020,00:37,3.1,06:52,0.7,13:00,3.2,19:20,0.8
5,Sa,12,2020,01:20,3.1,07:33,0.7,13:43,3.2,20:07,0.8
6,Su,12,2020,02:07,3.0,08:19,0.8,14:33,3.1,20:59,0.9
7,Mo,12,2020,03:01,2.9,09:12,0.9,15:31,3.0,21:57,0.9
8,Tu,12,2020,04:02,2.9,10:14,1.0,16:35,3.0,22:59,0.9
9,We,12,2020,05:07,2.9,11:21,1.0,17:41,3.1,,
10,Th,12,2020,00:03,0.8,06:14,3.0,12:30,0.9,18:45,3.2
11,Fr,12,2020,01:05,0.7,07:20,3.1,13:36,0.8,19:45,3.3
12,Sa,12,2020,02:05,0.5,08:20,3.3,14:35,0.6,20:41,3.4
13,Su,12,2020,03:01,0.4,09:16,3.5,15:30,0.4,21:35,3.5
14,Mo,12,2020,03:54,0.3,10:07,3.6,16:21,0.4,22:27,3.5
15,Tu,12,2020,04:44,0.2,10:56,3.7,17:10,0.3,23:17,3.5
16,We,12,2020,05:32,0.2,11:43,3.7,17:59,0.4,,
17,Th,12,2020,00:06,3.4,06:18,0.3,12:29,3.6,18:47,0.5
18,Fr,12,2020,00:54,3.3,07:04,0.5,13:14,3.4,19:35,0.6
19,Sa,12,2020,01:42,3.2,07:49,0.6,14:01,3.3,20:23,0.7
20,Su,12,2020,02:30,3.0,08:36,0.8,14:49,3.1,21:13,0.9
21,Mo,12,2020,03:20,2.9,09:26,1.0,15:41,3.0,22:05,1.0
22,Tu,12,2020,04:13,2.8,10:20,1.1,16:37,2.9,23:00,1.1
23,We,12,2020,05:10,2.7,11:21,1.2,17:35,2.8,23:57,1.1
24,Th,12,2020,06:12,2.7,12:26,1.2,18:33,2.8,,
25,Fr,12,2020,00:56,1.1,07:14,2.8,13:27,1.2,19:28,2.8
26,Sa,12,2020,01:51,1.0,08:10,2.9,14:20,1.1,20:18,2.9
27,Su,12,2020,02:41,0.9,08:58,3.0,15:06,1.0,21:04,3.0
28,Mo,12,2020,03:25,0.8,09:40,3.1,15:48,0.9,21:47,3.1
29,Tu,12,2020,04:06,0.7,10:19,3.2,16:28,0.8,22:27,3.1
30,We,12,2020,04:44,0.6,10:56,3.3,17:06,0.7,23:07,3.2
31,Th,12,2020,05:22,0.6,11:32,3.4,17:45,0.6,23:46,3.2
`;
