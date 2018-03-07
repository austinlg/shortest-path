const path = require('path');
const fs = require('fs');

const filename = process.argv[2];
let data = {};
let days = {
    'M': [],
    'T': [],
    'W': [],
    'R': [],
    'F': []
}

let arr = fs.readFileSync(filename).toString().split(/\r\n|\n/);

let next = {
    '_': 'M',
    'M': 'T',
    'T': 'W',
    'W': 'R',
    'R': 'F',
    'F': 'S'
}

class Bundle {
    constructor(id, from, to, day) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.day = day;
        this.key = this.getKey(day, from);
        this.next = this.getKey(next[day], to);
        this.items = [id];
    }

    prepend(bundle) {
        this.key = this.getKey(bundle.day, bundle.from);
        this.items.slice(0, bundle.id);
    }

    append(bundle) {
        this.next = this.getKey(next[bundle[day]], bundle.to);
        this.items.push(bundle.id);
    }

    getKey(day, city) {
        return day + "_" + city;
    }
}

function findPath(bundle) {
    let options = data[bundle.next];
    let paths = [];

    for (let index in options) {
        let option = options[index];
        let path = findPath(option);
        path.unshift(bundle);
        paths.push(path);
    }

    let result = [bundle];
    for (let index in paths) {
        result = paths[index].length > result.length
            ? paths[index]
            : result;
    }

    return result;
}

function remove(bundle) {
    let options = data[bundle.key];
    let index = options.map(e => {return e.id}).indexOf(bundle.id);
    options.splice(index, 1);
    data[bundle.key] = options;

    options = days[bundle.day];
    index = options.map(e => {return e.id}).indexOf(bundle.id);
    options.splice(index, 1);
    days[bundle.day] = options;
}


for (let i in arr) {
    let fields = arr[i].split(" ");
    let item = new Bundle(fields[0], fields[1], fields[2], fields[3]);

    if (item.day === undefined) {
        continue;
    }
    
    if (data[item.key] == undefined) {
        data[item.key] = [item];
    } else {
        data[item.key].push(item);
    }

    days[item.day].push(item);
}

// console.log(days);

let results = [];
let day = 'M'
let currentDayList = [];
while (currentDayList != undefined) {
    currentDayList = days[day];
        
    while (currentDayList && currentDayList.length > 0) {
        let bundle = currentDayList[0];
        let result = findPath(bundle);

        for (let index in result) {
            bundleToRemove = result[index];
            remove(bundleToRemove)
        }

        results.push(result);
    }

    day = next[day];
}

for (let i in results) {
    let resultList = results[i];
    let resultString = "";

    for (let j in resultList) {
        let bundle = resultList[j];
        resultString += bundle.id + " ";
    }

    console.log(resultString);
}