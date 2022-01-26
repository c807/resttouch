import Dexie, { Table } from 'dexie';

export class RTLocalDB extends Dexie {
    constructor() {
        super('rt_local_db');
        this.version(1).stores({
            
        });
    }
}

export const db = new RTLocalDB();