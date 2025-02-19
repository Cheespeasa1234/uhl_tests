# POST /api/testing/new-test
## Request:
{
    name: string
}

## Response:
{
    success: boolean,
    message: string,
    questions: Question[]
    student: Student
}

# POST /api/testing/submit-test
## Request:
{
    studentSelf: {
        name: string,
        answers: string[],
    },
    privateKey: string
}

## Response:
{
    success: boolean,
    message: string,
    answerCode: string
}

# GET /api/grading/am_i_signed_in
## Response:
{
    success: boolean,
    message: string
}

# POST /api/grading/get_session_id
## Request
{
    pass: string
}

## Response
{
    success: boolean,
    message: string,
    data: {
        sessionId: string
    }
}
Cookies
{
    HCS_ADMIN_SID: string
}

# GET /api/grading/sessions
## Response
{
    success: boolean,
    message: string,
    data: {
        sessions: Session[] | undefined
    }
}

# GET api/grading/google-form
## Response
{
    success: boolean,
    message: string,
    data: {
        header: string[],
        rows: string[][]
    }
}

# GET api/grading/test-program
## Response
{
    success: boolean,
    message: string,
    data: {
        header: string[],
        rows: string[][]
    }
}

# GET api/grading/grade/{studentEmail}
## Response
{
    success: boolean,
    message: string,
    data: {
        grade: GradeResult
    }
}

# GET api/grading/config/get_preset/{presetName}
Get the value of a given preset.
## Response
{
    success: boolean,
    message: string,
    data: {
        preset: Preset
    }
}

# POST api/grading/config/set_preset/{presetName}
Set the value of a preset.
## Request
{
    preset: Preset
}

## Response
{
    success: boolean,
    message: string
}

# POST /api/grading/config/set_config
Set the configuration value that the testing system will use.
## Request
{
    preset: Preset
}

## Response
{
    success: boolean,
    message: string
}

# GET /api/grading/config/get_config
Get the current configuration value that the testing system is using.
## Response
{
    success: boolean,
    message: string,
    data: {
        preset: Preset
    }
}