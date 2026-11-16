# Hollowmere Nights — Cloud Sync (Cloudflare Workers + R2)

Optional personal sync backend for saves and permanent-character images (`n_*` / `npc_*`), designed to work inside Perchance's iframe without user API keys.

## One-time setup

1. Create a free Cloudflare account and enable **R2** in the dashboard.
2. Create an R2 bucket named `hollowmere-sync`:
   ```bash
   cd cloud
   npx wrangler r2 bucket create hollowmere-sync
   ```
3. Set your personal sync passphrase (any memorable phrase):
   ```bash
   npx wrangler secret put SYNC_SECRET
   ```
4. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```
5. Copy the printed `https://hollowmere-sync.<your-subdomain>.workers.dev` URL, open **Settings → Cloud Sync** in Hollowmere Nights, enter the URL + your passphrase, and click **Connect**.

## Notes

- **On-demand image sync:** Generating or regenerating images saves locally to IndexedDB first. Use **↑ Upload** or **⇄ Check** on an image (or the batch upload button in Settings) when you want to push or compare with R2.
- **Named runs & snapshots:** Every run carries its own `cloudId` and `cloudName`, so multiple parallel runs won't overwrite each other across devices.
- **Recovery:** If the image manifest ever needs rebuilding from existing R2 objects, hit `POST /imgs/rebuild-manifest` (or use the Rebuild Manifest button in Settings).
