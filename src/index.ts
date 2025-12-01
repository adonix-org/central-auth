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

import { BadRequest, GET, JsonResponse, RouteWorker, StatusCodes } from "@adonix.org/cloud-spark";
import { GithubAccessTokenResponse, GitHubPublicUser } from "../types/github-oauth";
import {
    GITHUB_API_USER_URL,
    GITHUB_OAUTH_ACCESS_TOKEN_URL,
    GITHUB_OAUTH_AUTHORIZE_URL,
} from "./github/constants";

class GitHubOAuth extends RouteWorker {
    protected override init(): void {
        // this.route(GET, "/github/login", this.login);
        // this.route(GET, "/github/callback", this.callback);
    }

    protected async callback(): Promise<Response> {
        const code = new URL(this.request.url).searchParams.get("code");
        if (!code) return this.response(BadRequest, "Missing code.");

        const tokenResp = await fetch(GITHUB_OAUTH_ACCESS_TOKEN_URL, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: this.env.GITHUB_CLIENT_ID,
                client_secret: this.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: this.env.GITHUB_REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResp.json<GithubAccessTokenResponse>();
        console.log(tokenData);

        if (!tokenData.access_token) return this.response(BadRequest, "Token exchange failed");

        const userResp = await fetch(GITHUB_API_USER_URL, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                "User-Agent": "Cloudflare-Worker",
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!userResp.ok) {
            throw new Error(`GitHub API error: ${userResp.status} ${userResp.statusText}`);
        }

        const user = await userResp.json<GitHubPublicUser>();
        return this.response(JsonResponse, { user, token: tokenData.access_token });
    }
}

export default GitHubOAuth.ignite();
