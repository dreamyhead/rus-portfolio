# Portfolio

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Deployment

Pushing to `main` builds the app and publishes it to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow passes
`--base-href "/<repo>/"` because a project page is served from a subdirectory, so
every asset URL in the source is relative (`assets/...`, never `/assets/...`).
Adding an absolute one will break the deployed site while still working on `ng serve`.

`index.html` is also copied to `404.html`: Pages has no server-side routing, so that
copy is what answers a deep link.

### Assets kept out of the repo

GitHub rejects any file over 100MB, and a Pages site is capped at 1GB. The full cuts
`Bloop.mp4` (1.4GB) and `bad-day-full.mp4` (199MB) live in `../_large-videos/` instead
of `public/assets/animation/`. To publish them, re-encode for the web (1080p H.264,
~6Mbit/s) and add the result to the `reels` list in
[`animation-section.ts`](src/app/components/animation-section/animation-section.ts),
or host them off-site and embed.
