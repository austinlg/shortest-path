const fs = require('fs');
const Shipment = require('./shipment');

exports.parseFile = (filename, delimeter) => {
    let lines = fs.readFileSync(filename).toString().split(delimeter);
    let shipments = [];
    for (let i in lines) {
        let lineFields = lines[i].split(" ");
        let item = new Shipment(lineFields[0], lineFields[1], lineFields[2], lineFields[3]);
        
        if (!validateshipment(item)) {
            continue;
        }
        
        shipments.push(item);
    }

    return shipments;
}

function validateshipment(item) {
    // return item.day !== undefined && item.from !== undefined && item.to !== undefined;
    return item.day !== undefined
}