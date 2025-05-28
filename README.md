# About
## Overview
This repo contains the frontend and the backend of the Honors Computer Science testing program (I'm not in that class- this program is for those students). It, simply put, produces randomly generated tests of Java code, solves them itself, and grades students on their answers. It does this with its own custom bytecode-adjacent code interpreter, and an in-depth and secure API which administers tests and tracks students. It also features an administrator panel, with management and supervision features.

## Goals
The primary goals of this program are:
1. securely administer a Java programming quiz to students
2. have it be secure, and not possible to cheat with inspect element or network inspectors
3. dynamically and randomly generate code questions, and solve them as well
4. provide a secure and useful admin interface

## Collaboration
Read further into this README to learn about the source code and the method of running it. Use the Projects tab to manage issues and track stuff like that. The Uhl Testing program was created by Nate Levison.

# Installation

## Initialize repository

If you want to use Git, run the following:
```sh
git clone https://github.com/Cheespeasa1234/uhl_tests
```

If you want to use the codespace, make a codespace or a VSCode workspace of this repository, `Cheespeasa1234/uhl_tests`. A development container with the proper configurations are provided for your convenience.

If you use the codespace, allow it to build, which might take a few minutes. When the setup is complete, continue.

## Setup tools

To install packages, in a terminal, run the following:
```sh
cd frontend
npm install

cd ../backend
deno install
deno install npm:sequelize
deno install --allow-scripts=npm:sqlite3@5.1.7
npm install
```

This should install all the packages. After the packages and postinstall scripts have run, now you need to set up the files.

## Environment files
There are two .env files you need to create. Create the following two files: `./.env` and `./frontend/.env`. In the first, add the following text:

```env
HCST_ADMIN_PASSWORD=
HCST_PORT=
HCST_HOST=
HCST_OAUTH_CLIENT_ID=
HCST_OAUTH_CLIENT_SECRET=
HCST_OAUTH_REDIRECT_URI=
COOKIE_DOMAIN=
```

In the second, add the following text:
```env
HOST=
PORT=
PUBLIC_API=
```

First, set `HCST_ADMIN_PASSWORD` to a plaintext password you want to use to log into the admin panel. Then set `HCST_PORT` and `HCST_HOST` to the port and host to run it on. I recommend using `8081` and `0.0.0.0`.

Second, set `HOST` and `PORT` to something similar, but for the frontend. I recommend using `8082` and `127.0.0.1`.

_Note there is no specific reason I chose 0.0.0.0 and 127.0.0.1 for each respectively, I just haven't tested using different hosts and I don't want to risk it._


Then you need to decide what domain you will be running the programs on. Say the frontend will be accessible on `hcst.example.com` and the backend will be on `api.example.com`. Set `COOKIE_DOMAIN` to `example.com`, and `PUBLIC_API` to `https://api.example.com`. If you are using codespace port forwarding, use the public URLs it provides, and in the port forwarding menu, set the backend's visibility to public.

If you are using codespaces, finding out the two important URLs is easy. In the address bar, your codespace will be, say, `codespace-name-here-gibberish.github.dev`. Take the first part- `codespace-name-here-gibberish`, and for the frontend, the URL will be `https://codespace-name-here-gibberish-8082.app.github.dev`, and for the backend, the URL will be `https://codespace-name-here-gibberish-8081.app.github.dev`. You can later check the Ports tab to confirm, after following this guide further.

## Google OAuth
The next step is getting Google's OAuth set up. Navigate to `console.cloud.google.com`. If you have set up a cloud account, you won't need to set up. But accept the terms and continue if not.

Click `APIs & Services` and click `Create project`. Name the project something, it doesn't really matter. Select an organization if you want, and then create.

Click `OAuth Consent Screen` and `Get started`. Type in an app name, a support email. Go to the next section, select external. Go to the next section, and enter an email. Go to the next section and agree to the policy. Then press `Continue`.

Click `Create OAuth Client` and select the application type as Web application. Name it something. For Authorized JavaScript origins, click `Add URI` and add the public URI of the frontend. For the example given, you would use `https://hcst.example.com`. Then go to Authorized redirect URIs and add a new one. For the example given, you would use `https://hcst.example.com/oauth/callback`. Make sure the `/oauth/callback` part is in there. Click `Create`.

In the menu which lists your OAuth Clients, click on the blue link for the application you just set up. On the side, find the Client ID, and the Client secret. Go back to the first env file- `./.env`- and set the `HCST_OAUTH_CLIENT_ID` and `HCST_OAUTH_CLIENT_SECRET` properties accordingly. Also set `HCST_OAUTH_REDIRECT_URI` to the URI you put as a redirect URI above.

Now, back to the google console. On the sidebar, select Audience and navigate there. Scroll down to Test Users and click `Add users`. Add your email address and Save. This should be it for the google stuff.

## Other files
Go to the terminal in the project, and run the following:

```sh
cd backend
mkdir files
deno task seedDb
```

Now, the server is set up and you can start enabling things.

# Development
To run the server in development, you need two terminals. In the first, run this:
```sh
cd backend
deno task dev
```

If you are using codespaces, go to `Ports` near the console. It should have a 2 icon. On the first row, which in our examples has a port as `8081`, right click, hover over `Port visibility`, and set it to `Public`.

In the second, run this:
```sh
cd frontend
npm run dev -- --open
```

Now, your browser will open a new tab which has the frontend. If you get a 500 error, ensure the APIs port is public and accessible, and that the environment variable defining it is correct. Check the Ports tab to confirm.

# Production
In production, the two commands that need to run are as follows:
```sh
# ./backend
deno task start

# ./frontend
npm run build
node --env-file=.env build
```

You can use services or something like that to run these in the background. Here are the services I use:
```ini
[Unit]
Description=Uhl Testing Frontend Service

[Service]
Type=exec
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --env-file=.env build
Restart=no
WorkingDirectory=/www/uhl_tests/frontend

[Install]
WantedBy=multi-user.target
```

```ini
[Unit]
Description=Uhl Testing Backend Service

[Service]
Type=exec
ExecStart=/root/.deno/bin/deno task start
WorkingDirectory=/www/uhl_tests/backend

[Install]
WantedBy=multi-user.target
```

Here is the nginx config I use:
```nginx
# backend
server {
    listen 80;
    server_name hcst_api.example.com;
    error_log /var/log/nginx/hcst_api.example.com.error.log;

    location / {
        add_header 'Cross-Origin-Opener-Policy' 'same-origin-allow-popups' always;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;

        proxy_pass http://127.0.0.1:8081;
        proxy_redirect off;
    }
}

# frontend
server {
    listen 80;
    server_name hcst.example.com;
    error_log /var/log/nginx/hcst.example.com.error.log;

    location / {
        add_header 'Access-Control-Allow-Origin' 'same-origin' always;
        add_header 'Cross-Origin-Opener-Policy' 'same-origin-allow-popups' always;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;

        proxy_pass http://127.0.0.1:8082;
        proxy_redirect off;
    }
}
```

So that is how to get the project running as a service and all.