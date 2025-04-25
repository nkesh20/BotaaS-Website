# BotaaS Website

Frontend application for Bot as a Service (BotaaS) built with Angular.

## Requirements

- Node.js 16+
- Angular CLI

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/BotaaS-Website.git
cd BotaaS-Website
```

### 2. Install dependencies

```bash
cd botaas-client
npm install
```

## Development server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Using Docker

```bash
docker-compose up -d frontend
```

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

```bash
ng build --prod
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

```bash
ng test
```

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

```bash
ng e2e
```

## Project Structure

```
src/
├── app/
│   ├── core/           # Singleton services, universal components
│   ├── features/       # Feature modules (auth, dashboard, bots)
│   └── shared/         # Shared components, directives, pipes
├── assets/             # Static assets
└── environments/       # Environment configuration
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## License

[MIT](LICENSE)