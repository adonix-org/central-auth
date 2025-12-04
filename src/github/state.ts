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

import { Time } from "@adonix.org/cloud-spark";
import { base64url } from "jose";
import { DEFAULT_JWT_EXPIRE } from "../jwt/constants";

const STATE_TIMEOUT_SECONDS = 15 * Time.Minute;

export interface AuthState {
    origin: string;
    successPath: string;
    errorPath: string;
    app: string;
    expire: number;
    issued: number;
}

export function createState(request: Request): AuthState {
    const url = new URL(request.url);

    const target = url.searchParams.get("target");
    if (!target) throw new Error("Missing required 'target' parameter.");

    const app = url.searchParams.get("app");
    if (!app) throw new Error("Missing required `app` parameter.");

    const errorPath = url.searchParams.get("errorPath") ?? "/error";
    if (!isSafePath(errorPath)) throw new Error("Invalid 'error' path.");

    const targetUrl = new URL(target);
    if (!isSafePath(targetUrl.pathname)) throw new Error("Invalid 'target' path.");

    return {
        app,
        origin: targetUrl.origin,
        successPath: targetUrl.pathname + targetUrl.search,
        errorPath,
        issued: Math.floor(Date.now() / 1000),
        expire: getExpireSeconds(url.searchParams.get("expire")),
    };
}

export function isTimedOut(state: AuthState): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now > state.issued + STATE_TIMEOUT_SECONDS;
}

export function getExpireSeconds(seconds: string | number | null): number {
    if (!seconds) return DEFAULT_JWT_EXPIRE;

    let n: number;
    if (typeof seconds === "number") {
        n = seconds;
    } else {
        n = Number(seconds);
    }
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_JWT_EXPIRE;
}

export async function encodeState(state: AuthState, secret: string): Promise<string> {
    const json = JSON.stringify(state);
    const sig = await hmacSign(json, secret);
    const payload = base64url.encode(new TextEncoder().encode(json));
    return `${payload}.${sig}`;
}

export async function decodeState(signed: string, secret: string): Promise<AuthState | null> {
    const [payloadB64, sig] = signed.split(".");
    if (!payloadB64 || !sig) return null;

    const jsonBytes = base64url.decode(payloadB64);
    const json = new TextDecoder().decode(jsonBytes);

    const valid = await hmacVerify(json, sig, secret);
    if (!valid) return null;

    return JSON.parse(json) as AuthState;
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

function isSafePath(path: string): boolean {
    if (!path) return false;
    if (!path.startsWith("/")) return false;
    if (path.includes("..") || path.includes("//") || path.includes(".")) return false;

    const pattern = /^\/([a-zA-Z]+(\/[a-zA-Z]+)*)?$/;
    return pattern.test(path);
}
