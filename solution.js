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
let pathCache = new Map();

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

    getKey(day, city) {
        return day + "_" + city;
    }
}

function cache(bundle, result) {
    let key = bundle.id;
    pathCache.set(key, undefined);
    pathCache.set(key, JSON.parse(JSON.stringify(result)));
}

function invalidate(bundle) {
    let list = pathCache.get(bundle.id);
    pathCache.set(bundle.id, undefined);

    for (let i in list) {
        invalidate(list[i]);
    }
}

function pullAndValidateCache(bundle) {
    let result = pathCache.get(bundle.id);

    for (let index in result) {
        let resultItem = result[index];
        let cachedBundle = pathCache.get(resultItem.id);
        if (cachedBundle === undefined) {
            // console.log("failed to find valid cachen for" + bundle.id + " at index " + index + ", " + resultItem.id);
            return undefined;
        }
    }

    return result !== undefined
        ? JSON.parse(JSON.stringify(result)) 
        : undefined;
}

function findPath(bundle) {

    let result = undefined;
    // console.log("|===================================>");
    let result2 = pullAndValidateCache(bundle);
    if (result2 !== undefined) {
        return result2;
    }
    
    let options = data[bundle.next];
    let paths = [];

    for (let index in options) {
        let option = options[index];
        let path = findPath(option);
        paths.push(path);
    }

    result = [];
    for (let index in paths) {
        result = paths[index].length >= result.length
            ? paths[index]
            : result;
    }
    result.unshift(bundle);

    cache(bundle, result);

    if (result2 !== undefined) {
        return result2;
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

    invalidate(bundle);
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

    // console.log(i + ": " + resultString);
    console.log(resultString);
}