# Oasis GEC Idukki Website

Official web presence for **Oasis GEC Idukki**, the student-led palliative care unit at Government Engineering College, Idukki.

---

## Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Installation & Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```
This generates:
- Rendered committee, initiatives, and gallery markup (`npm run build:data`)
- Production-minified CSS via Tailwind CLI (`npm run build:css`)

### Checks & Quality
```bash
npm run check        # Syntax validation
npm run lint         # ESLint analysis
npm run format:check # Prettier formatting check
```

---

## Content Management

All dynamic content is organized under the `data/` directory. After modifying any file in `data/`, run `npm run build` to update the rendered HTML.

### 1. Adding or Updating a Committee Member
Edit `data/committee.json`:
```json
{
  "name": "Jane Doe",
  "role": "Executive Member",
  "semester": "S6",
  "department": "CSE",
  "photo": "images/jane.webp",
  "photoConsent": true
}
```
- Set `photoConsent: false` or leave `photo` empty to automatically display the accessible initials avatar fallback.
- The build script preserves security by escaping all text fields.

### 2. Adding Gallery Photos
1. Add optimized WebP/JPG images to `images/`.
2. Add an entry to `data/gallery.json`:
```json
{
  "src": "images/event-name.webp",
  "alt": "Short descriptive text of the activity",
  "caption": "Activity Title",
  "category": "Outreach"
}
```
3. Run `npm run build`.

### 3. Switching Custom Domain
1. Edit `data/site.json`:
   - Change `"baseUrl": "https://emil2005png.github.io/oasisGeci/"` to `"https://your-custom-domain.org/"`.
2. Run `npm run build` to re-sync canonical tags, Open Graph meta tags, sitemap, and JSON-LD schema.
3. Commit and push changes.

---

## Deployment to GitHub Pages

This repository uses GitHub Actions for continuous deployment.

### Required Repository Setting
1. Go to **Settings > Pages** on GitHub.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Pushes to `main` will automatically trigger `.github/workflows/deploy.yml`.
