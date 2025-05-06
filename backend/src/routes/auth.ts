// @deno-types="npm:@types/express@4.17.15"
import express, { Request, Response, NextFunction } from "npm:express";
import bodyParser// @ts-types="body-parser"
, { json } from "npm:body-parser";
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { logDebug, logInfo, logWarning } from "../lib/logger.ts";
import { HCST_OAUTH_CLIENT_ID, HCST_OAUTH_CLIENT_SECRET, HCST_OAUTH_REDIRECT_URI } from "../lib/env.ts";
import { HTTP } from "../lib/http.ts";

export const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser());

