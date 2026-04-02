# 🎉 Wacky Party Drink Registry

A fun, chaotic, neon-themed website where party guests can claim which drinks they're bringing. No backend needed — runs entirely as a static site with optional Google Sheets integration.

**[Live Demo on GitHub Pages]** — deploy your own in minutes!

---

## Features

- Wacky neon party theme with animated blobs, confetti, and comic fonts
- Claim drinks with your name — prevents duplicate claims
- Countdown timer to party day
- Random drink spinner ("Can't decide?")
- Admin summary view (click the 👀 button)
- Filter by available/claimed
- Works offline with localStorage fallback
- Mobile responsive
- Zero build tools — pure HTML, CSS, vanilla JS

---

## Quick Start (Offline Mode)

1. Open `index.html` in your browser. Done! It works immediately with the default drink list stored in `config.js`.
2. Claims are saved to `localStorage` in offline mode.

---

## Setup with Google Sheets (Recommended for shared use)

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. In Row 1, add headers:
   | A | B | C |
   |---|---|---|
   | Drink Name | Claimed By | Status |
3. Add your drinks starting from Row 2:
   | A | B | C |
   |---|---|---|
   | Vodka | | available |
   | Tequila | | available |
   | Beer | | available |
   | Rum | | available |
   | Gin | | available |
   | Whiskey | | available |
   | Champagne | | available |
   | Cider | | available |
   | Premix Cans | | available |
   | Shots | | available |
   | Non-Alcoholic Drinks | | available |
   | Ice | | available |
   | Mixers | | available |
   | Limes | | available |

4. **Important:** Click **Share** → **General access** → **Anyone with the link** → set to **Editor** (required for claiming to work via API without OAuth)

5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 2: Get a Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Sheets API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**
4. Create an API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **API Key**
   - Copy the key
5. (Optional but recommended) Restrict the API key:
   - Click on the key → **API restrictions** → **Restrict key**
   - Select only **Google Sheets API**
   - Under **Website restrictions**, add your GitHub Pages domain

### Step 3: Configure the site

Open `config.js` and replace the placeholder values:

```js
const CONFIG = {
  API_KEY: 'your-actual-api-key',
  SPREADSHEET_ID: 'your-actual-spreadsheet-id',
  SHEET_NAME: 'Sheet1',
  PARTY_NAME: '🎉 Your Party Name 🎉',
  PARTY_DATE: '2026-05-01T20:00:00',
  PARTY_LOCATION: 'Your Location 🏠',
  // ...
};
```

### Important Note on Google Sheets Write Access

The Google Sheets API v4 requires **OAuth 2.0** for write operations (updating cells when someone claims a drink). The simple API key approach works for **reading** data.

**Options for write access (pick one):**

**Option A — Make the sheet publicly editable (simplest, good for party use):**
The site uses the Sheets API with your API key. For this to work for **writes**, you need to use a Google Apps Script web app instead. See "Option B" below.

**Option B — Google Apps Script (Recommended, free, no OAuth popup):**

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Replace the code with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var row = data.row;
  var name = data.name;
  
  // Check if already claimed
  var currentStatus = sheet.getRange(row, 3).getValue();
  if (currentStatus && currentStatus.toLowerCase() === 'claimed') {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: 'Already claimed'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  sheet.getRange(row, 2).setValue(name);
  sheet.getRange(row, 3).setValue('claimed');
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({
    values: data
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy** → **New deployment**
4. Select type: **Web app**
5. Set **Execute as**: Me
6. Set **Who has access**: Anyone
7. Click **Deploy** and copy the Web App URL
8. You can then modify `script.js` to use this URL instead of the direct Sheets API

---

## Deploy on GitHub Pages

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: wacky party drink registry"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. Go to your repo on GitHub → **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch, **/ (root)** folder
5. Click **Save**
6. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## File Structure

```
/index.html     — Main page
/style.css      — Wacky neon styles
/script.js      — All logic (claim, confetti, spinner, etc.)
/config.js      — Configuration (API keys, party details, default drinks)
/README.md      — This file
```

---

## Customization

### Change drinks
Edit the `DEFAULT_DRINKS` array in `config.js`, or add rows to your Google Sheet.

### Change party details
Edit `PARTY_NAME`, `PARTY_DATE`, and `PARTY_LOCATION` in `config.js`.

### Change theme colors
Edit the CSS variables in `:root` at the top of `style.css`.

---

## Security Notes

- The Google Sheets API key is visible in client-side code. Restrict it to your domain and Google Sheets API only.
- The Apps Script approach is safer since the script runs server-side.
- User input is sanitized before rendering to prevent XSS.
- No authentication data is stored client-side beyond the API key.

---

## No Paid Services Required

- **Hosting:** GitHub Pages (free)
- **Data storage:** Google Sheets (free) or localStorage (free)
- **Fonts:** Google Fonts (free)
- **Everything else:** Pure client-side, no server needed

---

Made with 🍻 and questionable decisions
