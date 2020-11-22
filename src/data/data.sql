DROP VIEW IF EXISTS view_versions 

select * from view_versions
order by modlNameHtml
FOR JSON PATH

-- \r\n return car

CREATE VIEW view_versions
        AS  
        SELECT     
              CASE  B.MODL_DISPLAY_NM
                WHEN 'Rio Hatchback' THEN 'rio-hatchback'
                WHEN 'Rio Sedan' THEN 'rio-sedan'
                WHEN 'Nuevo Forte' THEN 'forte-sedan'
                WHEN 'Nuevo Forte Hatchback' THEN 'forte-hatchback'
                WHEN 'Sportage' THEN 'sportage'
                WHEN 'Sportage' THEN 'sportage'
                WHEN 'Nuevo Soul' THEN 'soul'
                WHEN 'Seltos' THEN 'seltos'
                WHEN 'Sedona' THEN 'kia-sedona'
                WHEN 'Sedona' THEN 'kia-sedona'
                WHEN 'Optima' THEN 'kia-optima'
                WHEN 'Sorento' THEN 'sorento'
                WHEN 'Niro' THEN 'niro'
                WHEN 'Stinger' THEN 'Stinger'
                ELSE 'No such model'END as modlNameHtml,
            B.MODL_DISPLAY_NM as modlName,
            A.MODL_CD+A.BODY_TYPE_CD as modlCd,
            A.TRIM_NM as trimNm,
            A.TM_NM as tmName,
            A.TRIM_CD+A.TM_CD as tmCd,           
            A.MODL_CD+A.BODY_TYPE_CD +  A.TRIM_CD+A.TM_CD as modlCdTmCd,
            VHCL_DESC as 'desc',
            A.VHCL_YY as year,
            TRIM(REPLACE(
                 REPLACE(
                    REPLACE( CONCAT( A.TRIM_NM,  ' ' , A.TM_NM),'7 VELOCIDADES FWD', ''),
                    '8 VELOCIDADES 2WD', '')
                        ,'6 VELOCIDADES FWD', '')) as version,
            D.VHCL_LOCAL_SALS_CD AS localSalesCd
        FROM GLB_PRD_VHCL_M A
          INNER JOIN GLB_PRD_MODL_BODYTYPE_C B ON A.MODL_CD = B.MODL_CD AND A.BODY_TYPE_CD = B.BODY_TYPE_CD AND B.ACTV = 'Y' AND A.ACTV = 'Y'
          LEFT JOIN GLB_PRD_VHCL_FNC_MAPP D ON D.VHCL_ID = A.VHCL_ID
        WHERE A.VHCL_YY >= 2020
        --order by modlNameHtml
        --FOR JSON PATH
        
        