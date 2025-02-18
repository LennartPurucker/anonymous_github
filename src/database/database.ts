import mongoose, { ConnectOptions } from "mongoose";
import Repository from "../Repository";
import config from "../../config";
import AnonymizedRepositoryModel from "./anonymizedRepositories/anonymizedRepositories.model";
import AnonymousError from "../AnonymousError";
import AnonymizedPullRequestModel from "./anonymizedPullRequests/anonymizedPullRequests.model";
import PullRequest from "../PullRequest";

const MONGO_URL = `mongodb://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOSTNAME}:27017/`;

export const database = mongoose.connection;

export let isConnected = false;

export async function connect() {
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URL + "production", {
    authSource: "admin",
    appName: "Anonymous GitHub Server",
    compressors: "zlib",
  } as ConnectOptions);
  isConnected = true;

  return database;
}

export async function getRepository(
  repoId: string,
  opts: {
    includeFiles: boolean;
  } = {
    includeFiles: true,
  }
) {
  if (!repoId || repoId == "undefined") {
    throw new AnonymousError("repo_not_found", {
      object: repoId,
      httpStatus: 404,
    });
  }
  const project: any = {};
  if (!opts.includeFiles) {
    project.originalFiles = 0;
  }
  const data = await AnonymizedRepositoryModel.findOne(
    { repoId },
    project
  ).collation({
    locale: "en",
    strength: 2,
  });
  if (!data)
    throw new AnonymousError("repo_not_found", {
      object: repoId,
      httpStatus: 404,
    });
  return new Repository(data);
}
export async function getPullRequest(pullRequestId: string) {
  if (!pullRequestId || pullRequestId == "undefined") {
    throw new AnonymousError("pull_request_not_found", {
      object: pullRequestId,
      httpStatus: 404,
    });
  }
  const data = await AnonymizedPullRequestModel.findOne({
    pullRequestId,
  });
  if (!data)
    throw new AnonymousError("pull_request_not_found", {
      object: pullRequestId,
      httpStatus: 404,
    });
  return new PullRequest(data);
}
