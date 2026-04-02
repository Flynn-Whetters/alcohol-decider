// ============================================
// 🎉 PARTY DRINK REGISTRY - CONFIGURATION
// ============================================
// Follow the README to get your Google Sheets API key
// and Spreadsheet ID, then paste them below.

const CONFIG = {
  // Your Google Sheets API Key (from Google Cloud Console)
  API_KEY: 'YOUR_API_KEY_HERE',

  // Your Google Spreadsheet ID (from the sheet URL)
  // e.g. https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

  // The sheet/tab name (default is Sheet1)
  SHEET_NAME: 'Sheet1',

  // Party details (customize these!)
  PARTY_NAME: '🎉 Wacky Party Drink Registry 🎉',
  PARTY_DATE: '2026-05-01T20:00:00', // YYYY-MM-DDTHH:MM:SS format
  PARTY_LOCATION: 'The Party Palace 🏠',

  // Default drinks list — used if Google Sheets is unavailable
  DEFAULT_DRINKS: [
    'Vodka 🍸',
    'Tequila 🌵',
    'Beer 🍺',
    'Rum 🏴‍☠️',
    'Gin 🫒',
    'Whiskey 🥃',
    'Champagne 🍾',
    'Cider 🍏',
    'Premix Cans 🥫',
    'Shots 🔥',
    'Non-Alcoholic Drinks 🧃',
    'Ice 🧊',
    'Mixers 🫧',
    'Limes 🍋‍🟩',
    'Cups & Straws 🥤',
    'Snacks 🍿'
  ]
};
