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
  SHEET_NAME: 'Sheet1',

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
  ],

  // Guest list — who's invited to the party
  // plus1: true = confirmed +1, 'maybe' = might bring someone, false/omitted = solo
  GUESTS: [
    { name: 'Flynn', plus1: 'Emily', plus1maybe: true },
    { name: 'Brendan' },
    { name: 'Ethan', plus1: 'Aidan' },
    { name: 'Ross', plus1: 'Millie', plus1maybe: true },
    { name: 'Denman' },
    { name: 'Cowling', plus1: 'Isabel' },
    { name: 'Aaron' },
    { name: 'James' },
    { name: 'Kate' },
    { name: 'Matt', plus1: 'Steph', plus1maybe: true },
    { name: 'Josh', plus1: 'Amelie', plus1maybe: true },
    { name: 'Hayden' },
    { name: 'Andy' },
    { name: 'Rory' },
    { name: 'Charli', plus1: 'Fun Matt', plus1maybe: true },
    { name: 'Dom', plus1: 'Claire' },
    { name: 'Adam', plus1: 'Scarlet', plus1maybe: true },
    { name: 'Angus', plus1: 'Gretta', plus1maybe: true },
    { name: 'Callum' },
    { name: 'Magnus' },
    { name: 'Hereward' }
  ],

  // Admin page password (simple protection — not ultra-secure, just keeps guests out)
  ADMIN_PASSWORD: 'letmein2026'
};
