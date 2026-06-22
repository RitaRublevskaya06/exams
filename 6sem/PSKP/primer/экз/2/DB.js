const ee = require('events');
const util = require('util');

let data = [
    { "id": 1, "name": "John", "bday": "1990-01-01" },
    { "id": 2, "name": "Smith", "bday": "1985-05-05" },
    { "id": 3, "name": "Mark", "bday": "1992-11-11" },
    { "id": 4, "name": "Bob", "bday": "1902-01-11" }
];


function DB()
{
this.commitData = null;
    this.commit = () => {
        this.commitData = JSON.parse(JSON.stringify(data));
        return this.commitData;
    }
    this.select = () => {
        return data;
    }
    this.insert = (item) =>{
        if (!item.name || !item.bday) {
            return { error: 'Имя и дата рождения обязательны.' };
        }
        const newItem = {
            id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
            name: item.name,
            bday: item.bday
        };
        data.push(newItem);
        return newItem;
    }
    this.update = (updatedItem) => {
        const index = data.findIndex(item => item.id === updatedItem.id);
        if (index === -1) {
            return { error: 'Строка с указанным ID не найдена.' };
        }
        data[index].name = updatedItem.name || data[index].name;
        data[index].bday = updatedItem.bday || data[index].bday;
        return data[index];
    }

    this.delete = (id) => {
        const index = data.findIndex(item => item.id == id);
        if (index === -1) {
            return { error: 'Строка с указанным ID не найдена.' };
        }
        return data.splice(index, 1)[0];
    }
}


util.inherits(DB, ee.EventEmitter);

exports.DB = DB;