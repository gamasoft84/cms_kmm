const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
var HashMap = require("hashmap");
const writeStream = fs.createWriteStream("2023.csv");


let structurByModel = [];
let mapImages = null;

scrapiKia = async function scrapiKIA(vehicleCatalog) {
    structurByModel = [];
    mapImages = new HashMap();
    await Promise.all(
        vehicleCatalog.map(async model =>
            await getImagesPagePrincipal(model.codeHtml, model.year)
        )
    );
    return structurByModel;
};

/**
 * Genera una estructura de imagenes para la pagina pricipal
 * @param {modelo del vehiculo} model
 */
async function getImagesPagePrincipal(model, year) {
    try {
        const $ = await request({
            uri: `https://www.kia.com/mx/showroom/${model}.html`,
            transform: (body) => cheerio.load(body),
        });


    
        //let regex = /mobile[\w_-]*.jpg|[-_]w[\w_-]*.jpg|[-]t[\w]*.jpg/;
        let regex = /mobile[\w_-]*.jpg|[-_]w[\w_-]*.jpg/;

        if(year ==='2022'){

            if(model === 'Stinger'){
                // Usp-DriveWise-1-m.jpg 
                regex = /[-]t[\w]*.jpg/;               
                console.log(model,regex);
            }
            if(model === 'forte-hatchback'){
                regex = /[\w]*-t.jpg|[\w_-]*_t.jpg|[\w]*_t.png|kia_forteSD_auto_seguridad_mobile_[\d]*.jpg/;  
            }
        }

        $("picture source").each((i, el) => {
            let data = "";
            if ($(el).attr("srcset")) {
                data = $(el).attr("srcset");
            } else {
                data = $(el).attr("data-srcset");
            }
            let url = `https://www.kia.com${data}`;

            if ((regex.test(data) || isAllow(data)) && !isNotAllow(data) && !getCoverSecondary(data)) {
                //console.log(name);
                let description = findDescriptionImage($(el));
                let name = findNameImage($(el), description);
                let category = getCategoria(url.toLowerCase(), name.toLowerCase());
                let isCover = getCoverPrincipal(url);
                if(isCover && model === "Stinger"){
                    description = 'Con el nuevo Kia Stinger, nunca dejarás de descubrir nuevas cosas. La elegancia y el estilo de este auto deportivo resaltará tu personalidad en cualquier lugar y en cualquier momento.'
                }
                if (!mapImages.get(url)) {
                    structurByModel.push({
                        model,
                        url,
                        name,
                        description,
                        category,
                        year,
                        isCover
                    });
                    mapImages.set(url, url);
                    writeStream.write(`${url}\n`);
                }
            } else {
                writeStream.write(
                    `                                              Descartado --> ${url}\n`
                );
                if(url.includes("kia_forteSD_auto_seguridad_mobile_1.jpg")){
                    console.log(url);
                    console.log('Regex',regex);
                    console.log('regex.test(data)) || isAllow(data)', (regex.test(data) || isAllow(data)));
                    console.log('regex.test(data))', regex.test(data));
                    console.log('isAllow(data)', isAllow(data));
                    console.log('!isNotAllow(data)', !isNotAllow(data));
                    console.log('!getCoverSecondary(data)',!getCoverSecondary(data));
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
}

function isAllow(image) {
    let images = [
        "configura_tu_kia_forte_GT_auto_perfil.png", 
        "kia-stinger-sh-portada-seguridad-rigidez-carroceria-t.gif",
        "Usp-performance",
        "Usp-Drive",
        "Drive-wise",
        "Usp-Confort",
        "Usp-Interior-acabados-metalicos.jpg",
        "bg_Pc_stinger_overview1_t.jpg",
        "img_Soul_safety6_m.jpg",
        "img_Soul_performance3_t.jpg",
        "2022/forte-hb/usps-seguridad/kia_forteSD_auto_seguridad_3.jpg",
        "2022/forte-hb/usps-seguridad/kia_forteSD_auto_seguridad_6.jpg"
    ];
   
    var resp = false;
    for (var i in images) {
        if (image.includes(images[i])) {
            resp = true;
            break;
        }
    }
    return resp;
}

function isNotAllow(image) {
    let images = [
        "2019/6_Desempeno/kia_sportage_auto_desempeno_1_w.jpg",
        "2019/7_USP_desempeno/kia_sportage_auto_des_3_w.jpg",
        "Kia_ForteHb_Auto_Desempeno_1_w.jpg",
        "configura_tu_kia_forte_GT_auto_perfil.png",
        "7_USP_desempeno/img_Soul_performance3_w.jpg",
        "kia_forte_auto_desempeno_4_w.jpg",
        "kia-stinger-highlights-thum-01-t.jpg",
        "img_Seltos_safety6_m.jpg",
        "2022/forte-hb/home/kia-showroom-key-visual-"
    ];
    var resp = false;
    for (var i in images) {
        if (image.includes(images[i])) {
            resp = true;
            break;
        }
    }
    return resp;
}

/**
 * Permite obtener una clasificacion para el tipo de imagen
 * @param {*} urlImage
 */
function getCategoria(urlImage, title) {
    let category = "";

    if (title.includes("modos de manejo") || title.includes("cargador") || title.includes("pantalla") || title.includes("paleta") || title.includes("aire acond") ||
        title.includes("navegaci") || title.includes("punto ciego") || title.includes("sensores") || title.includes("cajuela intel") || title.includes("camara") ||
        title.includes("de encendido") || title.includes("controles al volante") || title.includes("360") || title.includes("carril") || title.includes("crucero") ||
         title.includes("frenado")) {
        category = "TE";
    }

    if (title.includes("motor") || title.includes("transmisi")) {
        category = "PE";
    }
    
    if (title.includes("bolsa") || title.includes("ahls")) {
        category = "SA";
    }

    if (title.includes("caliper") || title.includes("rin") || title.includes("parrilla") || title.includes("escape") ) {
        category = "EX";
    }

    if (title.includes("ims") || title.includes("estribo interior")  || title.includes("harman")  || title.includes("calefacci") || title.includes("freno de estacionamiento")) {
        category = "IN";
    }

    if (!category) {
        if (urlImage.includes("exterior")  || urlImage.includes("espejo")) {
            category = "EX";
        } else if (urlImage.includes("interior") || urlImage.includes("rejilla-ventilacion")) {
            category = "IN";
        } else if (urlImage.includes("safety") || urlImage.includes("seguridad")) {
            category = "SA";
        } else if (urlImage.includes("performance") || urlImage.includes("desempenio") || urlImage.includes("desempeno") || urlImage.includes("cluster") || 
                   urlImage.includes("suspension") || urlImage.includes("difusor") || urlImage.includes("aleron") || urlImage.includes("toma-aire")) {
            category = "PE";
        } else {
            category = "S/C"; 
        }
    }
    return category;
}

function getCoverPrincipal(urlImage) {
    let covers = [
        "Forte-HB/2-exterior/kia_showroom-big-image-forte-3-w-02.jpg",
        "2022/forte-hb/kia-showroom-key-visual-ForteHb-t.jpg",
        "img_RioHB_exterior1_w.jpg",
        "img_RIO_SD_exterior1_w.jpg",
        "Img_ForteSd_Exterior1_w.jpg",
        "kia-showroom-key-visual-sportage-w.jpg",
        "bg_Pc_seltos_overview1_w.jpg ",
        "bg_Pc_soul_overview1_w.jpg",
        "kia-showroom-key-visual-sedona-w.jpg",
        "kia_optima_auto_seguridad_1_wV2.jpg",
        "kia-showroom-key-visual-w_v2.jpg",
        "kia_sorento_auto_desempeno_1_w.jpg",
        "bg_Pc_stinger_overview1_t.jpg",
        "kia_showroom-big-image-niro-1-w.jpg",
        "Portada-stinger_W.jpg"
    ];
    var resp = false;
    for (var i in covers) {
        if (urlImage.includes(covers[i])) {
            resp = true;
            break;
        }
    }
    return resp;
}

function getCoverSecondary(urlImage) {
    let covers = [
        "kia-showroom-key-visual-forteGT-w.jpg",
        "bg_Pc_RioHB_overview1_w.jpg",
        "kia-showroom-key-visual-RioSedan_w.jpg",
        "kia-showroom-key-visual-forte-W.jpg",
        "kia_showroom-big-image-sportage-3-w.jpg",
        "img_Soul_exterior1_w.jpg",
        "kia_sedona_auto_desempeno_1_w.jpg",
        "kia-showroom-key-visual-optima-w.jpg"

    ];
    var resp = false;
    for (var i in covers) {
        if (urlImage.includes(covers[i])) {
            resp = true;
            break;
        }
    }
    return resp;
}


function findNameImage(elem, description) {

    let name = elem.parent().parent().find(".imgListTit").text();

    if (!name) {
        name = elem.parent().parent().parent().find(".imgListTit").text();
    }
    if (!name) {
        name = elem.parent().parent().parent().parent().find(".btmTextTit").text();
    }
    if (!name) {
        name = elem.parent().parent().parent().find(".btmTextTit").text();
    }
    if (!name) {
        name = elem.parent().parent().parent().parent().find(".shadowBlack").first().text();
    }
    if (!name) {
        name = elem.parent().parent().parent().parent().find("h3").text();
        if(name === description){//Asigna titulo si y solo si en nombre es distinto a la description. Stinger 'ESPECTACULAR POR DONDE LO MIRES'
            name = null;
        }
    }
    if (!name) {
        name = elem.parent().parent().parent().parent().parent().find("h3").text();
        if(name === description){//Asigna titulo si y solo si en nombre es distinto a la description. Stinger 'EQUIPAMIENTO DE UN NIVEL SUPERIOR'
            name = null;
        }
    }
    if (!name) {
        name = elem.parent().parent().parent().parent().find(".subTxt").text();
    }   
    if (!name) {
        name = elem.parent().parent().parent().parent().find("videoTit").first().text();
    }
    if (!name) {
        name = elem.parent().parent().parent().parent().parent().parent().find('h3.shadowBlack').text()
    }
    name = name.replace("Manéjalo y lo entenderás.", "");
    name = name.replace("Manéjalo y lo.", "");
    name = name.replace("Más que tu auto.", "");
    name = name.replace("Prepárate para conectar con algo más grande.", "");
    return name;
}

function findDescriptionImage(elem) {
    let description = elem.parent().parent().find(".description").text();
    if (!description) {
        description = elem
            .parent()
            .parent()
            .parent()
            .parent()
            .find(".btmTextTxt")
            .text();
    }
    //Para imagenes principales
    if (!description) {
        description = elem
            .parent()
            .parent()
            .parent()
            .parent()
            .find(".subTxt")
            .text();
    }
    //Para imagenes principales
    if (!description) {
        description = elem
            .parent()
            .parent()
            .parent()
            .parent()
            .find(".imgDesc")
            .text();
    }
    if (!description) {
        description = elem
            .parent()
            .parent()
            .parent()
            .parent()
            .find(".videoTxt")
            .text();
    }
    if (!description) {
        description = elem
            .parent()
            .parent()
            .parent()
            .parent()
            .find(".shadowBlack")
            .next()
            .text();
    }
    description = description.replace("Apártalo aquí", "");
    return description;
}

var vehicleCatalog = [
    { codeHtml: "niro", year: "2023" },
    { codeHtml: "soul", year: "2021" },
    { codeHtml: "rio-hatchback", year: "2021" },
    { codeHtml: "rio-sedan", year: "2021" },
    { codeHtml: "forte-sedan", year: "2021" },
    { codeHtml: "sportage", year: "2021" },
    { codeHtml: "forte-hatchback", year: "2021" },
    { codeHtml: "seltos", year: "2021" },
    { codeHtml: "Stinger", year: "2022"},
];

//scrapiKia(vehicleCatalog);
module.exports = scrapiKia;