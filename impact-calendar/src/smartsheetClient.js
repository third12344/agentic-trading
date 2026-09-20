// Deliberately imports only the Smartsheet SDK's read call (sheets.getSheet).
// No add/update/delete row methods are referenced anywhere in this app, so
// there is no code path that can write back to Smartsheet.
const smartsheetSdk = require('smartsheet');

function createClient(accessToken) {
  const client = smartsheetSdk.createClient({ accessToken, logLevel: 'error' });

  return {
    async fetchSheet(sheetId) {
      return client.sheets.getSheet({ id: sheetId });
    },
  };
}

module.exports = { createClient };
