import { Preset, Test, Submission } from "./db.ts";

const [ preset, created ] = await Preset.findOrCreate({
    where: {
        id: 0,
    },
    defaults: {
        id: 0,
        name: "DEFAULT",
        blob: `{"Sum Prod Loop":{"valueType":"number","key":"Sum Prod Loop","value":0},"For Loop Count":{"valueType":"number","key":"For Loop Count","value":2},"Nested For Loop Count":{"valueType":"number","key":"Nested For Loop Count","value":1},"String Count":{"valueType":"number","key":"String Count","value":2}}`
    }
});

if (created) {
    console.log("DEFAULT preset created.");
} else {
    console.log("DEFAULT preset already exists.");
}

const [ test, created2 ] = await Test.findOrCreate({
    where: {
        id: 0,
    },
    defaults: {
        id: 0,
        code: "DEFAULT_TEST",
        presetId: 0,
        enabled: false,
    }
});

if (created2) {
    console.log("DEFAULT_TEST test created.");
} else {
    console.log("DEFAULT_TEST test already exists.")
}