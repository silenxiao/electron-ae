var seed = 1;

/**
 * return a random number based on a seed
 * @param seed
 * @returns {number}
 */
function getNextValue() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / (233280.0);
}

function setSeed(_seed_) {
    seed = _seed_;
}


let ret = '';
let start = getNextValue();
Math.seedrandom(start);

console.log(Math.random())
return;
let i = 0;
while (true) {
    let end = getNextValue();
    ret = ret + ',' + end;
    console.log(i++, start, end);
    if (Math.abs(start - end) < 0.0000001)
        break;
}
//console.log(ret);
