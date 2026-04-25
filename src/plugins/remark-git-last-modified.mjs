import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cache = new Map();
let hasWarnedAboutGitHistory = false;

function normalizeFilePath(file) {
	const rawPath = file?.path || file?.history?.[0];
	if (!rawPath) {
		return null;
	}
	return rawPath.startsWith("file://") ? fileURLToPath(rawPath) : rawPath;
}

function getGitLastModified(filePath, cwd) {
	const relativePath = path.relative(cwd, filePath);
	if (cache.has(relativePath)) {
		return cache.get(relativePath);
	}

	let timestamp = null;
	try {
		timestamp = execFileSync(
			"git",
			["log", "--follow", "-1", "--format=%cI", "--", relativePath],
			{ cwd, encoding: "utf8" },
		).trim();
	} catch {
		if (!hasWarnedAboutGitHistory) {
			hasWarnedAboutGitHistory = true;
			console.warn(
				"[remark-git-last-modified] Could not read Git history. If this happens during deployment, make sure the build uses a full Git clone instead of a shallow clone.",
			);
		}
	}

	cache.set(relativePath, timestamp);
	return timestamp;
}

export function remarkGitLastModified() {
	const cwd = process.cwd();
	const postsDir = path.join(cwd, "src/content/posts");

	return (_, file) => {
		const filePath = normalizeFilePath(file);
		const relativeFromPosts = filePath && path.relative(postsDir, filePath);
		if (
			!filePath ||
			relativeFromPosts.startsWith("..") ||
			path.isAbsolute(relativeFromPosts)
		) {
			return;
		}

		const timestamp = getGitLastModified(filePath, cwd);
		if (!timestamp) {
			return;
		}

		const lastModified = new Date(timestamp);
		file.data.astro ??= { frontmatter: {} };
		file.data.astro.frontmatter ??= {};
		file.data.astro.frontmatter.updated = lastModified;
		file.data.astro.frontmatter.lastModified = lastModified;
	};
}
