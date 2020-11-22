DROP VIEW IF EXISTS view_versions 

select * from view_versions
order by modlNameHtml
FOR JSON PATH

-- \r\n return car

CREATE VIEW view_versions
        AS  
        SELECT     
              CASE  B.MODL_DISPLAY_NM
                WHEN 'Kia Rio Hatchback' THEN 'rio-hatchback'
                WHEN 'Kia Rio Sedan' THEN 'rio-sedan'
                WHEN 'Nuevo Forte' THEN 'forte-sedan'
                WHEN 'Nuevo Forte Hatchback' THEN 'forte-hatchback'
                WHEN 'Sportage' THEN 'sportage'
                WHEN 'Sportage Slovakia' THEN 'sportage'
                WHEN 'Nuevo Soul' THEN 'soul'
                WHEN 'Seltos' THEN 'seltos'
                WHEN 'Sedona (7 Pasajeros)' THEN 'kia-sedona'
                WHEN 'Sedona (8 Pasajeros)' THEN 'kia-sedona'
                WHEN 'Kia Optima' THEN 'kia-optima'
                WHEN 'Sorento' THEN 'sorento'
                WHEN 'Niro' THEN 'niro'
                WHEN 'Stinger' THEN 'Stinger'
                ELSE 'No such modlNameHtml'END as modlNameHtml,
            CASE  B.MODL_DISPLAY_NM
                WHEN 'Kia Rio Hatchback' THEN 'Rio Hatchback'
                WHEN 'Kia Rio Sedan' THEN 'Rio Sedan'
                WHEN 'Nuevo Forte' THEN 'Forte Sedan'
                WHEN 'Nuevo Forte Hatchback' THEN 'Forte Hatchback'
                WHEN 'Sportage' THEN 'Sportage'
                WHEN 'Sportage Slovakia' THEN 'Sportage'
                WHEN 'Nuevo Soul' THEN 'Soul'
                WHEN 'Seltos' THEN 'Seltos'
                WHEN 'Sedona (7 Pasajeros)' THEN 'Sedona'
                WHEN 'Sedona (8 Pasajeros)' THEN 'Sedona'
                WHEN 'Kia Optima' THEN 'Optima'
                WHEN 'Sorento' THEN 'Sorento'
                WHEN 'Niro' THEN 'Niro'
                WHEN 'Stinger' THEN 'Stinger'
                ELSE 'No such modlName'END as modlName,
            A.MODL_CD+A.BODY_TYPE_CD as modlCd,
            A.TRIM_NM as trimNm,
            A.TM_NM as tmName,
            A.TRIM_CD+A.TM_CD as tmCd,           
            VHCL_DESC as 'desc',
            A.VHCL_YY as year,
            TRIM(REPLACE(
                 REPLACE(
                    REPLACE( CONCAT( A.TRIM_NM,  ' ' , A.TM_NM),'7 VELOCIDADES FWD', ''),
                    '8 VELOCIDADES 2WD', '')
                        ,'6 VELOCIDADES FWD', '')) as version
        FROM GLB_PRD_VHCL_M A
          INNER JOIN GLB_PRD_MODL_BODYTYPE_C B
          ON A.MODL_CD = B.MODL_CD AND A.BODY_TYPE_CD = B.BODY_TYPE_CD AND B.ACTV = 'Y' AND A.ACTV = 'Y'
        WHERE A.VHCL_YY >= 2020
        --order by modlNameHtml
        --FOR JSON PATH