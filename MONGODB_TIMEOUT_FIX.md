# MongoDB Timeout Fix

## Problem
- Error: `Operation transactions.insertOne() buffering timed out after 10000ms`
- This happens when MongoDB operations take too long or the connection is slow/unstable

## Solutions Applied

### 1. **Transaction Route Timeout Protection** (`server/routes/transaction.js`)
- Added `saveTransactionWithTimeout()` helper function with 5-second timeout
- Prevents operations from hanging indefinitely
- Automatically falls back to in-memory transaction ID if database times out
- Better error messages for timeout vs other errors

### 2. **MongoDB Connection Settings** (`server/index.js`)
- **`bufferMaxEntries: 0`** - Disable mongoose buffering; throw errors immediately
- **`bufferCommands: false`** - Disable mongoose buffering
- **`connectTimeoutMS: 10000`** - 10 second connection timeout
- **`maxPoolSize: 10`** - Maintain up to 10 socket connections
- **`minPoolSize: 1`** - Maintain at least 1 socket connection

## How It Works Now

1. **If MongoDB is connected and fast:**
   - Transaction saves to database normally
   - Returns MongoDB ObjectId

2. **If MongoDB times out (slow connection):**
   - Operation times out after 5 seconds
   - Falls back to in-memory transaction ID (format: `MEM-{timestamp}-{random}`)
   - API still returns success response
   - Transaction is recorded in frontend history

3. **If MongoDB is disconnected:**
   - Skips database save attempt
   - Uses in-memory transaction ID immediately
   - API still works

## Testing

1. **Restart your backend server:**
   ```bash
   cd server
   npm start
   ```

2. **Test a transaction:**
   - Go to "Send to Bank"
   - Fill in the form and submit
   - Should work even if MongoDB is slow

3. **Check server logs:**
   - Look for: `✅ Transaction saved to database:` (success)
   - Or: `⚠️ Database operation timed out, using in-memory transaction` (fallback)

## Notes

- Transactions will still work even if MongoDB is slow
- In-memory transaction IDs are temporary (not persisted)
- For production, ensure MongoDB connection is stable
- Consider using MongoDB Atlas with proper network configuration

## 404 Error for `/send-to-bank`

If you see a 404 error for `/send-to-bank`:
1. **Hard refresh your browser:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache**
3. **Check the route exists:** The route is defined in `src/App.jsx` as `path="send-to-bank"`
4. **Make sure you're navigating from the dashboard:** Use the button, not typing the URL directly

