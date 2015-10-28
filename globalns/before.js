window.globalsBefore = {};

for (var gobalVal in window) {
    window.globalsBefore[gobalVal] = window[gobalVal];
}
