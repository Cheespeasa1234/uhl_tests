import { DatabaseSync } from "node:sqlite";
import { Preset } from "./config.ts";

const db = new DatabaseSync("db/responses.db");

abstract class _Table {
    private id: number;

    constructor(id: number) {
        this.id = id;
    }

    getId(): number {
        return this.id;
    }

    // deno-lint-ignore no-unused-vars
    static selectById(id: number): _Table | undefined {
        throw new Error("Method not implemented.");
    }

    static select(): _Table[] {
        throw new Error("Method not implemented.");
    }

    // deno-lint-ignore no-explicit-any no-unused-vars
    static create(data: any): _Table | undefined {
        throw new Error("Method not implemented.");
    }

    abstract update(): void;
}

export type DB_Response_Data_Settings = {
    email: string;
    time: number;
    due: number;
    idCookie: string;
    answerCode: string;
    responseBlob: string;
    testId: number;
}

export class DB_Response extends _Table {
    email: string;
    time: number;
    due: number;
    idCookie: string;
    answerCode: string;
    responseBlob: string;
    testId: number;

    constructor (id: number, email: string, time: number, due: number, idCookie: string, answerCode: string, responseBlob: string, testId: number) {
        super(id);        
        this.email = email;
        this.time = time;
        this.due = due;
        this.idCookie = idCookie;
        this.answerCode = answerCode;
        this.responseBlob = responseBlob;
        this.testId = testId;
    }

    getSubmittedAsDate(): Date {
        return new Date(this.time);
    }

    getDueAsDate(): Date {
        return new Date(this.due);
    }
    
    static override create(data: DB_Response_Data_Settings): DB_Response {
        const stmt = db.prepare("INSERT INTO Responses (email, time, due, idCookie, answerCode, responseBlob, testId) VALUES (?, ?, ?, ?, ?, ?, ?)");
        stmt.run(data.email, data.time, data.due, data.idCookie, data.answerCode, data.responseBlob, data.testId);

        const getStmt = db.prepare("SELECT * FROM Responses WHERE email = ? AND time = ? AND due = ? AND idCookie = ? AND answerCode = ? AND responseBlob = ? AND testId = ?");
        return getStmt.get(data.email, data.time, data.due, data.idCookie, data.answerCode, data.responseBlob, data.testId) as DB_Response;
    }

    static override selectById(id: number): DB_Response {
        const stmt = db.prepare("SELECT * FROM Responses WHERE id = ?");
        return stmt.get(id) as DB_Response;
    }

    static override select(): DB_Response[] {
        const stmt = db.prepare("SELECT * FROM Responses");
        const objs = stmt.all() as DB_Response[];
        return objs;
    }

    override update(): void {
        const stmt = db.prepare("UPDATE Responses SET email = ?, time = ?, due = ?, idCookie = ?, answerCode = ?, responseBlob = ?, testId = ? WHERE id = ?");
        stmt.run(this.email, this.time, this.due, this.idCookie, this.answerCode, this.responseBlob, this.testId, this.getId());
    }
};

export type DB_Preset_Data_Settings = {
    name: string;
    blob: string;
}

export class DB_Preset extends _Table {
    name: string;
    blob: string;

    constructor (id: number, name: string, blob: string) {
        super(id);
        this.name = name;
        this.blob = blob;
    }

    update() {
        if (this.getId() === 0 || this.name === "DEFAULT") {
            throw new Error("Cannot update the default preset");
        }
        const stmt = db.prepare("UPDATE Presets SET name = ?, blob = ? WHERE id = ?");
        stmt.run(this.name, this.blob, this.getId());
    }

    static setBlob(o: DB_Preset, blob: string) {
        o.blob = blob;
    }

    static getBlobAsPreset(o: DB_Preset): Preset {
        return JSON.parse(o.blob);
    }

    static setBlobFromPreset(o: DB_Preset, preset: Preset) {
        o.blob = JSON.stringify(preset);
    }

