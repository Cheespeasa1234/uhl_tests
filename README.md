# About
## Overview
This repo contains the frontend and the backend of the Honors Computer Science testing program (I'm not in that class- this program is for those students). It, simply put, produces randomly generated tests of Java code, solves them itself, and grades students on their answers. It does this with its own custom bytecode-adjacent code interpreter, and an in-depth and secure API which administers tests and tracks students. It also features an administrator panel, with management and supervision features.

## Goals
The primary goals of this program are:
1. securely administer a Java programming quiz to students
2. have it be secure, and not possible to cheat with inspect element or network inspectors
3. dynamically and randomly generate code questions, and solve them as well
4. provide a secure and useful admin interface

## To Do
1. Create grading panel UI
2. Connect admin page to admin API
3. Restyle testing page
4. Sort by class

# Installation & Development

## Setup
First, make a codespace or a VSCode workspace of this repository, `Cheespeasa1234/uhl_tests`. A development container with the proper configurations are provided for your convenience.

In a terminal, run the following:
```
deno install
```

## Secrets & Files
Make two new folders: `secrets` and `files`. These folders are invisible to Git, but make sure they are grayed out before you start adding files.

In `files`, create `presets.json`. Simply place the following into the file:
```
{}
```
into the file, to represent an empty JSON object. In the same folder, create `test_program_responses.csv` and paste in the following, without a trailing newline: 
```
name,epochTime,due,idCookie,answerCode,responseBlob
```

In `secrets`, create `.env`. Create a key `SPREADSHEET_ID` and set it equal to the ID (the first part of the URL) of your google sheet. Create another key `ADMIN_PASSWORD` and set it to a passphrase for logging into the admin panel. Create another key `GOOGLE_KEY_FILENAME` and leave it blank for now. The file should look like this:

```
SPREADSHEET_ID=<YOUR SPREADSHEET ID>
ADMIN_PASSWORD=<YOUR ADMIN PASSWORD>
GOOGLE_KEY_FILENAME=
```

With your google workspace bot account, get your authentication key. It is a JSON file. Put the JSON file in `secrets`, and take the filename, and set `GOOGLE_KEY_FILENAME` to that file's name.

## Execution
You can only execute the program from the `src` folder. To run the program, do the following:

```
cd src
deno run -A main.ts
```

The testing page will run on port `5173`. Access the admin panel by going to `/admin.html` in the browser. Ensure cookies are not blocked.