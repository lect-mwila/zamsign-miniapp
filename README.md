<p align="center">
  <img width="180" src="public/logo.svg" alt="ZamSign Logo">
</p>

<h1 align="center">ZamSign Telegram App</h1>


# Getting Started

## Installation

Firstly install the packages with pnpm

```bash
npm install pnpm -g
pnpm install
```

## Prerequisites and testing the app without deploying it online

Telegram Miniapps require a "valid" url to be accessed so we will trick our computers into serving https://zamsign.com to localhost by editing the hosts file and then create certificates that will be globally accepted on the browser + telegram mobile/desktop.
 
1. **Run as Administrator (Powershell)** Make sure you download and install mkcert. 

```bash
choco install mkcert
```
- If you do not have chocolatey, download it here

2. Then again, as an Administrator edit your hosts file found at `C:\Windows\System32\drivers\etc\hosts`. We are going to add the entry

```
127.0.0.1 zamsign.com 
```

3. Now in the `.perms` folder in root run the following commands:
```bash
mkcert zamsign.com localhost 127.0.0.1
mkcert -install
```

4. Ensure that the `vite.config.ts` points to the right files in the `server` section of the config.

```ts
  server: process.env.REMOTE ? {
    host: 'zamsign.com',
    https: {
      cert: readFileSync(resolve('.perms/zamsign.com+2.pem')), // <-- YOUR CERT
      key: readFileSync(resolve('.perms/zamsign.com+2-key.pem')), //  <-- YOUR KEY
    },
```

**Now you can develop the application locally with Telegram data**

Run 
```bash
pnpm run dev:https
```

and now head over to [zamsign.com](https://zamsign.com:443)

<p align="center">
  <img width="450" src="assets/zamsign_screenshot.jpg" alt="ZamSign HTTPS=true">
</p>


# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```


## Development & Contributing
To get familiar with the framework you can go through the [contributing notes here](CONTRIBUTING.md). 

### For the Web App
- **Contributing**: Fork the repository, create a feature branch, and submit a PR as usual

