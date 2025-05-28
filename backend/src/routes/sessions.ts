import { Quiz } from "../lang/quiz/quiz.ts";
import { Submission } from "../lib/db.ts";
import { logInfo } from "../lib/logger.ts";
import { getSpanMs } from "../lib/util.ts";

export class Session {
    static SESSION_TIME_LIMIT: number = getSpanMs({ days: 1 });

    accessToken: string;
    refreshToken: string;
    expiresIn: number;

    signedIn: boolean;
    sessionStarted: Date;

    sessionId: string;
    email: string;
    name: string;
    quizEndTimeout?: number;
    activeQuiz?: {
        quiz: Quiz,
        timeStarted: Date,
        timeToEnd: Date,
    };
    quizAnswers: any;

    constructor (access_token: string, refresh_token: string, expires_in: number, sessionId: string, email: string, name: string) {
        // Set data
        this.accessToken = access_token;
        this.refreshToken = refresh_token;
        this.expiresIn = expires_in;
        this.signedIn = true;
        this.sessionStarted = new Date();

        this.sessionId = sessionId;
        this.email = email;
        this.name = name;
        this.activeQuiz = undefined;
    }

    /**
     * Takes the answers and saves them in the session, to be submitted
     */
    syncQuiz(answers: any) {
        if (this.getExpired()) {
            this.signOut();
            throw new Error("Session expired");
        }

        if (this.activeQuiz === undefined) {
            throw new Error(`Session has no quiz to submit`);
        }

        if (!Array.isArray(answers)) {
            throw new Error(`Answers must be an array`);
        }
        
        // make sure they sent the right amount of answers
        if (answers.length !== this.activeQuiz.quiz.questions.length) {
            throw new Error(`not enough answers sent. recieved ${answers} but requires ${this.activeQuiz.quiz.questions.length} many`);
        }

        logInfo("sessions", `Syncing answers for ${this.email}`);

        this.quizAnswers = answers;
    }

    startQuiz(quiz: Quiz, timeStarted: Date, timeToEnd: Date) {
        if (this.getExpired()) {
            this.signOut();
            throw new Error("Session expired");
        }

        logInfo("sessions", `Starting quiz for ${this.email}`);

        const newData = {
            quiz,
            timeStarted,
            timeToEnd
        };

        this.activeQuiz = newData;

        // At the end of the quiz, end the test and submit it
        if (this.quizEndTimeout !== undefined) {
            // Delete the timeout
            clearTimeout(this.quizEndTimeout);
            
            // Figure out how long to make it
            const length = timeToEnd.getTime() - timeStarted.getTime();
            this.quizEndTimeout = setTimeout(() => {
                this.submitQuiz();
            }, length);
        }
    }

    submitQuiz() {
        if (!this.activeQuiz) {
            throw new Error("No quiz to submit");
        }

        logInfo("sessions", `Submitting quiz by ${this.email}`);

        const responseBlob = {
            answers: this.quizAnswers,
            quiz: this.activeQuiz.quiz,
        };
    
        // Log the answers to the user's identity
        const timeStart = this.activeQuiz.timeStarted;
        const timeSubmitted = new Date();
        const due = this.activeQuiz.timeToEnd;
        
        const data = {
            email: this.email,
            responseBlob: JSON.stringify(responseBlob),
            testId: responseBlob.quiz.testGroup.id,
            timeStart: timeStart.toISOString(),
            timeSubmitted: timeSubmitted.toISOString(),
            timeDue: due.toISOString(),
        }
    
        Submission.create(data);

        this.activeQuiz = undefined;
        this.quizAnswers = undefined;
        clearTimeout(this.quizEndTimeout);
    }

    getExpired(): boolean {
        if (!this.signedIn) return false;
        const now = new Date();
        const diff = now.getTime() - this.sessionStarted.getTime();
        return diff > Session.SESSION_TIME_LIMIT;
    }

    /**
     * Resets the session time limit
     */
    refreshExpiry() {
        logInfo("sessions", `Refreshing expiry for ${this.email}`);
        this.sessionStarted = new Date();
    }

    signOut() {
        logInfo("sessions", `Signing out ${this.email}`);
        clearTimeout(this.quizEndTimeout);
        this.signedIn = false;
    }

    getPreviewData() {
        return {
            email: this.email,
            name: this.name,
            data: this.activeQuiz,
            quizAnswers: this.quizAnswers,
        }
    }
}

let sessionList: Array<Session> = [];

export function addSession(s: Session) {
    // Find and remove any duplicates
    sessionList = sessionList.filter(session => session.sessionId !== s.sessionId && session.email !== s.email);
    sessionList.push(s);
}

/**
 * Finds the session with the given sessionID in the list.
 * If the session exists, and is not expired, it will refresh if told to, and will return the session.
 * If the session does not exist or is expired, it will be deleted and will return undefined.
 * @param sid The session ID string
 * @param refresh Whether or not to refresh the login if it is found
 * @returns The session if it is found, undefined if not found or expired
 */
export function getSessionBySid(sid: string, refresh: boolean = true): Session | undefined {
    const session = sessionList.find(session => session.sessionId === sid);
    const sessionExists = session !== undefined;
    if (sessionExists) {
        const sessionExpired = session.getExpired();
        if (!sessionExpired) {
            if (refresh) {
                session.refreshExpiry();
                logInfo("sessions", `Refreshed login for ${session.email}`);
            }
            return session;
        } else {
            removeSession(session);
            return undefined;
        }
    } else {
        return session;
    }
}

/**
 * Removes a session from the list and signs it out.
 * @param s The session to remove
 */
export function removeSession(s: Session) {
    sessionList = sessionList.filter(session => {
        const safe = session.sessionId !== s.sessionId;
        if (!safe) {
            session.signOut();
            logInfo("sessions", `Removing session ${session.email}`);
        } else {
            logInfo("sessions", `Skipped removal of session ${session.email}`);
        }
        return safe;
    });
}