    static override create(data: DB_Preset_Data_Settings): DB_Preset {
        const stmt = db.prepare("INSERT INTO Presets (name, blob) VALUES (?, ?)");
        stmt.run(data.name, data.blob);

        const getStmt = db.prepare("SELECT * FROM Presets WHERE name = ? AND blob = ?");
        const res: any = getStmt.get(data.name, data.blob);
        return new DB_Preset(res.id, res.name, res.blob) as DB_Preset;
    }

    static override select(): DB_Preset[] {
        const stmt = db.prepare("SELECT * FROM Presets");
        const objs: any[] = stmt.all() as DB_Preset[];
        return objs.map((o) => new DB_Preset(o.id, o.name, o.blob)) as DB_Preset[];
    }

    static override selectById(id: number): DB_Preset | undefined {
        const stmt = db.prepare("SELECT * FROM Presets WHERE id = ?");
        const res: any = stmt.get(id);
        if (res === undefined) return undefined;
        return new DB_Preset(res.id, res.name, res.blob) as DB_Preset;
    }

    static selectByName(name: string): DB_Preset | undefined {
        const stmt = db.prepare("SELECT * FROM Presets WHERE name = ?");
        const res: any = stmt.get(name);
        if (res === undefined) return undefined;
        return new DB_Preset(res.id, res.name, res.blob) as DB_Preset;
    }
}

export type DB_TestGroup_Data_Settings = {
    code: string;
    created: number;
    presetId: number;
    enabled: boolean;
}

export class DB_TestGroup extends _Table {

    code: string;
    created: number;
    presetId: number;
    enabled: number;
    
    constructor (id: number, code: string, created: number, presetId: number, enabled: number) {
        super(id);
        this.code = code;
        this.created = created;
        this.presetId = presetId;
        this.enabled = enabled;
    }

    static getCreatedAsDate(o: DB_TestGroup): Date {
        return new Date(o.created);
    }

    static getPreset(o: DB_TestGroup): DB_Preset | undefined {
        const p = DB_Preset.selectById(o.presetId);
        return p;
    }

    static getPresetName(o: DB_TestGroup): string | undefined {
        const p = DB_TestGroup.getPreset(o);
        if (p === undefined) return undefined;
        const name = p.name;
        return name;
    }

    static getEnabled(o: DB_TestGroup): boolean {
        return o.enabled === 1;
    }

    static override create(data: DB_TestGroup_Data_Settings): DB_TestGroup {
        const stmt = db.prepare("INSERT INTO Tests (code, created, presetId, enabled) VALUES (?, ?, ?, ?)");
        stmt.run(data.code, data.created, data.presetId, data.enabled ? 1 : 0);

        const getStmt = db.prepare("SELECT * FROM Tests WHERE code = ? AND created = ? AND presetId = ? AND enabled = ?");
        const res: any = getStmt.get(data.code, data.created, data.presetId, data.enabled ? 1 : 0);
        return new DB_TestGroup(res.id, res.code, res.created, res.presetId, res.enabled) as DB_TestGroup;
    }

    static override selectById(id: number): DB_TestGroup {
        const stmt = db.prepare("SELECT * FROM Tests WHERE id = ?");
        const res: any = stmt.get(id);
        return new DB_TestGroup(res.id, res.code, res.created, res.presetId, res.enabled) as DB_TestGroup;
    }

    static override select(): DB_TestGroup[] {
        const stmt = db.prepare("SELECT * FROM Tests");
        const objs: any[] = stmt.all();
        return objs.map((o) => new DB_TestGroup(o.id, o.code, o.created, o.presetId, o.enabled)) as DB_TestGroup[];
    }

    static selectByCode(code: string): DB_TestGroup {
        const stmt = db.prepare("SELECT * FROM Tests WHERE code = ?");
        const res: any = stmt.get(code);
        return new DB_TestGroup(res.id, res.code, res.created, res.presetId, res.enabled) as DB_TestGroup;
    }

    override update(): void {
        const stmt = db.prepare("UPDATE Tests SET code = ?, created = ?, presetId = ?, enabled = ? WHERE id = ?");
        stmt.run(this.code, this.created, this.presetId, this.enabled, this.getId());
    }
}