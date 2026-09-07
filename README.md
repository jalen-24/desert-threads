# Desert Threads Embroidery — landing page

A single static landing page. **No npm, no build step, no framework, no JS libraries.**
Three files do the whole thing: `public/index.html`, `public/styles.css`, `public/script.js` (~70 lines of vanilla JS).

```
public/
  index.html      the page
  styles.css      all styling (hand-rolled, custom-property tokens at the top)
  script.js       sticky header, mobile menu, scroll reveal, form handoff
  404.html        branded not-found page
  favicon.svg     embroidery-hoop mark
  robots.txt, sitemap.xml
  img/            logo — white background knocked out, WebP + PNG at two sizes
assets/           logo-master.png, the full-res cutout (not deployed)
wrangler.jsonc    Cloudflare Workers static-assets config
```

## Run it locally

Any static server works, because it *is* just static files:

```sh
python3 -m http.server 8080 --directory public
# → http://localhost:8080
```

Or with Wrangler, which matches production exactly:

```sh
npx wrangler dev
```

## Deploy to Cloudflare Workers

```sh
npx wrangler deploy
```

That's it. `wrangler.jsonc` declares an **assets-only Worker** — no `main` entry
point, so there's no script to bundle and nothing to install. Cloudflare serves
`./public` from the edge and falls back to `404.html` for unknown paths.

First time on this machine: `npx wrangler login`.

## Deploy automatically on push to main

`.github/workflows/deploy.yml` runs `wrangler deploy` on every push to `main`
(which includes merging a PR), and can be triggered by hand from the Actions tab.
There's no install or build step in the job — the action fetches Wrangler itself.

It needs two repository secrets:

| Name | Kind | Where it comes from |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | Cloudflare dashboard → My Profile → API Tokens → **Create Token** → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | variable | Cloudflare dashboard sidebar, or `npx wrangler whoami` — not sensitive, so a plain variable is fine |

Note the kinds: the workflow reads the token as `secrets.CLOUDFLARE_API_TOKEN`
and the account id as `vars.CLOUDFLARE_ACCOUNT_ID`. They are separate namespaces —
a variable is not readable via `secrets.`, or the other way round.

Both are stored in the **`prod` GitHub environment**, which the deploy job opts
into with `environment: prod`. Environment secrets are invisible to jobs that
don't declare the environment, so the `--env prod` flag matters:

```sh
gh secret set   CLOUDFLARE_API_TOKEN  --env prod   # paste the token when prompted
gh variable set CLOUDFLARE_ACCOUNT_ID --env prod
```

Check them with `gh secret list --env prod` (names only, never values). Plain
`gh secret list` shows repo-level secrets and will look empty — that's expected.

The first successful run creates the Worker; every run after that updates it.

### Alternative: Cloudflare Workers Builds

Cloudflare can watch the repo directly instead — Workers & Pages → the Worker →
**Settings → Build → Connect a repo**. No workflow file and no secrets, since
Cloudflare holds the GitHub connection. Delete `.github/workflows/deploy.yml` if
you go this route, or the two will both deploy on every push.

## The design

Pulled straight from the logo — retro sign-painter script, sunset gradient, heavy outlines.

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` | `#14100D` | dark sections, footer |
| `--sand` | `#F7EBD7` | light sections |
| `--cream` / `--gold` | `#FCE7AE` / `#F5B830` | headings on dark, accents |
| `--orange` / `--ember` / `--deep` | `#F0641E` / `#CE3411` / `#7E1E09` | buttons, sunset, dunes |

Typography: **Alfa Slab One** (display, echoes the logo's weight), **Yellowtail**
(script accents, echoes the logo's lettering), **Figtree** (body). Loaded from
Google Fonts — the only external request on the page.

Recurring motif is the **stitch**: dashed dividers, dotted rules, a dashed hoop
ring that animates on hover, a dashed border on the quote form. The hero is a
CSS-only desert sunset — radial sun, rotating conic light rays, SVG noise grain,
layered dune silhouettes.

## Before it goes live — placeholder content to replace

Everything below is invented and needs your real details:

- **Contact** — `(602) 555-0142`, `hello@desertthreads.com`, `1408 N Grand Ave, Phoenix, AZ 85007`. In `index.html` (quote section + footer) and `script.js` (the mailto address).
- **Pricing** — `$12.00 / $8.25 / $6.40` per-piece tiers and the per-service "from" prices.
- **Stats** — 16 heads, 12,400 garments, 1,100 logos, 4.9★.
- **Client names and testimonials** in the Work and Word-around-town sections.
- **Work images** — the five cards use CSS gradients with garment silhouettes as
  stand-ins. Swap in photos by replacing `.card-work__art` with an `<img>`, or set
  `background-image` on the `[data-art="…"]` rules in `styles.css`.
- **Domain** — `desertthreads.example.com` in the canonical/OG tags, `robots.txt` and `sitemap.xml`.

## The quote form

It has no backend. On submit, `script.js` opens the visitor's mail client with the
fields pre-filled. To take submissions server-side instead, either point the form
at a service:

```html
<form class="qform" id="qform" action="https://formspree.io/f/YOUR_ID" method="POST">
```

(and delete the `submit` handler in `script.js`), or add a `main` Worker script to
`wrangler.jsonc` that handles `POST /api/quote` alongside the assets.
