DROP VIEW IF EXISTS view_versions 
 
CREATE VIEW view_versions
        AS  SELECT     
              CASE  B.MODL_DISPLAY_NM
                WHEN 'Kia Rio Hatchback' THEN 'rio-hatchback'
                WHEN 'Kia Rio Sedan' THEN 'rio-sedan'
                WHEN 'Nuevo Forte' THEN 'forte-sedan'
                WHEN 'Nuevo Forte Hatchback' THEN 'forte-hatchback'
                WHEN 'Sportage' THEN 'sportage'
                WHEN 'Sportage Slovakia' THEN 'sportage'
                WHEN 'Nuevo Soul' THEN 'soul-2020'
                ELSE 'No such model'END as modlNameHtml,
            B.MODL_DISPLAY_NM as modlName,
            A.MODL_CD+A.BODY_TYPE_CD as modlCd,
            A.TRIM_NM as trimNm,
            A.TM_NM as tmName,
            A.TRIM_CD+A.TM_CD as tmCd,           
            VHCL_DESC as 'desc',
            A.VHCL_YY as year
        FROM GLB_PRD_VHCL_M A
          INNER JOIN GLB_PRD_MODL_BODYTYPE_C B
          ON A.MODL_CD = B.MODL_CD AND A.BODY_TYPE_CD = B.BODY_TYPE_CD AND B.ACTV = 'Y' AND A.ACTV = 'Y'
        WHERE A.VHCL_YY >= 2020
        --order by modlNameHtml
        --FOR JSON PATH