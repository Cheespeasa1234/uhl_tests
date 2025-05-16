# __these instructions are outdated. working on it, sorry__

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
Read further into this README to learn about the source code and the method of running it. Use the Projects tab to manage issues and track stuff like that. The Uhl Testing program was created by Nate Levison, but Victor Urumov is also a significant collaborator.

# Installation & Development

## Setup
First, make a codespace or a VSCode workspace of this repository, `Cheespeasa1234/uhl_tests`. A development container with the proper configurations are provided for your convenience.

In a terminal, run the following:
```sh
cd frontend
npm install
```

Then, in another terminal, run the following:
```sh
cd backend
deno install
npm install
```

The backend requires Deno. To install it on Linux, run the following:
```sh
curl -fsSL https://deno.land/install.sh
```
Ensure the content it prints is fine, then run it again:
```sh
curl -fsSL https://deno.land/install.sh | sh
```

If you use the codespace, **you do not need to do this**.

## Secrets & Files

In `backend`, create `.env`. 
1. Set `HCST_ADMIN_PASSWORD` to a passphrase for logging into the admin panel.
2. Set `HCST_PORT` to 8081, and set `HCST_HOST` to 127.0.0.1.
3. Set `HCST_GOOGLE_KEY_FILENAME` and leave it blank for now.
4. Set `HCST_FORM_URL` and leave it blank for now.
5. Set `HCST_SPREADSHEET_ID` to the ID (the first part of the URL) of your google sheet.

```env
HCST_ADMIN_PASSWORD=<YOUR ADMIN PASSWORD>
HCST_PORT=8081
HCST_HOST=127.0.0.1
HCST_GOOGLE_KEY_FILENAME=
HCST_FORM_URL=
HCST_SPREADSHEET_ID=
```

In `backend`, create folders `db`, `files`, and `secrets`.

## Google file prerequesites

For the google form / spreadsheet API, make a Google Service account. Get an email for it and give it API access to the Google Sheets API. Get the access key and download the JSON file. More information can be found [here](https://cloud.google.com/iam/docs/keys-list-get). Place that JSON file in the `secrets` folder in the backend.

The testing program uses a google form to take in submissions. First, make a google form with the EXACT same questions as you see below.

_The questions should all be mandatory, it should force authenticated email submission, and should look like below:_

![this form](image.png)

In case the image doesn't work, the form should have the following questions, aside from the mandatory email inclusion:
```
"Answer Code" - short answer
"How difficult was it?" - 1 through 5 -> Trivial - Impoppable
```

Get a shortlink for this form in the Share menu. Take this link, and set the previously mentioned `HCST_FORM_URL` to this url. Once this form is done and accessible to students, link it to a spreadsheet using the responses tab. Take the spreadsheet ID found in the URL of this new spreadsheet, and put it as the value to `HCST_SPREADSHEET_ID`. In that spreadsheet, open the Share menu, and give access to the service account email you created.

## Setting up the database
After installation, the database would be empty. All you need to do is run the following:

```sh
cd backend
deno task seedDb
```

This will create the tables in the database file, and add a hard-coded default preset and default test code to the database. If, in the future, you change the columns, you can use the sequelize migrate feature, or delete the database and run the seed script again.

## Execution

### Development Environment
To run the program, first start the backend:
```sh
cd backend
deno task dev
```

Then, start the backend, in a new terminal:
```sh
cd frontend
npm run dev -- --open
```

### Production Environment
Start the backend:
```sh
cd backend
deno task start
```

Build and start the frontend:
```sh
cd frontend
npm run build
npm run preview -- --port 8082
```

# How to use
Once you have the program up and running, you will be able to navigate to the Help page and read an article about the user experience.