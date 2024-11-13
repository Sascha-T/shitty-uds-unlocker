import clipboard from 'clipboardy';
import readline from 'readline';

/*
Copyright 2021, Ludwig V. <https://github.com/ludwig-v>
Original algorithm by Wouter Bokslag & Jason F. <https://github.com/prototux>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License at <http://www.gnu.org/licenses/> for
more details.

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/

function transform(data, sec) {
    if (data > 32767) {
        data = -(32768 - (data % 32768));
    }

    let result = ((((data % sec[0]) * sec[2]) & 0xFFFFFFF) - ((((data / sec[0]) & 0xFFFFFFFF) * sec[1]) & 0xFFFFFFF) & 0xFFFFFFFF);

    if (result < 0)
        result += (sec[0] * sec[2]) + sec[1];

    return (result & 0xFFFF);
}

function hex(number) {
    if(number < 0) number = 0xFFFFFFFF + number + 1;
    return number.toString(16)
}

function getKey(seedTXT, appKeyTXT = "0000") {
    let seed = [seedTXT.substring(0, 2), seedTXT.substring(2, 4), seedTXT.substring(4, 6), seedTXT.substring(6, 8)];
    let appKey = [appKeyTXT.substring(0, 2), appKeyTXT.substring(2, 4)];

    // Hardcoded secrets
    let sec_1 = [0xB2, 0x3F, 0xAA];
    let sec_2 = [0xB1, 0x02, 0xAB];
    let res_msb = transform(parseInt(appKey[0] + appKey[1], 16), sec_1) | transform(parseInt(seed[0] + seed[3], 16), sec_2);
    let res_lsb = transform(parseInt(seed[1] + seed[2], 16), sec_1) | transform(res_msb, sec_2);
    let res = (res_msb << 16) | res_lsb;
    return hex(res).padStart(8, '0').toUpperCase();
}

// Free for all

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let ecuKey = ""
rl.once("line", (line) => {
    ecuKey = line.trim()
    console.log("Using key: " + ecuKey)
})

rl.prompt()


setInterval(() => {
    let data = clipboard.readSync()
    if(data.startsWith("6701") || data.startsWith("6703")) {
        let seed = data.substring(4)
        let key = getKey(seed, ecuKey)
        
        let prefix = data.startsWith("6701") ? "2702" : "2704";
        clipboard.writeSync(prefix + key)
    }
}, 500)