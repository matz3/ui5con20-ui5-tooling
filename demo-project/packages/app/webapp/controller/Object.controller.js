sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("ui5con20.app.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			oViewModel.setProperty("/delay", iOriginalBusyDelay);

			this.initChart();
		},

		initChart: function() {
			var oChart = this.byId("chart");
			oChart.attachChartInitialized(function(oEvent) {
				var chart = oEvent.getParameter("chart");
				var dur = 1000;
				var easing = Chartist.Svg.Easing.easeOutQuint;
				var animationDone;
				function draw(data) {
					var begin;
					if (data.type === "line" || data.type === "area") {
						begin = 100 * data.index;
						data.element.animate({
							d: {
								begin: begin,
								dur: dur,
								from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
								to: data.path.clone().stringify(),
								easing: easing
							}
						});
					} else if (data.type === "point") {
						begin = 100 * data.seriesIndex;
						var animation = {
							begin: begin,
							dur: dur,
							from: data.axisY.chartRect.height(),
							to: data.y,
							easing: easing
						};
						data.element.animate({
							// Need to use shallow clone as the object is being modified by the animate function
							y1: Object.assign({}, animation),
							y2: Object.assign({}, animation)
						});
					}
					if (animationDone) {
						clearTimeout(animationDone);
					}
					animationDone = setTimeout(removeDrawHandler, begin + dur);
				}
				function removeDrawHandler() {
					chart.off("draw", draw);
				}

				chart.on("draw", draw);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;
			this._bindView("/Repositories/" + sObjectId);
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this)
				}
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.repositoryName;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
			oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
			oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectId, location.href]));
		}

	});

});
