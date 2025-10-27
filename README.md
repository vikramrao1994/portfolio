

# Portfolio Website

This is a personal portfolio built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), and [Kern React Kit](https://www.npmjs.com/package/@publicplan/kern-react-kit). It showcases your work experience, education, skills, and contact information. PDF CV generation is handled by a Python script using ReportLab and Pillow.

## Features

- Responsive design for desktop and mobile
- Section navigation with anchor links (Intro, Work, Education, Skills, Contact)
- Decorative profile and section icons
- Data-driven content from `src/data/data.json`
- PDF CV generated automatically and saved to `public/`
- Image assets fetched and converted from webp to png for PDF
- Environment variables managed via `.env` and passed in deployment pipeline
- Deployable to GitHub Pages with automated CI/CD

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


## Data Prefetch & PDF Generation

Before building, the app fetches remote data and images, saves them to `src/data/data.json` and `public/`, and generates a PDF CV using a Python script:

```bash
npm run prebuild
```

This step uses environment variables from `.env` for all remote URLs. Images are converted from webp to png in memory for PDF generation.

## Deployment

Deployment to GitHub Pages is automated via GitHub Actions. The pipeline sets up Node.js and Python, installs all dependencies, passes environment variables, and runs the prebuild step before building and deploying. See `.github/workflows/deploy-github-pages.yml` for details.

## Customization

- Edit content in `src/data/data.json` and section components in `src/components/`.
- Update environment variables in `.env` for remote asset URLs.
- Python requirements: `pillow`, `reportlab`, `python-dateutil`.

## License

MIT
