// @deno-types="npm:@types/express"
import express, { Router, Request, Response } from "npm:express";
import { API, post } from "./api.ts";

class TestAPI {
    @post("new-test")
    newTest(req: Request, res: Response): void {
        res.send("Hello World");
    }
}