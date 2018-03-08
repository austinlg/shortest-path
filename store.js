const cache = require('./cache');

exports.next = {
    'M': 'T',
    'T': 'W',
    'W': 'R',
    'R': 'F'
}

exports.days = {
    'M': [],
    'T': [],
    'W': [],
    'R': [],
    'F': []
}

exports.startkeyMap = {};

exports.addShipment = (item) => {
    if (this.startkeyMap[item.key] == undefined) {
        this.startkeyMap[item.key] = [item];
    } else {
        this.startkeyMap[item.key].push(item);
    }

    this.days[item.day].push(item);
}

exports.delete = (bundle) => {
    let options = this.startkeyMap[bundle.key];
    let index = options.map(e => {return e.id}).indexOf(bundle.id);
    options.splice(index, 1);
    this.startkeyMap[bundle.key] = options;

    options = this.days[bundle.day];
    index = options.map(e => {return e.id}).indexOf(bundle.id);
    options.splice(index, 1);
    this.days[bundle.day] = options;

    cache.invalidate(bundle);
}

exports.getValidOptions = (bundle) => {
    return this.startkeyMap[bundle.next];
}

exports.getCachedPath = (bundle) => {
    let result = cache.get(bundle.id);

    for (let index in result) {
        let resultItem = result[index];
        let cachedBundle = pathCache.get(resultItem.id);
        if (cachedBundle === undefined) {
            // console.log("failed to find valid cachen for" + bundle.id + " at index " + index + ", " + resultItem.id);
            return undefined;
        }
    }

    return result || undefined;
}

exports.udpateCachedPath = (bundle, result) => {
    cache.put(bundle, result);
}
