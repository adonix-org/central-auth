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

import { BadRequest, BasicWorker, JsonResponse } from "@adonix.org/cloud-spark";
import { GithubAccessTokenResponse, GitHubPublicUser } from "../../types/github-oauth";
import { getTokenRequest, getUserRequest } from "./utils";

export class GitHubCallback extends BasicWorker {
    protected override async get(): Promise<Response> {
        const code = new URL(this.request.url).searchParams.get("code");
        if (!code) return this.response(BadRequest, "Missing code.");

        const tokenResp = await fetch(getTokenRequest(this.env, code));
        if (!tokenResp.ok) return tokenResp;

        const tokenData = await tokenResp.json<GithubAccessTokenResponse>();
        if (!tokenData.access_token)
            return this.response(BadRequest, "Token exchange returned no access token.");

        const userResp = await fetch(getUserRequest(tokenData.access_token));
        if (!userResp.ok) return userResp;

        const userData = await userResp.json<GitHubPublicUser>();
        return this.response(JsonResponse, userData);
    }
}
