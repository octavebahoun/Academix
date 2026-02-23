const fs = require('fs');
const path = require('path');

const inventory = fs.readFileSync('../../docs/ENDPOINTS_INVENTORY.md', 'utf8');
const servicesDir = './services';

// Extract all endpoints grouped by Laravel/Node/Python
const laravelEndpoints = [...inventory.matchAll(/- `(GET|POST|PUT|PATCH|DELETE) (\/.*?)`/g)].map(m =>({method: m[1], path: m[2]}));

let missing = [];
let found = 0;
for (const endpoint of laravelEndpoints) {
    if (!endpoint.path.startsWith('/admin') && !endpoint.path.startsWith('/auth') && !endpoint.path.startsWith('/departement') && !endpoint.path.startsWith('/student') ) {
         continue; // Only check Laravel ones described earlier
    }
    // Convert path to a regex pattern that might be in frontend code
    // e.g. /admin/departements/{id} -> \/admin\/departements\/(?:\$\{.*\}|.*)
    let searchPath = endpoint.path.replace(/\{id\}/g, '').replace(/\{matiere_id\}/g, '');
    let isFound = false;
    
    // basic search in all files in services dir
    const files = fs.readdirSync(servicesDir);
    for (const file of files) {
        const content = fs.readFileSync(path.join(servicesDir, file), 'utf8');
        if (content.includes(searchPath)) {
            isFound = true;
            break;
        }
    }
    
    if (isFound) {
        found++;
    } else {
        missing.push(`${endpoint.method} ${endpoint.path}`);
    }
}

console.log(`Found: ${found}`);
console.log(`Missing: ${missing.length}`);
console.log(missing.join('\n'));
