/* global chrome */
import GitHubClient from "../data/index";

require("regenerator-runtime");

const {
  getToken,
  clearStorage,
  getRepositories,
  setBadge,
} = require("../data/extension");

const alarmName = "fetchPRs";
const delayInMinutes = 0;
const periodInMinutes = 1;

// Install logic
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Installed!");

  console.log("Creating alarm...");
  chrome.alarms.create(alarmName, {
    delayInMinutes,
    periodInMinutes,
  });
  console.log("Created!", await chrome.alarms.get(alarmName));

  await clearStorage();
});

// Periodically fetch pull requests and update the badge
chrome.alarms.onAlarm.addListener(async () => {
  console.log("--- Start ---");
  try {
    const token = await getToken();
    if (token === undefined) {
      console.log(
        "Personal access token not set. User must go to options to set personal access token."
      );
      return;
    }

    const repositories = await getRepositories();
    const client = new GitHubClient(token);

    let count = 0;
    const reposData = await client.getRepoData(repositories);
    reposData.forEach((repoData) => {
      count += repoData.pullRequests.length;
    });
    setBadge(count);
  } catch (e) {
    console.error(`There was an error in setting the badge`);
    console.error(e);
  }
  console.log("--- End ---");
});
