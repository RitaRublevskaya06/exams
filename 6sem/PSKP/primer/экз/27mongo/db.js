const { MongoClient } = require('mongodb');

async function run() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const database = client.db('BSTU');

        const pulpits = database.collection('pulpit');
        await pulpits.insertMany([
            { pulpits: "МиСиТ", pulpits_name: "Информационных систем и технологий", faculty: "МТ" },
            { pulpits: "ПИ", pulpits_name: "Программный инжиниринг", faculty: "ИЗ" }
        ]);

        const faculties = database.collection('faculty');
        await faculties.insertMany([
            { faculty: "ИЗ", faculty_name: "Инженерно-экономический" },
            { faculty: "ИТ", faculty_name: "Информационных технологий" }
        ]);

        console.log("Коллекции созданы и данные вставлены успешно.");
    } finally {
        await client.close();
    }
}

run().catch(console.dir);