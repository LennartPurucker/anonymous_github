import config from "../config";
import GitHubBase from "./source/GitHubBase";
import { isText } from "istextorbinary";
import { basename } from "path";
import { Transform } from "stream";
import { Readable } from "stream";
import AnonymizedFile from "./AnonymizedFile";

const urlRegex =
  /<?\b((https?|ftp|file):\/\/)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]\b\/?>?/g;

export function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export function isTextFile(filePath: string, content?: Buffer) {
  const filename = basename(filePath);
  const extensions = filename.split(".").reverse();
  const extension = extensions[0].toLowerCase();
  if (config.additionalExtensions.includes(extension)) {
    return true;
  }
  if (isText(filename)) {
    return true;
  }
  return isText(filename, content);
}

export class AnonymizeTransformer extends Transform {
  constructor(private readonly file: AnonymizedFile) {
    super();
  }

  _transform(chunk: Buffer, encoding: string, callback: () => void) {
    if (isTextFile(this.file.anonymizedPath, chunk)) {
      chunk = Buffer.from(
        anonymizeContent(chunk.toString(), this.file.repository)
      );
    }
    this.push(chunk);
    callback();
  }
}

interface Anonymizationptions {
  repoId?: string;
  source?: {};
  options: {
    terms: string[];
    image: boolean;
    link: boolean;
    pageSource?: {
      branch: string;
      path: string;
    };
  };
}

export function anonymizeContent(
  content: string,
  repository: Anonymizationptions
) {
  if (repository.options?.image === false) {
    // remove image in markdown
    content = content.replace(
      /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g,
      ""
    );
  }

  if (!repository.options?.link) {
    // remove all links
    content = content.replace(urlRegex, config.ANONYMIZATION_MASK);
  }

  if (repository.source instanceof GitHubBase) {
    content = content.replace(
      new RegExp(
        `https://github.com/${
          repository.source.githubRepository.fullName
        }/blob/${repository.source.branch?.name || "main"}\\b`,
        "gi"
      ),
      `https://${config.APP_HOSTNAME}/r/${repository.repoId}`
    );
    content = content.replace(
      new RegExp(
        `https://github.com/${
          repository.source.githubRepository.fullName
        }/tree/${(repository.source as GitHubBase).branch?.name || "main"}\\b`,
        "gi"
      ),
      `https://${config.APP_HOSTNAME}/r/${repository.repoId}`
    );
    content = content.replace(
      new RegExp(
        `https://github.com/${repository.source.githubRepository.fullName}`,
        "gi"
      ),
      `https://${config.APP_HOSTNAME}/r/${repository.repoId}`
    );
  }

  const terms = repository.options.terms || [];
  for (let i = 0; i < terms.length; i++) {
    let term = terms[i];
    if (term.trim() == "") {
      continue;
    }
    try {
      new RegExp(term, "gi");
    } catch {
      // escape regex characters
      term = term.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    }
    // remove whole url if it contains the term
    content = content.replace(urlRegex, (match) => {
      if (new RegExp(`\\b${term}\\b`, "gi").test(match))
        return config.ANONYMIZATION_MASK + "-" + (i + 1);
      return match;
    });

    // remove the term in the text
    content = content.replace(
      new RegExp(`\\b${term}\\b`, "gi"),
      config.ANONYMIZATION_MASK + "-" + (i + 1)
    );
  }
  return content;
}

export function anonymizePath(path: string, terms: string[]) {
  for (let i = 0; i < terms.length; i++) {
    let term = terms[i];
    if (term.trim() == "") {
      continue;
    }
    try {
      new RegExp(term, "gi");
    } catch {
      // escape regex characters
      term = term.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    }
    path = path.replace(
      new RegExp(term, "gi"),
      config.ANONYMIZATION_MASK + "-" + (i + 1)
    );
  }
  return path;
}
