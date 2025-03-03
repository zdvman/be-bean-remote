# Bean Remote API

A backend API built with **Node.js**, **Express**, and **PostgreSQL**. This API supports CRUD operations for topics, articles, comments, and users, with additional features like sorting, filtering, and pagination.

This project was created as part of a **Digital Skills Bootcamp in Software Engineering** provided by [Northcoders](https://northcoders.com/).

---

## 🔗 Hosted API

<!-- The API is hosted on Render: [Northcoders News API](https://yourdomain.onrender.com/) -->

You can access available endpoints by making a **GET** request to `/api`:

```bash
# curl https://youraddress/api
```

This will return a JSON object detailing all available routes.

---

## 📂 Project Setup

### 🔧 Prerequisites

To run this project locally, ensure you have:

- [Node.js](https://nodejs.org/) **v16 or higher**
- [PostgreSQL](https://www.postgresql.org/) **v12 or higher**
- A code editor like [VS Code](https://code.visualstudio.com/)

---

### 🚀 Installation & Setup

1️⃣ **Clone the repository:**

```bash
git clone https://github.com/zdvman/be-bean-remote.git
cd be-bean-remote
```

2️⃣ **Install dependencies:**

```bash
npm install
```

3️⃣ **Set up environment variables:**

Create three `.env` files in the root of the project:

- `.env.production`
- `.env.development`
- `.env.test`

Add the following variables to each file:

**`.env.production`**:

```env
DATABASE_URL=<Your_Supabase_Connection_URL>
```

**`.env.development`**:

```env
PGDATABASE=bean_remote
PORT=3000
```

**`.env.test`**:

```env
PGDATABASE=bean_remote_test
PORT=3001
```

Ensure these files are included in `.gitignore` to keep them private.

4️⃣ **Set up and seed the database:**

```bash
npm run setup-dbs   # Creates the databases
```

Install PostGIS Locally
On Ubuntu/Debian-based Linux

```bash
sudo apt-get update
sudo apt-get install postgis postgresql-15-postgis-3  # Adjust versions if needed
```

On macOS (Homebrew)

```bash
brew install postgis
```

Confirm PostGIS is installed by running:

```bash
psql --version
```

You should see a version number and possibly mention of PostGIS if it’s bundled.

Enable PostGIS in Your Database
Open a terminal (inside VSCode or your system terminal).
Connect to your local PostgreSQL database (the one you use for your Bean Remote project). For example:

```bash
psql -d bean_remote_dev  # or whatever your DB is called
```

Once in the psql prompt, run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

If you see CREATE EXTENSION, it means it was installed successfully.
If you get an error like ERROR: could not open extension control file ..., it means PostGIS isn’t installed properly.

Repeat for your test database as well, if you have a separate one (e.g. bean_remote_test).

```sql
\c bean_remote_test   -- switch to the test DB
CREATE EXTENSION IF NOT EXISTS postgis;
```

Now both your dev and test databases have the PostGIS extension enabled.

```bash
sudo apt-get update
sudo apt-get install postgis postgresql-15-postgis-3  # Adjust versions if needed
```

```bash
npm run seed        # Seeds the development database
```

5️⃣ **Run the tests:**

```bash
npm test
```

---

## 🖥️ Available Scripts

- **`npm run setup-dbs`** - Creates the required PostgreSQL databases.
- **`npm run seed`** - Seeds the development database with sample data.
- **`npm test`** - Runs the Jest test suite.
- **`npm run start-dev`** - Starts the development server using nodemon.
- **`npm start`** - Starts the production server.

---

## 📡 Hosting with Supabase & Render

This project is hosted using **Supabase** (for the database) and **Render** (for the API). Below are the steps followed for hosting:

1️⃣ **Set up Supabase Database**

- Created a new database instance in Supabase.
- Obtained a **DATABASE_URL** for the hosted database.
- Stored it in `.env.production`.

2️⃣ **Update Connection Configuration**

- Modified `connection.js` to use `DATABASE_URL` in production.

3️⃣ **Deploy to Render**

- Created a **Web Service** on Render.
- Set **Build Command**: `yarn`
- Set **Start Command**: `yarn start`
- Added environment variables:
  ```
  DATABASE_URL=<Your_Supabase_Connection_URL>
  NODE_ENV=production
  ```

4️⃣ **Seed the Production Database**

```bash
npm run seed-prod
```

---

## 📌 Endpoints Overview (implemented with Express Routers)

### 📝 GET `/`

Healthcheck endoint
Returns a JSON object with msg key {msg: 'Healthcheck is passed' }

### 📝 GET `/api`

Returns a JSON object describing all available API endpoints.
