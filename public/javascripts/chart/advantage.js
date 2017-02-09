lichess.advantageChart = function(data) {
  lichess.loadScript('/assets/javascripts/chart/common.js').done(function() {
    lichess.loadScript('/assets/javascripts/chart/division.js').done(function() {
      lichess.chartCommon('highchart').done(function() {

        lichess.advantageChart.update = function(d) {
          $elem.highcharts().series[0].setData(makeSerieData(d));
        };

        var $elem = $('#adv_chart');

        var makeSerieData = function(d) {
          return d.treeParts.slice(1).map(function(node) {
            if (node.eval && node.eval.mate) {
              var cp = node.eval.mate > 0 ? Infinity : -Infinity;
            } else if (node.san.indexOf('#') > 0) {
              var cp = node.ply % 2 === 1 ? Infinity : -Infinity;
              if (d.game.variant.key === 'antichess') cp = -cp;
            } else if (node.eval && typeof node.eval.cp !== 'undefined') {
              var cp = node.eval.cp;
            } else return {
              y: null
            };

            var turn = Math.floor((node.ply - 1) / 2) + 1;
            var dots = node.ply % 2 === 1 ? '.' : '...';
            return {
              name: turn + dots + ' ' + node.san,
              y: 2 / (1 + Math.exp(-0.004 * cp)) - 1
            };
          });
        };

        var disabled = {
          enabled: false
        };
        var noText = {
          text: null
        };
        var serieData = makeSerieData(data);
        var chart = $elem.highcharts({
          credits: disabled,
          legend: disabled,
          series: [{
            name: 'Advantage',
            data: serieData
          }],
          chart: {
            type: 'area',
            spacing: [3, 0, 3, 0],
            animation: false
          },
          plotOptions: {
            series: {
              animation: false
            },
            area: {
              fillColor: Highcharts.theme.lichess.area.white,
              negativeFillColor: Highcharts.theme.lichess.area.black,
              threshold: 0,
              lineWidth: 1,
              color: '#d85000',
              allowPointSelect: true,
              cursor: 'pointer',
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              events: {
                click: function(event) {
                  if (event.point) {
                    event.point.select();
                    lichess.analyse.jumpToIndex(event.point.x);
                  }
                }
              },
              marker: {
                radius: 1,
                states: {
                  hover: {
                    radius: 4,
                    lineColor: '#3893E8'
                  },
                  select: {
                    radius: 4,
                    lineColor: '#3893E8'
                  }
                }
              }
            }
          },
          tooltip: {
            pointFormatter: function(format) {
              format = format.replace('{series.name}', 'Advantage');
              var eval = data.treeParts[this.x + 1].eval;
              if (!eval) return;
              else if (eval.mate) return format.replace('{point.y}', '#' + eval.mate);
              else if (typeof eval.cp !== 'undefined') {
                var e = Math.max(Math.min(Math.round(eval.cp / 10) / 10, 99), -99);
                if (e > 0) e = '+' + e;
                return format.replace('{point.y}', e);
              }
            }
          },
          title: noText,
          xAxis: {
            title: noText,
            labels: disabled,
            lineWidth: 0,
            tickWidth: 0,
            plotLines: lichess.divisionLines(data.game.division)
          },
          yAxis: {
            title: noText,
            min: -1.1,
            max: 1.1,
            startOnTick: false,
            endOnTick: false,
            labels: disabled,
            lineWidth: 1,
            gridLineWidth: 0,
            plotLines: [{
              color: Highcharts.theme.lichess.text.weak,
              width: 1,
              value: 0
            }]
          }
        });
        lichess.analyse.onChange();
      });
    });
  });
};
