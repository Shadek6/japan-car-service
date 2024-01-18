import { MongoClient } from "mongodb"
import NodeCache from 'node-cache'
import { PayoutProps } from "../types/PayoutProps";

const cache = new NodeCache();
export class DatabaseController 
{
    connect_string: string
    db: string
    client: MongoClient

    constructor(connect_string: string, db: string) {
        this.connect_string = connect_string
        this.db = db
        this.client = new MongoClient(connect_string)
    }

    public async fetchDatabaseData(collection: string, filter?: object) 
    {
        if(filter) 
        {
            if(cache.has(JSON.stringify(filter))) return (cache.get(JSON.stringify(filter)) as PayoutProps)
            let data = await this.client.db(this.db).collection(collection).findOne(filter) as PayoutProps | null
            if(!data) return null;

            data = {...data, bonus_percentage: 0.5}
            cache.set(JSON.stringify(filter), data, 180)
            return data;
        }

        return await this.client.db(this.db).collection(collection).findOne()
    }

    public async addDatabaseData(collection: string, data: object) 
    {
        return await this.client.db(this.db).collection(collection).insertOne(data)
    }

    public async deleteDatabaseData(collection: string, filter: object) {
        return await this.client.db(this.db).collection(collection).deleteMany(filter);
    }
}