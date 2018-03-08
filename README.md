# Install

Node version: v9.4.0

## Run Solution
```node solution.js <file_name>```

For Example

```node solution.js tests/personal.txt```

## valdiate
```node validate.js "node solution.js" tests/*```

# Approach
## Basic Approach
My approach was to optimize for longer bundles. 
I would prefer longer bundles to shorter ones. 
The longer the Bundle is the better.

### Data Structures
1. **NextKey Map:** stores arrays of shipments based on their start day and city for easy lookup during the bundle calculation.
1. **Day Map:** Stores array of bundles by their departure date.

### Finding the Longest Bundle
In order to determine the best bundle. You need to look at each of your next options and trace out the possible paths. Given, that we can only move in one direction as time marches ceaselessly forward this makes recursing through this stage ideal.

Start with shipments leaving on the earliest possible date, given by the Day Map, and calculate the longest bundles for that day. Once you have finished with that day continue to the next day until we run out of shipments.

Each Shipment is a node in a directed Graph. At each point you need to find the possible options that you can move to and see what their longest bundle is. By recursively calling you will perform a Depth first search until there are no options. For progressing. In this case that would be Friday at the latest. 

Once you have all possible Bundles. You take the Bundle with the longest length and discard the rest.

### Updating the data.
I chose a destructive methodology for this program because once we have logged the bundle. We no longer need that data. So I'd rather get rid of it.

## Optimizations
Given that we are spawning some unknown number of recursions it occurred to me that many of these calculated longest bundles are cacheable. It's possible that when we were calculating the longest bundles for shipments leaving on a Monday we calculated the longest bundle for some shipment leaving on Wednesday that did not end up being used. Therefore if we cache those results we can save the need of recalculating the bundle and continuing down the DFS recursion.

One pitfall here is that just because we didn't use the shipment where that bundle starts does not mean that we did not use some of the shipments in the bundle we originally calculated there are two approaches to handling this.
1. **Eager:** Where we actively see the Shipments we use and invalidate caches entries that include these packages
1. **Lazy:** We check if an entry is invalid as we pull the record.

The Lazy approach is a simpler to construct (Shipment -> longestBundle[]) and maintain as lazily checking invalidation is constant time in this scenario as the bundle sizes are limited to 5 so we'll check at most 5 packages. In general the time complexity is O(n) which is on par to how you'd be able to do it eagerly, but would require additional data structures to create needed references.

All in all with my personal Test file, which is about 2000 shipments randomly generated so the bundles are shorter, caching cut the runtime but about 60%. for the provideed thousand_packages file I was seeing about a 30% decrease in  runtime.