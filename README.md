# What is this?

An AI-powered tool that converts natural language into functional NodeJS or Python code. The code runs in the cloud for instant testing and can be saved for later use.

# Who is this for?

Individuals who possesses no technical background but with AI prompting interest and IT workers.

# Our Hosted Demo

[https://carpenter.firstbot.tech/](https://carpenter.firstbot.tech/)

# Requirement

- Git
- NodeJS 18.x
- Python 3.11.x
- npm package
  - `@aws-amplify/cli@12.12.2`
  - `yarn@1.22.22`
- pypi package `pipenv==2024.0.1` (For building Python AWS Lambda)

- Vercel (Frontend)
- AWS Amplify (Backend)
- Streamio (Chat API service)

- Anthropic API Key

# Development and Tinkering (Incomplete)

1. `npm install -g @aws-amplify/cli@12.12.2`
2. `git clone https://github.com/kiostudio/firstbot-carpenter`
3. `cd <path_to_firstbot-carpenter>`
4. `yarn install`
5. `amplify configure` or follow [AWS Amplify doc here](https://docs.amplify.aws/gen1/react/start/project-setup/prerequisites/)

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Happy Hacking!

## Production Deploy

# Provided by Firstbot

This is created by Kios Tech Inc. as a teaser for its AI platform Firstbot. You are welcomed to try it [here](https://www.firstbot.tech).
