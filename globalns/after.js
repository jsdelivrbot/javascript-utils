setTimeout(function() {
    console.log('Globals added:');
    var count = 0;
    for (var gobalVal in window) {
        if (window.globalsBefore[gobalVal] === undefined) {
            console.log('\t ' + gobalVal);
            count++;
        }
    }
    if (count === 0) {
        console.log('\t (none)');
    }
}, 1000);
