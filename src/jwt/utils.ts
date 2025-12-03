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

import { importJWK, JWTPayload, SignJWT } from "jose";
import { DEFAULT_JWT_EXPIRE, JWK_ALG } from "./constants";
import { CentralJWT } from "./interfaces";

export async function signJwt(
    env: Env,
    payload: CentralJWT,
    expiresInSeconds: string | number | null
): Promise<string> {
    const privateJwk = JSON.parse(env.PRIVATE_JWT_KEY);
    const privateKey = await importJWK(privateJwk, JWK_ALG);

    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: JWK_ALG, kid: privateJwk.kid })
        .setIssuedAt(now)
        .setExpirationTime(now + getExpireSeconds(expiresInSeconds))
        .setIssuer("https://auth.adonix.org")
        .setAudience(payload.aud)
        .sign(privateKey);
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
