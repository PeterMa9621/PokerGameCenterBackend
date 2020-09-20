const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://mjy:mjy159357@cluster0.mqk7e.mongodb.net/PokerGameCenter?retryWrites=true&w=majority";

const databaseName = 'PokerGameCenter';

class MongoDatabase {
    static allowConstructor = false;
    static instance = null;

    constructor() {
        if(MongoDatabase.allowConstructor) {
            this.connect().then(() => {
                console.log("Database connected successfully!");
            });
            MongoDatabase.allowConstructor = false;
            return;
        }
        throw "Please use getInstance to get a instance of this class";
    }

    static getInstance() {
        this.allowConstructor = true;
        if(this.instance === null)
            this.instance = new MongoDatabase();
        return this.instance;
    }

    client = null;

    async connect() {
        if(!this.client) {
            this.client = await MongoClient.connect(uri, {
                useNewUrlParser: true ,
                useUnifiedTopology: true
            });
        }
        return this.client;
    }

    async find(condition = {}, collectionName) {
        const client = await this.connect();
        const collection = await client.db(databaseName).collection(collectionName);
        return collection.find(condition).toArray();
    }

    async findOne(condition = {}, collectionName) {
        const client = await this.connect();
        const collection = await client.db(databaseName).collection(collectionName);
        return collection.findOne(condition);
    }

    async insert(doc, collectionName, uniqueKeys=null) {
        const client = await this.connect();
        const collection = await client.db(databaseName).collection(collectionName);

        let passUniqueCheck = true;
        if(uniqueKeys != null) {
            const result = await collection.find(uniqueKeys).toArray();
            if(result.length !== 0)
                passUniqueCheck = false;
        }

        if(passUniqueCheck) {
            // It is unique
            try{
                var obj = await collection.insertOne(doc);
            } catch (e) {
                return false;
            }
            return obj.ops[0];
        } else {
            // It is not unique
            return false;
        }
    }

    async delete(condition, collectionName) {
        const client = await this.connect();
        const collection = await client.db(databaseName).collection(collectionName);
        return collection.deleteOne(condition);
    }

    async update(condition, newValues, collectionName) {
        const client = await this.connect();
        const collection = await client.db(databaseName).collection(collectionName);
        return collection.updateOne(condition, { $set: newValues });
    }

    close() {
        return new Promise((resolve, reject) => {
            try {
                this.client.close().then(()=>{resolve()});
            } catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = MongoDatabase;