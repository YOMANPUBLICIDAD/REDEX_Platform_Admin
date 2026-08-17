
const fs = require('fs');
let str = fs.readFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'utf8');
let match = str.match(/const inmueblesData\s*=\s*(\[[\s\S]*\]);?/);
let arr = [];
eval('arr = ' + match[1]);
fs.writeFileSync('temp_db.json', JSON.stringify(arr));
