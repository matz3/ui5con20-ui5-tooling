/*!
 * ${copyright}
 */

 // Provides a shim for the chartist library
sap.ui.loader.config({
	shim: {
		"ui5con20/library/thirdparty/chartist/chartist": {
			amd: true,
			exports: "Chartist"
		}
	}
});

// Provides control ui5con20.library.Chart
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/HTML",
	"./ChartRenderer",
	"./thirdparty/chartist/chartist",
	"./library"
], function(Control, HTML, ChartRenderer, Chartist /*, library*/) {
	"use strict";

	var Chart = Control.extend("ui5con20.library.Chart", {
		metadata: {
			properties: {
				"data": {
					type: "object"
				},
				"options": {
					type: "object"
				},
				"type": {
					type: "string",
					defaultValue: "Line"
				}
			},
			aggregations: {
				"_html": {
					type: "sap.ui.core.HTML",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				chartInitialized: {}
			}
		},
		init: function() {
			var sHtmlId = this.getId() + "-html";
			this.setAggregation("_html", new HTML(sHtmlId, {
				content: "<div id=\"" + sHtmlId + "\"></div>"
			}));
		},
		onAfterRendering: function() {
			if (!this._chartistChart) {
				this._chartistChart = new Chartist[this.getType()](this.getAggregation("_html").getDomRef(), this.getData(), this.getOptions());
				this.fireChartInitialized({
					chart: this._chartistChart
				});
			}
		},
		setData: function(data) {
			this.setProperty("data", data, /* bSuppressInvalidate */ true);
			if (this._chartistChart) {
				this._chartistChart.update(data || {});
			}
			return this;
		},
		setOptions: function(options, bSuppressInvalidate) {
			this.setProperty("options", options, bSuppressInvalidate);
			if (this._chartistChart) {
				this._chartistChart.detach();
			}
			this._chartistChart = new Chartist[this.getType()](this.getAggregation("_html").getDomRef(), this.getData(), this.getOptions());
		},
		setType: function(type, bSuppressInvalidate) {
			this.setProperty("type", type, bSuppressInvalidate);
			if (this._chartistChart) {
				this._chartistChart.detach();
			}
			this._chartistChart = new Chartist[this.getType()](this.getAggregation("_html").getDomRef(), this.getData(), this.getOptions());
		},
		renderer: ChartRenderer
	});

	 return Chart;
});
