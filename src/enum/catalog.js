const Version = require("../models/Version");
var HashMap = require("hashmap");

const featureCategory = [{
        name: "Exterior",
        abbreviation: "GFCFCEX",
        code: "EX",
    },
    {
        name: "Interior",
        abbreviation: "GFCFCIN",
        code: "IN",
    },
    {
        name: "Technology",
        abbreviation: "GFCFCTE",
        code: "TE",
    },
    {
        name: "Performance",
        abbreviation: "GFCFCPE",
        code: "PE",
    },
    {
        name: "Safety",
        abbreviation: "GFCFCSA",
        code: "SA",
    },
    {
        name: "MediaLink",
        abbreviation: "GFCFCML",
        code: "ML",
    },
];

const yearCatalog = [{
        name: "2021",
        codeYear: "2021",
    },
    {
        name: "2020",
        codeYear: "2020",
    },
];

const mapVersions = new HashMap();
mapVersions.set("L T/M", 1);
mapVersions.set("L CVT", 2);
mapVersions.set("L T/A", 3);
mapVersions.set("LX T/M", 4);
mapVersions.set("LX T/A", 5);
mapVersions.set("LX CVT", 6);
mapVersions.set("EX T/M", 7);
mapVersions.set("EX T/A", 8);
mapVersions.set("EX CVT", 9);
mapVersions.set("EX DCT", 10);
mapVersions.set("EX PACK T/A", 11);
mapVersions.set("EX PACK CVT", 12);
mapVersions.set("S PACK T/M", 13);
mapVersions.set("S PACK T/A", 14);
mapVersions.set("GT-line T/M", 15);
mapVersions.set("GT-line CVT", 16);
mapVersions.set("GT T/M", 17);
mapVersions.set("GT DCT", 18);
mapVersions.set("SX T/M", 19);
mapVersions.set("SX T/A", 20);
mapVersions.set("SX CVT", 21);
mapVersions.set("SX DCT", 22);
mapVersions.set("SXL T/M", 23);
mapVersions.set("SXL T/A", 24);
mapVersions.set("SXL DCT", 25);

getVehicleCatalog = async function getCatalogVersions() {
    versions = await Version.aggregate([
        // { $match: { year: "2020" } },
        {
            $project: {
                modlName: "$modlName",
                modlNameHtml: "$modlNameHtml",
                year: "$year",
            },
        },
        {
            $group: {
                _id: { codeHtml: "$modlNameHtml", name: "$modlName", year: "$year" },
            },
        },
        { $sort: { "_id.name": 1 } },
    ]);

    //console.log(versions);

    let catalog = [];
    versions.forEach((e) => {
        catalog.push(e._id);
    });
    return catalog;
};

module.exports = {
    featureCategory,
    getVehicleCatalog,
    yearCatalog,
    mapVersions,
};