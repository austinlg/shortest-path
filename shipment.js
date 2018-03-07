const {next} = require('./store');

module.exports = class Shipment {
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