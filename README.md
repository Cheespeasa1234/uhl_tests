# About
## Overview
This repo contains the frontend and the backend of the Honors Computer Science testing program (I'm not in that class- this program is for those students). It, simply put, produces randomly generated tests of Java code, solves them itself, and grades students on their answers. It does this with its own custom bytecode-adjacent code interpreter, and an in-depth and secure API which administers tests and tracks students. It also features an administrator panel, with management and supervision features.

## Goals
The primary goals of this program are:
1. securely administer a Java programming quiz to students
2. have it be secure, and not possible to cheat with inspect element or network inspectors
3. dynamically and randomly generate code questions, and solve them as well
4. provide a secure and useful admin interface