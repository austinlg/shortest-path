let pathCache = new Map();

exports.put = function put(bundle, result) {
    let key = bundle.id;
    pathCache.set(key, undefined);
    pathCache.set(key, {...result})//JSON.parse(JSON.stringify(result)));
}

exports.invalidate =  function(bundle) {
    let list = pathCache.get(bundle.id);
    pathCache.set(bundle.id, undefined);

    for (let i in list) {
        this.invalidate(list[i]);
    }
}

exports.get = function(bundle) {
    let result = pathCache.get(bundle.id);

    for (let index in result) {
        let resultItem = result[index];
        let cachedBundle = pathCache.get(resultItem.id);
        if (cachedBundle === undefined) {
            return undefined;
        }
    }

    return result || undefined;//result !== undefined
}