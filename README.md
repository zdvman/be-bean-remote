# Bean Remote API

A backend API built with **Node.js**, **Express**, and **PostgreSQL**, designed to support remote workers in finding work-friendly cafes. This API provides CRUD operations for users, cafes, reviews, visits, and amenities, along with features such as sorting, filtering, pagination, and geolocation-based searches.

This project was created as part of a **Digital Skills Bootcamp in Software Engineering** provided by [Northcoders](https://northcoders.com/).

---

## 🔗 Hosted API

The API is hosted on Render: [Bean Remote API](https://be-bean-remote.onrender.com/api/)

You can access the full list of available endpoints [here](https://be-bean-remote.onrender.com/api/).

To check the health of the API, you can send a **GET** request to `/`:

```bash
# Healthcheck endpoint
curl https://be-bean-remote.onrender.com/
```

This will return a JSON object confirming that the API is operational.

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

**Firebase Authentication:**
The API uses Firebase for user authentication. You need to add Firebase credentials in your `.env` file as follows:

```env
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----your_private_key-----END PRIVATE KEY-----\n",
  "client_email": "your_client_email",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your_client_x509_cert_url",
  "universe_domain": "googleapis.com"
}'
```

Ensure these files are included in `.gitignore` to keep them private.

4️⃣ **Set up and seed the database:**

```bash
npm run setup-dbs   # Creates the databases
```

### Install PostGIS Locally

#### On Ubuntu/Debian-based Linux
```bash
sudo apt-get update
sudo apt-get install postgis postgresql-15-postgis-3  # Adjust versions if needed
```

#### On macOS (Homebrew)
```bash
brew install postgis
```

#### Enable PostGIS in Your Database
```bash
psql -d bean_remote_dev  # Connect to the database
CREATE EXTENSION IF NOT EXISTS postgis;
```

Repeat for your test database:
```bash
\c bean_remote_test   # Switch to the test DB
CREATE EXTENSION IF NOT EXISTS postgis;
```

Now both your dev and test databases have the PostGIS extension enabled.

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
- Set **Build Command**: `npm install`
- Set **Start Command**: `npm start`
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

## 🛠 Tech Stack

| **Technology**     | **Purpose**  |
|-------------------|-------------------|
| **Node.js**       | Backend runtime for handling API requests efficiently. |
| **Express.js**    | Web framework for creating RESTful APIs. |
| **PostgreSQL**    | Relational database for structured data storage. |
| **PostGIS**       | Geospatial database extension for efficient location filtering. |
| **Supabase**      | Cloud-hosted PostgreSQL with real-time capabilities. |
| **Firebase Auth** | Secure authentication for user login and session management. |
| **Jest & Supertest** | Testing framework for API stability and correctness. |
| **GitHub Actions** | CI/CD automation for testing and deployment. |
| **Render**        | Cloud hosting service for backend deployment. |

---

## 📌 Endpoints Overview (implemented with Express Routers)

### 📝 GET `/`

**Healthcheck Endpoint**
Returns a JSON object:
```json
{ "msg": "Healthcheck is passed" }
```

For a full list of available endpoints, visit [Bean Remote API Endpoints](https://be-bean-remote.onrender.com/api/).

---


