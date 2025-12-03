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

import { GET, RouteTable } from "@adonix.org/cloud-spark";
import { JWKS } from "./interfaces";
import { PublicJWK } from "./public";

export const PUBLIC_JWKS_ROUTES: RouteTable = [[GET, "/.well-known/jwks.json", PublicJWK]];

export const JWK_ALG = "ES256";

/**
 * Always append new public keys to the array.
 */
export const PUBLIC_JWT_KEYS: JWKS = {
    keys: [
        {
            kty: "EC",
            x: "Tcmopl_61RMJ8-uCAxL-bakgQIshM5-EHNwj3iHYk1o",
            y: "sCJSL_EPqlEGpKC-IV9FYHpgSbvHyzrJreZM9uVtHxU",
            crv: "P-256",
            kid: "1VyyCQqEEHV93c-HG0URRoP0zkPKOCyB7pZMQ9i5NMw",
            use: "sig",
        },
    ],
};
