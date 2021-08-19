"# cms_kmm" 


npm run dev


Review model in particular 
node .\src\generatedModelsKia.js



Validar nombre
VHCL_DESC

Configuracion de la potencia.

ADD MODEL
---------
Config in DB MySales with price. ({{HOST}}/BNP/SubmitVehicleInfo .> MYSALES_PROD)
Activated models
cmsKMM-> version
    clean 
    Import SQL Server (view_versions)
    Copy Data to versionsDataInfo.json

Review models
C:\KIA\cms_kmm>
              Config and Descomment line 329 scrapiKia(vehicleCatalog);
              node .\src\generatedModelsKia.js
              C:\KIA\cms_kmm\2021.csv (output)

ADD TO MYSALES PORTAL
---------------------
Config Ambient:
context-properties
context-datasource

Postman:
Azure/submitImageToAzure