const fs = require('fs');
const pkg = require('./package.json');

const envFile = `
export const environment = {
  production: false,
  apiUrl: 'https://dev-lbizz-warranty-api.iconflux.info/',
  version: '${pkg.version}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', envFile);
