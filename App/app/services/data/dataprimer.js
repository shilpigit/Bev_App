(function () {
    'use strict';

    define([
            'services/core/logger',
            'services/core/config',
            'services/data/datacontext',
            'services/core/security',
            'services/core/state'],
        function (logger, config, datacontext, security, state) {

            var service = {
                getCaptions: getCaptions,
                init: init
            };

            function getCaptions() {
                return datacontext.translations.getItem(state.languageCode()).then(function () {
                });
            }

            return service;

            function init(dontShowLoading) {

                if (!dontShowLoading) {
                    state.isLoading(true);
                }

                return $.Deferred(function (def) {
                    return $.when(
                        datacontext.codeMappings.getData(),
                        datacontext.codesets.getData(),
                        datacontext.companies.getData(state.userId),
                        datacontext.timeZones.getData(),
                        datacontext.vacancies.getData(), // only current user's vacancies
                        datacontext.myVacancyApplications.getData({userAccountId: state.userId}),
                        //datacontext.candidateProfiles.getData(), // todo: check for candidates only
                        //datacontext.organizations.getData(),
                        datacontext.templates.getData(),
                        datacontext.contents.getData(),
                        datacontext.user.getItem(state.userId),
                        datacontext.documentLibrariesVitrine.getData()
                    )
                        .done(function () {

                            var isAdministrator = security.checkAdminAccess();
                            var isCompanyAdminAccess = security.checkCompanyAdminAccess(state.userId);

                            state.isAdministrator(isAdministrator);
                            state.isCompanyAdmin(isCompanyAdminAccess);
                            state.languageCode(datacontext.user.item.user.person.languageCode());
                            state.hasPendingRequest(datacontext.user.item.hasPendingRequest());
                            getCaptions();
                            state.setIsAuthenticated(true);

                            def.resolve();
                        })
                        .fail(function () {
                            state.isLoading(false);
                            logger.log('DataPrimer faced some issues');
                            def.reject();
                        }).then(function () {
                            state.isLoading(false);
                        });
                }).promise();
            }
        });
})();
