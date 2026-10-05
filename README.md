# Meal Manager

Track meals, bazar and deposits for a shared home, and work out each person's balance at the end of the month.

- 2 meals a day (lunch and dinner), each counts as 1 meal. Guests count as extra meals for the host.
- **Meal rate** = total bazar ÷ total meals.
- **Cost** = your meals × meal rate + your equal share of shared bills.
- **Balance** = what you paid (deposits + bazar from your own pocket + last month's balance − refunds) − your cost.
  Positive: you get money back. Negative: you must pay.

## Run it

1. Install packages:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example` and fill in:
   - `MONGODB_URI`: your MongoDB connection string (MongoDB Atlas or local)
   - `SESSION_SECRET`: a long random string (the command to make one is in `.env.example`)
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the admin account
3. Create the admin account (run it again any time to reset the admin password):
   ```bash
   npm run create-admin
   ```
4. Start the app and open http://localhost:3000:
   ```bash
   npm run dev
   ```

On Windows PowerShell, use `npm.cmd` instead of `npm` if scripts are blocked.

## Joining

- New people open **Request to join** and register with their name, email and password.
- Their request waits on the admin's **Members** page. They can log in only after the admin clicks **Accept**.
- The admin can also add members directly. Those members can log in straight away.

## Deploy on Vercel

1. Push this project to a GitHub repository (`.env.local` is ignored, so your secrets stay on your PC).
2. On https://vercel.com click **Add New → Project** and import the repository. Keep the default Next.js settings.
3. Under **Environment Variables** add:
   - `MONGODB_URI`: the same Atlas connection string as in `.env.local`
   - `SESSION_SECRET`: a long random string (you can copy the one from `.env.local`)
   - `APP_TIMEZONE`: `Asia/Dhaka`
4. In MongoDB Atlas, open **Network Access** and add `0.0.0.0/0` (allow access from anywhere).
   Vercel's servers don't have fixed IP addresses, so without this the app can't reach the database.
5. Click **Deploy**. The admin account already lives in Atlas, so you can log in right away.
   To change the admin password later, edit `.env.local` and run `npm run create-admin` on your PC.

## Who can do what

| | Admin | Member |
|---|---|---|
| See all pages and the report | ✔ | ✔ |
| Change meals | Any member, any day | Own meals, today and future days |
| Add bazar, bills, deposits | ✔ | |
| Accept join requests, add or edit members | ✔ | |
| Close / reopen a month | ✔ | |

Closing a month locks it and carries every balance into next month. Reopen it to fix a mistake.

## Scripts

- `npm run dev`: development server
- `npm run build` / `npm start`: production build and server
- `npm test`: tests for the money calculations and dates
- `npm run lint`: ESLint
- `npm run create-admin`: create or update the admin account

## Code layout

- `src/app/(app)/…`: pages (`page.jsx`), each with its server actions in `actions.js`
- `src/app/(auth)/…`: login and register pages
- `src/components/`: shared UI (`.jsx`)
- `src/services/`: database logic; `report.js` is the pure money calculation
- `src/models/`: Mongoose models (Member, MealEntry, Expense, Deposit, Month)
- `src/lib/`: database connection, login session, dates, money formatting
- `scripts/create-admin.mjs`: creates the admin account
- `src/proxy.js`: sends logged-out visitors to `/login`
