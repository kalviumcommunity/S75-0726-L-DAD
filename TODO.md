# TODO - MERN folder structure cleanup

## Step 1: Inspect current repo layout
- [x] Listed server/client root structures
- [x] Read key server entry files and package.json

## Step 2: Backend restructuring (server)
- [x] Added missing `server/src/config/env.js`
- [x] Updated `server/src/config/index.js` to export `loadEnv`
- [x] Created HTTP layer structure under `server/src/http/*`
- [x] Updated `server/src/routes/index.js` to mount `server/src/http/routes` under `/api`

## Step 3: Ensure server can start
- [ ] Fix runtime crash (currently `MONGO_URI is not set`)
  - Option A: user provides valid `MONGO_URI`
  - Option B: adjust `connectMongo()` to run without DB for dev

## Step 4: Frontend cleanup (client)
- [ ] Remove unwanted folders/files and ensure required API/service structure exists

## Step 5: Verify commands
- [ ] Run `npm --prefix server run dev`
- [ ] Run `npm --prefix client run dev`

