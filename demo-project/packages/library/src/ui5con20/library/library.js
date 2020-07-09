/*!
 * ${copyright}
 */

/**
 * Initialization Code of ui5con20.library
 */
sap.ui.define([
	"sap/ui/core/library" // library dependency
], function() {
	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "ui5con20.library",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		controls: [
			"ui5con20.library.Chart"
		]
	});

	return ui5con20.library;
});
