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

import { StatusCodes, WorkerResponse } from "@adonix.org/cloud-spark";
import { CENTRAL_AUTH_QUERY, CentralAuthState } from "@adonix.org/central-auth-types";
import { base64url } from "jose";

export class Redirect extends WorkerResponse {
    constructor(location: string) {
        super();
        this.status = StatusCodes.MOVED_TEMPORARILY;
        this.statusText = "Found";

        this.setHeader("Location", location);
    }
}

export class JwtResponse extends Redirect {
    constructor(state: CentralAuthState, token: string) {
        const url = new URL(state.targetPath, state.origin);
        url.searchParams.set("adonix_auth", token);
        super(url.toString());
    }
}

export class LoginFailed extends Redirect {
    constructor(state: CentralAuthState) {
        const url = new URL(state.loginPath, state.origin);
        url.searchParams.set("adonix_auth_error", "Invalid login.");
        url.searchParams.set(CENTRAL_AUTH_QUERY, base64url.encode(JSON.stringify(state)));
        super(url.toString());
    }
}

export class ErrorRedirect extends Redirect {
    constructor(state: CentralAuthState, error: unknown) {
        const url = new URL(state.errorPath, state.origin);
        url.searchParams.set("adonix_auth_error", String(error));
        url.searchParams.set(CENTRAL_AUTH_QUERY, base64url.encode(JSON.stringify(state)));
        super(url.toString());
    }
}
