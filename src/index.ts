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
import { GITHUB_OAUTH_AUTHORIZE_URL } from "./constants";

class GitHubOAuth extends RouteWorker {
    protected override init(): void {
        this.route(GET, "/github/login", this.login);
        this.route(GET, "/github/callback", this.callback);
    }

    protected async login(): Promise<Response> {
        const url = new URL(GITHUB_OAUTH_AUTHORIZE_URL);
        url.searchParams.set("client_id", this.env.GITHUB_CLIENT_ID);
        url.searchParams.set("redirect_uri", this.env.GITHUB_REDIRECT_URI);
        url.searchParams.set("scope", "read:user user:email");
        return Response.redirect(url.toString(), StatusCodes.MOVED_TEMPORARILY);
    }

    protected async callback(): Promise<Response> {
        const url = new URL(this.request.url);
        const code = url.searchParams.get("code");
        if (!code) return this.response(BadRequest, "Missing code.");

        // Step 2: Exchange code for access token
        const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
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

        // Step 3: Fetch user info
        const userResp = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                "User-Agent": "Cloudflare-Worker", // REQUIRED by GitHub API
                Accept: "application/vnd.github.v3+json", // optional, but recommended
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
