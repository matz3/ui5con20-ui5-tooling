const path = require("path");
const {resourceFactory} = require("@ui5/fs");
const {FileSystem, Memory} = require("@ui5/fs").adapters;
const {generateComponentPreload} = require("@ui5/builder").tasks;
const {normalizer} = require("@ui5/project");

async function getCoreDependencyReader() {
	const coreTree = await normalizer.generateProjectTree({
		cwd: path.dirname(require.resolve("@openui5/sap.ui.core/package.json"))
	});
	return (await resourceFactory.createCollectionsForTree(coreTree)).source;
}

async function main() {
	const projectName = "UI5con Node.js API Demo";

	const sources = new FileSystem({
		virBasePath: "/resources/ui5con20/demo/nodejs/",
		fsBasePath: "./webapp",
	});

	const dependencies = await getCoreDependencyReader();

	const target = new FileSystem({
		virBasePath: "/resources/ui5con20/demo/nodejs/",
		fsBasePath: "./dist"
	});

	const workspace = resourceFactory.createWorkspace({
		virBasePath: "/",
		writer: target,
		reader: sources,
		name: projectName
	});

	await generateComponentPreload({
		workspace,
		dependencies,
		options: {
			projectName,
			namespaces: [
				"ui5con20/demo/nodejs"
			]
		}
	});
}

main().catch((err) => {
	console.log(err);
	process.exit(1);
});
