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

import { BadRequest, BasicWorker, StatusCodes } from "@adonix.org/cloud-spark";
import { GITHUB_OAUTH_AUTHORIZE_URL } from "./constants";
import { AuthState, encodeState } from "./state";

export class GitHubLogin extends BasicWorker {
    protected override async get(): Promise<Response> {
        const target = new URL(this.request.url).searchParams.get("target");
        if (!target) return this.response(BadRequest, "Missing redirect target URL.");

        const state: AuthState = {
            redirect: target,
        };

        const redirect = new URL(GITHUB_OAUTH_AUTHORIZE_URL);
        redirect.searchParams.set("client_id", this.env.GITHUB_CLIENT_ID);
        redirect.searchParams.set("redirect_uri", this.env.GITHUB_REDIRECT_URI);
        redirect.searchParams.set("scope", "read:user user:email");
        redirect.searchParams.set("state", encodeState(state));
        return Response.redirect(redirect.toString(), StatusCodes.MOVED_TEMPORARILY);
    }
}
