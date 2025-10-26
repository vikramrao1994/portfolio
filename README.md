
# Portfolio Website

This is a personal portfolio built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), and [Kern React Kit](https://www.npmjs.com/package/@publicplan/kern-react-kit). It showcases your work experience, education, skills, and contact information.

## Features

- Responsive design for desktop and mobile
- Section navigation with anchor links (Intro, Work, Education, Skills, Contact)
- Decorative profile and section icons
- Data-driven content from `src/data/data.json`
- Deployable to GitHub Pages

## Sections

- **Intro**: Profile picture, greeting, headline, and navigation links
- **Work**: Work experience cards with summary lists
- **Education**: Education history
- **Skills**: Tech stack and skills
- **Contact**: Address and contact info in the footer

## Navigation

You can jump to any section using anchor links:

- `#introduction` — Intro
- `#work` — Work Experience
- `#education` — Education
- `#skills` — Skills
- `#contact` — Contact (footer)

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Prefetch

Before building, the app fetches remote data and saves it to `src/data/data.json` using the prebuild script:

```bash
npm run prebuild
```

## Deployment

Deployment to GitHub Pages is automated via GitHub Actions. See `.github/workflows/deploy-github-pages.yml` for details.

## Customization

Edit content in `src/data/data.json` and section components in `src/components/`.

## License

MIT
