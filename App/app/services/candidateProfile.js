(function () {
    'use strict';

    define(['services/core/logger',
            'services/data/datacontext',
            'services/data/dataservice',
            'services/core/security',
            'model/model',
            'services/core/localization'],
        function (logger, datacontext, dataserivce, security, model,localization) {

            var service = {
                getCurrentUserCandidateProfileContainer: getCurrentUserCandidateProfileContainer,
                getSecondLevelExperienceDisciplines: getSecondLevelExperienceDisciplines
            };

            return service;

            function getSecondLevelExperienceDisciplines(experienceDisciplineSecondLevelCodeValue) {                
                if (experienceDisciplineSecondLevelCodeValue === 'geoscienceAndPetroleum') {
                    return localization.getLocalizedCodeSet('nDASummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'drillingRig') {
                    return localization.getLocalizedCodeSet('nDBSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'production') {
                    return localization.getLocalizedCodeSet('nDCSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'manufacturingOEM') {
                    return localization.getLocalizedCodeSet('nDDSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'ePCM') {
                    return localization.getLocalizedCodeSet('nDESummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'subseaOperations') {
                    return localization.getLocalizedCodeSet('nDFSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'onshoreOperationsProjectControls') {
                    return localization.getLocalizedCodeSet('nDGSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'maintenance') {
                    return localization.getLocalizedCodeSet('nDHSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'maritime') {
                    return localization.getLocalizedCodeSet('nDISummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'refineryOperations') {
                    return localization.getLocalizedCodeSet('nDJSummaryOfExperienceCategory');
                }
                else if (experienceDisciplineSecondLevelCodeValue === 'trades') {
                    return localization.getLocalizedCodeSet('nDKSummaryOfExperienceCategory');
                }
                else {
                    return localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');
                }
            }

            function getCurrentUserCandidateProfileContainer(profile) {

                // this *** does not work!
                return $.Deferred(function (def) {
                    dataserivce.candidateProfile.getCurrentUserCandidateProfileContainer({
                        success: function (dto) {
                            var item = new model.CandidateProfileContainer();
                            item.update(dto);

                            def.resolve();

                            profile.push(item);
                            return item;
                        },
                        error: function () {
                            logger.log('Get Candidate Profile Container Error');
                            def.reject();
                        }
                    });
                }).promise();
            }

        });
})();
