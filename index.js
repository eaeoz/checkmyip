#!/usr/bin/env node

fetch('https://ipinfo.io/json')
  .then(r => r.json())
  .then(d => console.log(d.ip))
  .catch(e => console.error(e));
