# WebAuthn Demo

## Setup

Make sure you have [Node Version Manager](https://github.com/nvm-sh/nvm) installed and ready to go, as well as
[docker](https://docs.docker.com/engine/install/).

Also, please use `pnpm` as your package manager. If you do not have `pnpm` yet, you can it install it with

```shell
npm i -g pnpm
```

In your terminal, execute the following command to set the correct node version

```shell
nvm use
```

Start the project with

```shell
pnpm dev
```

# WebAuthn: it's time to forget your passwords

## What is WebAuthn

Since March 2019, 
the [W3C](https://venturebeat.com/security/w3c-approves-webauthn-as-the-web-standard-for-password-free-logins/) announced
that WebAuthn is the official web standard for password-free login.

It is a browser-based API that allows web applications to simplify and secure user authentication.
This is done by using registered devices (such as phones, laptops) or biometrics (such as fingerprint) as factors.
WebAuthn uses public key cryptography to protect users from advanced phishing attacks.

### Why do the current methods fail us?

#### Usernames and passwords

We're all familiar with the original way of authentication: using usernames and passwords.
Although this system is easy to understand for the common users, it has its flaws.

Credentials are easily forgotten,
people would write down their password somewhere if they didn't use a password manager, ...

It was found that this way of authentication was not the safest way and the need for a more secure authentication system
rose.

#### 2FA

An extra authentication step was introduced with 2FA, or two-factor authentication.
This extra step makes it harder for people with malicious intent to steal your password data and take over your
accounts.

However, popular, low-assurance second factors like SMS and email are vulnerable to phishing attacks.

### Benefits of using WebAuthn

Now, some benefits will be addressed. 
These will be split up by customers (web-application users) and product owners and security teams
(web-application owners).

Let's see how WebAuthn provides both parties with its benefits.

#### Web-application users

1. WebAuthn completely removes the need for passwords.
For users, this means not having to remember their login credentials, or requesting an OTP (ont-time password) when 
using that as second factor.
The authentication flow is simplified to just use the registered device.

2. Customers are giving you their information. They want to know their data is safe when they share it.
WebAuthn subverts associated with passwords and therefore is a much more secure authentication method.

#### Web-application owners

1. Product owners care about the use of their application, removing customer-facing barriers, 
like complex authentication, is one of their highest priorities.
WebAuthn contributes to a better login experience.

2. Security teams need to be less involved. Since the private key never leaves the user's device,
the risk of [spoofing](https://usa.kaspersky.com/resource-center/definitions/spoofing) authentication is lower.
The only way to get access to an account is by physically stealing the registered device.

### How does it work?

So when WebAuthn removes the need for actual passwords, how does it go about authenticating the user? 
How does it actually do the things it is doing?

WebAuthn has three main components that make all the magic happen:
- the authenticator
- the browser
- and the web server

#### Authentication process

Using those three components, the authentication process can be explained as follows:

1. The user goes to the browser to initiate the login
2. The web server receives this login request and creates a unique challenge and sends it to the authenticator
3. The authenticator receives this challenges, including the domain name for the challenge
4. Authenticator receives biometric consent / passkey from the user
5. Authenticator generates a cryptographic signature (public - private keypair) which is sent back to the web server
6. The web server verifies the signature to the unique challenge and logs the user in when verified

![authentication process](https://gist.github.com/assets/42315197/4f38a8ce-13c3-467d-94c6-0e026eef1709)

More information about the technical specs can be found [here](https://www.w3.org/TR/webauthn/) 

### Drawbacks

I can already hear you think: 
"WebAuthn, okay, all nice. But what if I lose my device on which my private key is stored?"
The answer is simple: you will be locked out of your account, with no way to recover it.

That is why it is important to have a way to recover it.
Here are some ways to do that:
- register multiple devices
- use a password manager like 1password to store your private key in (this can also be used with multiple devices)

### Browser support?

WebAuthn is [supported in all major browsers](https://caniuse.com/?search=webauthn), except for 
- Firefox: partial support because TouchID is not yet being supported.

Some smaller browsers
- Firefox for android: not supported when a PIN is set
- Opera mini: no support at all
- IE: no support at all, but it's IE after all 🙈

### What does the future bring?

Authentication is shifting more and more towards passwordless.
Accounts will be more secure and the risk of account takeovers and limited user experience will be problems of the past.

![authentication timeline](https://gist.github.com/assets/42315197/2fde34f4-59e4-49d9-b674-8512658ffb08)

### Useful links

- https://www.okta.com/blog/2019/03/what-is-webauthn/
- https://dev.to/dagnelies/webauthn-what-if-i-loose-my-device-1lbh
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
- https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API

## Technical notes:

### Next-auth package

The popular authentication package 'next-auth' has a provider for the WebAuthn module.
However, there are many limitations:

- I started this project with drizzle as database adapter, but the package only works with `prisma v1.3.0 and later`.
This is a huge restriction for me personally
- Only works with `next-auth v5-beta.8` or above!
- The documentation itself says that this module is not yet production ready!
- You have to set an experimental flag in your next-auth configuration `experimental: { enableWebAuthn: true },`
