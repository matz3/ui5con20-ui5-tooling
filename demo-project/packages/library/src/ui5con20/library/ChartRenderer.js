/*!
 * ${copyright}
 */

// Provides default renderer for controlsap.m.Avatar
sap.ui.define(["./library"], function (/* library */) {
	"use strict";

	var ChartRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oChart an object representation of the control that should be rendered
	 */
	ChartRenderer.render = function (oRm, oChart) {
		oRm.openStart("div", oChart);
		oRm.openEnd();
		oRm.renderControl(oChart.getAggregation("_html"));
		oRm.close("div");
	};

	return ChartRenderer;
});
