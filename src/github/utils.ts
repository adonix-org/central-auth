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

import { GET, POST, StatusCodes } from "@adonix.org/cloud-spark";
import {
    GithubAccessTokenRequest,
    GithubAccessTokenResponse,
    GitHubPublicUser,
} from "../../types/github-oauth";
import {
    CENTRAL_AUTH_USER_AGENT,
    GITHUB_API_USER_URL,
    GITHUB_OAUTH_ACCESS_TOKEN_URL,
} from "./constants";
import { getError, getErrorMessage, GitHubError } from "./error";
import { CentralJWT } from "../jwt/interfaces";
import { CentralAuthState } from "@adonix.org/central-auth-types";

export async function getToken(env: Env, code: string): Promise<GithubAccessTokenResponse> {
    const response = await fetch(getTokenRequest(env, code));
    if (!response.ok) throw getError(response, "Error fetching token.");

    const json = await response.json<GithubAccessTokenResponse>();
    if (!json.access_token) {
        throw new GitHubError(
            StatusCodes.BAD_REQUEST,
            getErrorMessage(json, "Token exchange returned no access token.")
        );
    }

    return json;
}

export function getPayload(state: CentralAuthState, user: GitHubPublicUser): CentralJWT {
    return {
        aud: state.app,
        sub: `github:${user.id}`,
        email: user.email,
        name: user.name,
        picture: user.avatar_url,
        provider: "github",
    };
}

export async function getUser(token: GithubAccessTokenResponse): Promise<GitHubPublicUser> {
    const response = await fetch(getUserRequest(token.access_token));
    if (!response.ok) throw getError(response, "Error fetching user.");

    const json = await response.json<GitHubPublicUser>();
    if (!json.id) {
        throw new GitHubError(
            StatusCodes.BAD_REQUEST,
            getErrorMessage(json, "User data missing ID.")
        );
    }

    return json;
}

function getTokenRequest(env: Env, code: string): Request {
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

function getUserRequest(token: string): Request {
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
