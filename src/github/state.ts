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

import {
    assertCentralAuthState,
    CENTRAL_AUTH_QUERY,
    CentralAuthState,
} from "@adonix.org/central-auth-types";
import { base64url } from "jose";

export function createState(request: Request): CentralAuthState {
    const url = new URL(request.url);

    const param = url.searchParams.get(CENTRAL_AUTH_QUERY);
    if (!param) throw new Error(`Missing required '${CENTRAL_AUTH_QUERY}' parameter.`);

    const bytes = base64url.decode(param);
    const query = JSON.parse(new TextDecoder().decode(bytes)) as CentralAuthState;
    assertCentralAuthState(query);

    return {
        app: query.app,
        origin: query.origin,
        targetPath: query.targetPath,
        errorPath: query.errorPath,
        loginPath: query.loginPath,
        expire: query.expire,
    };
}

export async function encodeState(state: CentralAuthState, secret: string): Promise<string> {
    const json = JSON.stringify(state);
    const sig = await hmacSign(json, secret);
    const payload = base64url.encode(new TextEncoder().encode(json));
    return `${payload}.${sig}`;
}

export async function decodeState(
    signed: string,
    secret: string
): Promise<CentralAuthState | null> {
    const [payloadB64, sig] = signed.split(".");
    if (!payloadB64 || !sig) return null;

    const jsonBytes = base64url.decode(payloadB64);
    const json = new TextDecoder().decode(jsonBytes);

    const valid = await hmacVerify(json, sig, secret);
    if (!valid) return null;

    return JSON.parse(json) as CentralAuthState;
}

async function hmacSign(message: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    return base64url.encode(new Uint8Array(sig));
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
    const expected = await hmacSign(message, secret);
    return expected === signature;
}
