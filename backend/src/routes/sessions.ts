import { Quiz } from "../lang/quiz/quiz.ts";

export class Session {
    sessionId: string;
    email: string;
    name: string;
    data?: {
        quiz: Quiz,
        timeStarted: Date,
        timeToEnd?: Date,
    };

    constructor (sessionId: string, email: string, name: string) {
        this.sessionId = sessionId;
        this.email = email;
        this.name = name;
        this.data = undefined;
    }
}

let sessionList: Array<Session> = [];

export function addSession(s: Session) {
    // Find and remove any duplicates
    sessionList = sessionList.filter(session => session.sessionId !== s.sessionId && session.email !== s.email);
    sessionList.push(s);
}

export function getSessionBySid(sid: string): Session | undefined {
    return sessionList.find(session => session.sessionId === sid);
}

export function removeSession(s: Session) {
    sessionList.filter(session => session.sessionId !== s.sessionId);
}