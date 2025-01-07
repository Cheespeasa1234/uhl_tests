// @deno-types="npm:@types/express"
import express, { Router, Request, Response } from "npm:express";

export type API_Function = (req: Request, res: Response) => void;

export function route(constructor: Function)

export function post(route: string) {
    return function (target: API_Function, ...vargs: any[]) {
        // router.post(route);
        console.log(target)
        vargs.forEach(console.log)
    }
}

export class API {
    private router: Router;

    constructor () {
        this.router = express.Router();
    }

    getRouter() {
        return this.router;
    }
}