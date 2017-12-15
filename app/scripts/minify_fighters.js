'use strict';

const exec = require('child_process').exec;

console.log('Minifying fighter json...\n');
exec('node node_modules/minify-json/index.js build/fighters',
     {maxBuffer: 1024 * 1024 * 20},  // 20MB buffer
     function callback(error, stdout, stderr) {
       if (error) {
         console.log('Error minifying fighters json: ' + error);
         console.log(stdout);
         console.log(stderr);
       } else {
         console.log('Successfully minified fighters json!')
       }
     });
