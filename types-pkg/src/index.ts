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

/**
 * Central query paramter in the URL.
 */
export const CENTRAL_AUTH_QUERY = "_adonix_ca";

export const CENTRAL_AUTH_SESSION = "_adonix_session";

/**
 * Encode in base64 and send as query paramter.
 */
export interface CentralAuthState {
    app: string;
    origin: string;
    targetPath: string;
    loginPath: string;
    errorPath: string;
    expire: number;
}

/**
 * Asserts that `value` is a valid CentralAuthQuery.
 * Throws errors for invalid properties.
 */
export function assertCentralAuthQuery(value: unknown): asserts value is CentralAuthState {
    if (typeof value !== "object" || value === null) {
        throw new Error(`Invlid value type.`);
    }
    const v = value as Record<string, unknown>;
    if (typeof v.app !== "string" || v.app.trim() === "") {
        throw new Error("Invalid app.");
    }
    if (typeof v.origin !== "string" || !v.origin.trim().toLowerCase().startsWith("https://")) {
        throw new Error(`Invalid origin.`);
    }
    if (typeof v.expire !== "number" || !Number.isFinite(v.expire) || v.expire <= 0) {
        throw new Error("Invalid expire.");
    }

    assertSafePath(v.origin, v.targetPath);
    assertSafePath(v.origin, v.loginPath);
    assertSafePath(v.origin, v.errorPath);
}

export function assertSafePath(origin: string, path: unknown): asserts path is string {
    if (typeof path !== "string") {
        throw new Error(`Invalid path.`);
    }

    const base = new URL(origin);
    const resolved = new URL(path, origin);
    if (base.origin !== resolved.origin) {
        throw new Error("Invalid redirect.");
    }
}
