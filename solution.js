const Shipment = require('./shipment');
const filename = process.argv[2];
const lineEndingRegex = /\r\n|\n/;
const store = require('./store');
const parser = require('./parser');

function findPossibleBundles(shipment) {
    let nextShipmentCandidates = store.getValidOptions(shipment);
    let bundleCandidates = [];

    for (let index in nextShipmentCandidates) {
        let path = findSingleBundle(nextShipmentCandidates[index]);
        bundleCandidates.push(path);
    }

    return bundleCandidates;
}

function calculateLongestBundle(bundleCandidates, shipment) {
    bundleCandidates.push([]);
    let longestBundle = bundleCandidates.reduce((prev, curr) => prev.length > curr.length ? prev : curr); 

    longestBundle.unshift(shipment);
    return longestBundle;
}

function findSingleBundle(shipment) {

    let cachedBundle = store.getCachedPath(shipment);
    if (cachedBundle !== undefined) {
        return cachedBundle;
    }
    
    let bundleCandidates = findPossibleBundles(shipment)
    let longestBundle = calculateLongestBundle(bundleCandidates, shipment);

    store.udpateCachedPath(shipment, longestBundle);
    return longestBundle;
}

function removeBundleShipmentsFromStore(bundle) {
    for (let index in bundle) {
        shipmentToRemove = bundle[index];
        store.delete(shipmentToRemove)
    }
}

function findTodaysBundles(todaysShipmentList) {
    let todaysBundles = [];
    while (todaysShipmentList && todaysShipmentList.length > 0) {
        let longestBundle = findSingleBundle(todaysShipmentList[0]); // This method is destructive to the store so we keep pulling in the first item.
        removeBundleShipmentsFromStore(longestBundle);
        todaysBundles.push(longestBundle);
    }
    return todaysBundles;
}

//parse and Store
let shipments = parser.parseFile(filename, lineEndingRegex);
for (let i in shipments) {
    let item = shipments[i]; 
    store.addShipment(item);
}

//calculate Paths
let allBundles = [];
let day = 'M'
let todaysShipmentList = [];
while (todaysShipmentList !== undefined) {
    todaysShipmentList = store.days[day];
    allBundles = allBundles.concat(findTodaysBundles(todaysShipmentList));
    day = store.next[day];

}

//print
for (let i in allBundles) {
    let resultList = allBundles[i];
    let resultString = "";

    for (let j in resultList) {
        let shipment = resultList[j];
        resultString += shipment.id + " ";
    }

    console.log(i + " : " + resultString);
}