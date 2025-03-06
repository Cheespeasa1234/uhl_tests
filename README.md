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

# How to use

## Students
Open the webpage directly. You will be prompted to accept tracking cookies. These cookies simply identify your browser to add an extra layer of identification to the grading process. If the cookie is disabled, your grade may not be tracked.

Next, input your email address. It must be the email address that you intend to submit the google form with. (It is reccommended to use a district / organization email, as the administrator likely expects an email address in that format.)

Press the button to get a test. If this is successful, a notification will appear to let you know. An error will pop up if not. A list of questions will appear below, for you to fill out. Read the question prompt, read the code (if any) provided, and in the textarea, type your response. **It is sensitive to capitalization, whitespace, and newlines.** It is mostly up to your administrator whether or not you will lose score from errors like this.

When you are ready to submit, press Submit, and wait for the pop up. It will provide you with a code, and a link to a google form. Copy the answer code (and ensure it is copied!) and open the form. Fill in the information, and **make sure you are signed in as the same email you provided when beginning the test.** Paste the answer code in where asked. There may be some other questions provided- these are not scored. Submit the google form when you are done, and return to the testing page. Press the okay button, and you are done taking your test!

Note that if you attempt to submit multiple tests, a blank test, distort or corrupt the JSON data, or attempt any other exploit like that, it is tracked and does not work.

## Teachers

Start the server, and open the admin panel. Sign in with the password you set in the settings. When you log in, you will be presented with the admin panel. Most inputs / labels have a tooltip for your assistance- simply hover over, and it will display a tip.

On the side there are three tabs of settings. These are Configure Test, View Status, and Grade Tests. They are explored further below.

### Configure Test
The configure test panel is for modifying the behavior of the test program, and for managing test taking and grading.

#### Starting & Stopping testing
The first options you see will allow you to change whether or not students are taking tests. If this checkbox is disabled, students will be given an error message should they attempt to start a test. Students will still be able to submit tests they started before you unchecked the box.

The next options enable / disable the time limit, and set the amount of minutes for the time limit. When a student starts a test, the time they start is tracked. If they submit after the time limit, it is noted when you open the grading panel. If there is no time limit, this is disabled.

#### Configuring Test Contents
In the second section of the first page, you can modify the contents of the quiz. Each quiz has a certain number of each type of question- for loop, nested for loop, and string. This process is dynamic and new types can be implemented. The input boxes store and allow you to edit the amount of each question that will be administered to students when they start a test.

To save the changes you made to the settings to a preset, select the Save Preset button. Choose either to save it to a pre-existing preset, or make a new preset. The changes you have been making will be stored under that preset and can be loaded later.

When loading a preset, the contents of the preset will overwrite your changes, and become the settings used in new tests. You can load only from a pre-existing preset, and an error will occur if you try to load from a non-existent preset.

The default preset is hard-coded into the server. When you Load from Default, the default configuration will overwrite your current changes, and become the settings used in new tests. This preset can not be edited.

The Load from Current button is used to load the configuration currently in place in the testing system. This can be used if you make a change you want to undo.

To complete your edits, press Set configuration to update the testing program. The changes you make are not saved until you complete the edits.

### View Status
The view status panel has tables of server state information. It stores the google sheet info, and the test responses.

Press refresh to download the sheet again and see the updated data.

### Grade Tests
The grading panel is where you can analyze student responses. In the input box, type in the full email of a student you want to grade- you can find some emails in the View Status panel.

After typing in the email, press Search, and it will search for the student. It will preset the results for the most recent test that follows the following requirements:
1. It must have a valid schema response
2. The emails must match
3. The time of submission must match
4. The answer code must match

Once it finds the most recent valid response, it will grade it and present it to you.

#### Grade Results UI
The top of the grade result displays the email of the student, the amount of questions they got correct, and a percentage grade as well. Below this is some information about when they submitted their test, as well as when it was due for submission. Below this is some information about how much time was remaining when the student subitted their test. This is not factored into the grade at all.

In the box, you will see the grade of the first question. It will tell you the question number, the prompt, and the code provided to the student. Below this are two boxes. The first box is what the student typed in as their response, and the second is what the computer says is the correct answer. If the left border is red on the first box, the answer is incorrect. There is also some text below this to tell you.

On the left and right are buttons to scroll through the questions. Press the right arrow button to get the next question. This cycles through, so you can press right on the last question to get to the first.