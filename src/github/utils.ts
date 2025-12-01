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

import { GET, POST } from "@adonix.org/cloud-spark";
import { GithubAccessTokenRequest } from "../../types/github-oauth";
import {
    CENTRAL_AUTH_USER_AGENT,
    GITHUB_API_USER_URL,
    GITHUB_OAUTH_ACCESS_TOKEN_URL,
} from "./constants";

export function getTokenRequest(env: Env, code: string): Request {
    const headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
    });

    const body: GithubAccessTokenRequest = {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_REDIRECT_URI,
    };

    const init: RequestInit = {
        method: POST,
        headers,
        body: JSON.stringify(body),
    };

    return new Request(GITHUB_OAUTH_ACCESS_TOKEN_URL, init);
}

export function getUserRequest(token: string): Request {
    const headers = new Headers({
        Authorization: `Bearer ${token}`,
        "User-Agent": CENTRAL_AUTH_USER_AGENT,
        Accept: "application/vnd.github.v3+json",
    });

    return new Request(GITHUB_API_USER_URL, {
        method: GET,
        headers,
    });
}
