import { DatabaseSync } from "node:sqlite";
export const db = new DatabaseSync("db/responses.db");

export type DB_Response = {
    id: number;
    email: string;
    time: number;
    due: number;
    idCookie: string;
    answerCode: string;
    responseBlob: string;
};

export function insertDB_Response(data: { email: string, time: number, due: number, idCookie: string, answerCode: string, responseBlob: string }) {
    const stmt = db.prepare("INSERT INTO Responses (email, time, due, idCookie, answerCode, responseBlob) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(data.email, data.time, data.due, data.idCookie, data.answerCode, data.responseBlob);
}

export function selectDB_Response(): DB_Response[] {
    const stmt = db.prepare("SELECT * FROM Responses");
    return stmt.all() as DB_Response[];
}

export type DB_Preset = {
    id: number;
    name: string;
    blob: string;
}

export function insertDB_Preset(data: { name: string, blob: string }) {
    const stmt = db.prepare("INSERT INTO Presets (name, blob) VALUES (?, ?)");
    stmt.run(data.name, data.blob);
}

export function updateDB_Preset(data: { name: string, blob: string }, id: number) {
    const stmt = db.prepare("UPDATE Presets SET name = ?, blob = ? WHERE id = ?");
    stmt.run(data.name, data.blob, id);
}

export function selectDB_Preset(): DB_Preset[] {
    const stmt = db.prepare("SELECT * FROM Presets");
    return stmt.all() as DB_Preset[];
}

export function selectDB_PresetById(id: number): DB_Preset {
    const stmt = db.prepare("SELECT * FROM Presets WHERE id = ?");
    return stmt.get(id) as DB_Preset;
}