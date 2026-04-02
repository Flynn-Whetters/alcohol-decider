// ============================================
// 🎉 PARTY DRINK REGISTRY - CONFIGURATION
// ============================================
// Follow the README to get your Google Sheets API key
// and Spreadsheet ID, then paste them below.

const CONFIG = {
  // Your Google Sheets API Key (from Google Cloud Console)
  API_KEY: 'AIzaSyBMC5BYsUptH38XOzaXd5BdmumtOtpbCtA',

  // Your Google Spreadsheet ID (from the sheet URL)
  // e.g. https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  SPREADSHEET_ID: '1XJj0q0n5Uo_mzRKDto9pZaxrlPCB6yZR7fNiwdb_7Mw',

  // The sheet/tab name (default is Sheet1)
  SHEET_NAME: 'PleaseBringAlchol',

  // Party details (customize these!)
  PARTY_NAME: '🎉 Wacky Party Drink Registry 🎉',
  PARTY_DATE: '2026-05-09T18:00:00', // YYYY-MM-DDTHH:MM:SS format
  PARTY_LOCATION: 'The Party Palace 🏠',

  // Default max number of people who can bring the same drink.
  // Once this many people sign up for a drink, it locks and they must pick another.
  // Override per-drink below by using { name, max } objects instead of strings.
  DEFAULT_MAX_PER_DRINK: 3,

  // Default drinks list — used if Google Sheets is unavailable
  // Use a string for the default max, or { name, max } to override per drink.
  DEFAULT_DRINKS: [
    'Vodka 🍸',
    'Tequila 🌵',
    { name: 'Beer 🍺', max: 5 },
    'Rum 🏴‍☠️',
    'Gin 🫒',
    'Whiskey 🥃',
    'Champagne 🍾',
    'Cider 🍏',
    { name: 'Premix Cans 🥫', max: 5 },
    'Shots 🔥',
    { name: 'Non-Alcoholic Drinks 🧃', max: 4 },
    { name: 'Ice 🧊', max: 4 },
    { name: 'Mixers 🫧', max: 4 },
    'Limes 🍋‍🟩',
    'Cups & Straws 🥤',
    'Snacks 🍿'
  ]
};
