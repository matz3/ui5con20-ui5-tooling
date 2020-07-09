module.exports = function() {
	const request = require("request");
	const parseurl = require("parseurl");
	const path = require("path");

	const gitHubBaseUrl = "https://api.github.com";
	const npmBaseUrl = "https://api.npmjs.org";

	require('dotenv').config({
		path: path.join(__dirname, "..", '.env')
	});

	if (!process.env.UI5CON_DEMO_GITHUB_USER || !process.env.UI5CON_DEMO_GITHUB_TOKEN) {
		throw new Error("Missing GitHub credentials");
	}

	function formatMonth(monthId) {
		const date = new Date(monthId + "-01");
		return (date.getUTCMonth() + 1) + "." + date.getUTCFullYear();
	}

	function formatChartDataMonthly(dailyDownloads) {
		const months = {};

		const lastIdx = dailyDownloads.length - 1;
		dailyDownloads.forEach((report, idx) => {
			const monthId = report.day.substring(0, 7);

			if (idx === lastIdx) {
				// Remove latest month as data is not complete yet
				delete months[monthId];
				return;
			}
			if (!months[monthId]) {
				months[monthId] = 0;
			}

			months[monthId] += report.downloads;
		});

		const dataPoints = Object.values(months);

		const labels = Object.keys(months).map(formatMonth);

		return {
			labels,
			series: [dataPoints]
		};
	}

	const gitHubClient = request.defaults({
		baseUrl: gitHubBaseUrl,
		json: true,
		headers: {
			"Accept": "application/vnd.github.v3+json; charset=UTF-8",
			"Content-Type": "application/json",
			"User-Agent": "ui5con-demo-project"
		},
		auth: {
			user: process.env.UI5CON_DEMO_GITHUB_USER,
			password: process.env.UI5CON_DEMO_GITHUB_TOKEN
		},
		gzip: true
	});

	const gitHubCache = {};
	function fetchGitHubData(repositoryName) {
		if (gitHubCache[repositoryName]) {
			return gitHubCache[repositoryName];
		}
		return gitHubCache[repositoryName] = new Promise((resolve, reject) => {
			gitHubClient.get({
				uri: "/repos" + repositoryName
			}, function(err, httpRes, data) {
				if (err) {
					console.log("GitHub API repo fetch failed:");
					console.error(err);
					reject(err);
					return;
				}

				if (httpRes.statusCode !== 200) {
					console.log("GitHub API repo fetch failed:");
					console.error(httpRes.statusCode + ": " + data);
					reject(httpRes.statusCode + ": " + data);
					return;
				}

				resolve({
					"stargazers_count": data.stargazers_count,
					"html_url": data.html_url,
					"full_name": data.full_name
				});
			});
		});
	}

	const npmClient = request.defaults({
		baseUrl: npmBaseUrl,
		json: true,
		headers: {
			"cache": "force-cache", // Force using cache as data should not change anymore
			"referrerPolicy": "no-referrer"
		},
		gzip: true
	});

	const npmCache = {};
	async function fetchNpmData(repositoryName) {
		const npmName = repositoryName.replace("/SAP/ui5-", "@ui5/");
		if (npmName === "@ui5/tooling") {
			return {};
		}

		if (npmCache[npmName]) {
			return npmCache[npmName];
		}
		const nowDateString = new Date().toISOString().split("T")[0];
		return npmCache[npmName] = Promise.all([
			new Promise((resolve, reject) => {
				npmClient.get({
					uri: `/downloads/point/2016-01-01:${nowDateString}/${npmName}`
				}, function(err, httpRes, data) {
					if (err) {
						console.log("npm Registry API fetch failed:");
						console.error(err);
						reject(err);
						return;
					}

					if (httpRes.statusCode !== 200) {
						console.log("npm Registry API fetch failed:");
						console.error(httpRes.statusCode + ": " + data);
						reject(httpRes.statusCode + ": " + data);
						return;
					}
					resolve(data);
				});
			}),
			new Promise((resolve, reject) => {
				npmClient.get({
					uri: `/downloads/range/2016-01-01:${nowDateString}/${npmName}`
				}, function(err, httpRes, data) {
					if (err) {
						console.log("npm Registry API fetch failed:");
						console.error(err);
						reject(err);
						return;
					}

					if (httpRes.statusCode !== 200) {
						console.log("npm Registry API fetch failed:");
						console.error(httpRes.statusCode + ": " + data);
						reject(httpRes.statusCode + ": " + data);
						return;
					}
					resolve(formatChartDataMonthly(data.downloads));
				});
			}),
		]).then(([total, range]) => {
			return {
				downloadsTotal: total.downloads,
				downloadsRange: range
			}
		});
	}

	return function (req, res, next) {
		let {pathname} = parseurl(req);
		pathname = decodeURIComponent(pathname);

		// Try to read a corresponding markdown file
		Promise.all([fetchGitHubData(pathname), fetchNpmData(pathname)])
			.then(([gitHubData, npmData]) => {
				res.json({
					"stars": gitHubData.stargazers_count,
					"html_url": gitHubData.html_url,
					"repositoryName": gitHubData.full_name,
					"downloadsTotal": npmData.downloadsTotal,
					"downloadsRange": npmData.downloadsRange
				});

			}, function(err) {
				next(err);
			});
	}
};
