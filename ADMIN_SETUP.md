# Admin dashboard: setup guide

The admin dashboard is at **`/admin`** (e.g. `https://www.tomsbarber.website/admin`).
From it, Tom can manage: bookings, opening hours and holidays, services and prices,
gallery photos, the photos on the Home and About pages, reviews, FAQ, business details,
the top banner and online-booking settings.

Until the steps below are done, the public site keeps working with built-in default
content. The dashboard shows a yellow "database isn't connected" notice and can't save.

---

## 1. Create the Supabase project

1. Sign in at <https://supabase.com> with the account that will own the project, then click **New project**.
2. Region: **West US (North California)**. It's the closest to Hawaii.
3. Save the database password somewhere safe.

## 2. Create the tables (SQL Editor)

Open **SQL Editor → New query**. Run these two files **in order**: paste the whole file, then click **Run**.

1. `supabase/migrations/20260731005303_f38b2583-22bf-4a8e-89e7-b8d346f9e024.sql` (creates the bookings table)
2. `supabase/migrations/20261124120000_admin_dashboard.sql` (creates the content tables, security rules and the image bucket, and copies in the current website content)

## 3. Lock down sign-ups and set URLs

Go to **Authentication → Sign In / Providers**:
- Turn **OFF** "Allow new users to sign up". Only admins you create by hand can log in.
- Keep **Email** enabled.

Go to **Authentication → URL Configuration**:
- **Site URL:** `https://www.tomsbarber.website`
- **Redirect URLs:** add both of these:
  - `https://www.tomsbarber.website/admin/reset-password`
  - `http://localhost:8080/admin/reset-password`

## 4. Create Tom's admin login

1. Go to **Authentication → Users → Add user → Create new user**. Enter Tom's email and a strong password, and tick **Auto Confirm User**.
2. In the **SQL Editor**, run this with Tom's real email:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'TOM_EMAIL_HERE';
```

Repeat for any other admin. To remove an admin, run
`delete from public.admin_users where user_id = (select id from auth.users where email = '...');`

## 5. Environment variables

Find the values in **Project Settings → API Keys** and **Project Settings → Data API**.

| Variable | Where to find it | Secret? |
|---|---|---|
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Project URL | no |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable / `anon` key | no |
| `SUPABASE_PROJECT_ID` / `VITE_SUPABASE_PROJECT_ID` | project ref (the part of the URL before `.supabase.co`) | no |
| `SUPABASE_SERVICE_ROLE_KEY` | secret / `service_role` key | **YES**. Server-only, never add a `VITE_` prefix |
| `RESEND_API_KEY` | resend.com → API Keys (create a **new** key; the old one leaked in git history) | **YES** |
| `RESEND_FROM_EMAIL`, `SHOP_OWNER_EMAIL` | unchanged | no |

- **Vercel:** Project → Settings → Environment Variables. Add all of the above for Production and Preview, then **redeploy**.
- **Local:** copy `.env.example` to `.env` and fill it in. `.env` is git-ignored.

## 6. (Recommended) Password-reset emails

Supabase's built-in mailer only sends a few emails per hour. For reliable "Forgot password"
emails, set up **Authentication → Emails → SMTP Settings** with Resend:
host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key,
sender `appointments@tomsbarber.website`.

---

## How the security works

- **Login:** Supabase email + password. Public sign-up is off, and a user also has to be in `public.admin_users` to get into the dashboard.
- **Every admin action is checked twice.** First the server function checks the login token and the admin allow-list. Then Postgres Row Level Security (`public.is_admin()`) blocks the write at the database level, even if someone calls the API directly.
- **Visitors** can only *read* website content. They can't read bookings or write anything.
- **Bookings** can only be created through the server, which re-checks the service, price, opening hours, holidays and double-booking.
- **Images:** the storage bucket accepts JPG/PNG/WebP/AVIF up to 5 MB, and only admins can upload or delete.
- **Sessions:** auto sign-out after 30 minutes of inactivity. "Sign out on all devices" is under *My Account*.
- `/admin` is `noindex` and blocked in `robots.txt`.

## Local development note

The folder name `Tom's website` contains an apostrophe, and that breaks the Vite/TanStack build
on Windows. Rename the folder (e.g. `toms-website`) or map it to a drive letter:
`subst T: "C:\path\to\Tom's website"`, then run `npm run dev` from `T:\`.
