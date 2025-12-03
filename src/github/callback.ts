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

import { BadRequest, BasicWorker } from "@adonix.org/cloud-spark";
import { getPayload, getToken, getUser } from "./utils";
import { getErrorResponse } from "./error";
import { decodeState } from "./state";
import { JwtResponse } from "./response";
import { signJwt } from "../jwt/utils";

export class GitHubCallback extends BasicWorker {
    protected override async get(): Promise<Response> {
        const url = new URL(this.request.url);
        const code = url.searchParams.get("code");

        if (!code) return this.response(BadRequest, "Missing code.");

        try {
            const user = await getUser(await getToken(this.env, code));
            const state = decodeState(url);
            const payload = { ...getPayload(state, user) };
            const jwt = await signJwt(this.env, payload, state.expire);
            return await this.response(JwtResponse, state, jwt);
        } catch (error) {
            return await getErrorResponse(error);
        }
    }
}
