﻿(function () {
    'use strict';

    define([
            'services/data/dataservice.accessList',
            'services/data/dataservice.accessRequest',
            'services/data/dataservice.codemapping',
            'services/data/dataservice.codeset',
            'services/data/dataservice.diagnostics',
            'services/data/dataservice.organization',
            'services/data/dataservice.company',
            'services/data/dataservice.template',
            'services/data/dataservice.translation',
            'services/data/dataservice.user',
            'services/data/dataservice.userGroup',
            'services/data/dataservice.timeZone',
            'services/data/dataservice.vacancy',
            'services/data/dataservice.candidateProfile',
            'services/data/dataservice.content',
            'services/data/dataservice.quarterlyMagazine',
            'services/data/dataservice.documentLibrary',
            //'services/data/dataservice.mentoringPortal',
            'services/data/dataservice.storage',
            'services/data/dataservice.vacancyApplicant'
        ],
        function (accessList,
                  accessRequest,
                  codeMapping,
                  codeset,
                  diagnostics,
                  organization,
                  company,
                  template,
                  translation,
                  user,
                  userGroup,
                  timeZone,
                  vacancy,
                  candidateProfile,
                  content,
                  quarterlyMagazine,
                  documentLibrary,
                  //mentoringPortal,
                  storage,
                  vacancyApplicant) {
            return {
                accessList: accessList,
                accessRequest: accessRequest,
                codeMapping: codeMapping,
                codeset: codeset,
                diagnostics: diagnostics,
                company: company,
                organization: organization,
                template: template,
                translation: translation,
                user: user,
                userGroup: userGroup,
                timeZone: timeZone,
                vacancy: vacancy,
                candidateProfile: candidateProfile,
                content: content,
                quarterlyMagazine: quarterlyMagazine,
                documentLibrary: documentLibrary,
                //mentoringPortal: mentoringPortal,
                storage: storage,
                vacancyApplicant: vacancyApplicant
            };
        });
})();
