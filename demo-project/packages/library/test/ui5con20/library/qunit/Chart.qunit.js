/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["ui5con20/library/Chart"], function(Chart) {

		QUnit.test("Chart", function(assert) {
			var oChart = new Chart({
				data: {
					series: [
						[ { value: 1 }, { value: 2 } ],
						[ { value: 3 }, { value: 4 } ]
					]
				},
				options: {
					fullWidth: true,
					chartPadding: {
						top: 20,
						right: 50,
						bottom: 30,
						left: 10
					},
					showArea: true,
					showPoint: true,
					axisX: {
						labelOffset: {
							x: -10,
							y: 10
						}
					},
					axisY: {
						onlyInteger: true
					}
				}
			});

			oChart.placeAt("qunit-fixture");

			assert.ok(true);
		})

		QUnit.start();
	});
});
