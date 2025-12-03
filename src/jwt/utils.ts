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

import { importJWK, SignJWT } from "jose";
import { JWTPayload } from "./interfaces";

export async function signJwt(
    env: Env,
    payload: JWTPayload,
    expiresInSeconds = 3600
): Promise<string> {
    const privateJwk = JSON.parse(env.PRIVATE_JWT_KEY);
    const privateKey = await importJWK(privateJwk, "ES256");

    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "ES256", kid: privateJwk.kid })
        .setIssuedAt(now)
        .setExpirationTime(now + expiresInSeconds)
        .setIssuer("https://auth.tybusby.com")
        .setAudience(payload.aud)
        .sign(privateKey);
}
