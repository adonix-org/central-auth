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
import { AuthState } from "./state";

export class Redirect extends WorkerResponse {
    constructor(location: string) {
        super();
        this.status = StatusCodes.MOVED_TEMPORARILY;
        this.statusText = "Found";

        this.setHeader("Location", location);
    }
}

export class JwtResponse extends Redirect {
    constructor(state: AuthState, token: string) {
        const url = new URL(state.successPath, state.origin);
        url.searchParams.set("adonix_auth", token);
        super(url.toString());
    }
}

export class ErrorRedirect extends Redirect {
    constructor(state: AuthState, error: unknown) {
        const url = new URL(state.errorPath, state.origin);
        url.searchParams.set("adonix_auth_error", String(error));
        url.searchParams.set("target", state.origin + state.successPath);
        super(url.toString());
    }
}
