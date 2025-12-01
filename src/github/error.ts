/*
 * Copyright (C) 2025 Ty Busby
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpError } from "@adonix.org/cloud-spark";
import { GitHubOAuthError } from "../../types/github-oauth";

export class GitHubError extends Error {
    constructor(public status: number, msg: string) {
        super(msg);
        this.name = "GitHubError";
    }
}

export function getErrorMessage(value: unknown, fallback: string): string {
    if (isGitHubOAuthError(value)) {
        return value.error_description ?? value.error;
    }
    return fallback;
}

export async function getError(response: Response, fallback: string): Promise<GitHubError> {
    const text = await response.text();
    if (!text) return new GitHubError(response.status, fallback);
    try {
        const json = JSON.parse(text);
        return new GitHubError(response.status, getErrorMessage(json, fallback));
    } catch (error) {
        return new GitHubError(response.status, fallback);
    }
}

export function getErrorResponse(error: unknown): Promise<Response> {
    if (error instanceof GitHubError) {
        return new HttpError(error.status, error.message).response();
    }
    throw error;
}

function isGitHubOAuthError(value: unknown): value is GitHubOAuthError {
    if (typeof value !== "object" || value === null) return false;

    const o = value as Record<string, unknown>;

    return (
        typeof o.error === "string" &&
        (o.error_description === undefined || typeof o.error_description === "string") &&
        (o.error_uri === undefined || typeof o.error_uri === "string")
    );
}
