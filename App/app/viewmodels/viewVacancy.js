(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/security',
            'services/core/localization',
            'services/core/state',
            'model/model',
            'services/vacancy',
            'services/core/instrumentation',
            'services/utilities',
            'viewmodels/behaviors/editor'
        ],
        function (app, router, logger, config, dataservice, datacontext, security, localization, state, model, vacancySrv, instrumentationSrv, utilities) {
            var vm = {
                title: 'View Vacancy',
                canActivate: canActivate,
                activate: activate,
                utilities: utilities,
                config: config,
                loc: datacontext.translations.item,
                countries: ko.observable(),
                companies: datacontext.companies.items,
                vacancy: datacontext.vacancy.item,
                myApplications: datacontext.myVacancyApplications.items,
                state: state,
                companyContainer: ko.observable(),
                userId: ko.observable(),
                userName: ko.observable(),
                countryCodeValue: ko.observable(),
                orderByCodeValue: ko.observable(),
                isBusy: ko.observable(false),
                applyForVacancyCmd: applyForVacancyCmd
            };

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.getLocationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.company.countryCodeValue();
                });

                if (matches.length > 0) {
                    return item.company.cityName() ? matches[0].name() + '/' + item.company.cityName() : matches[0].name();
                }
            };

            vm.userCanApply = function () {

                var matches = ko.utils.arrayFilter(vm.myApplications(), function (el) {
                    return el.userAccountId() === vm.userId() && el.vacancyId() === vm.vacancy.id();
                });

                if (matches.length > 0) {
                    return false;
                }
                else {
                    return true;
                }
            };

            function applyForVacancyCmd() {

                instrumentationSrv.trackEvent('UserVacancySearch',
                    {
                        'Command': 'ApplyForVacancy',
                        'JobTitle': vm.vacancy.jobTitle(),
                        'User': vm.userName()
                    });

                vm.isBusy(true);

                vacancySrv.applyForVacancy(vm.vacancy.id(), vm.userId()).done(function () {
                    vm.isBusy(false);
                });

            }

            return vm;

            function activate(code) {

                vm.userId(datacontext.user.item.user.id());
                vm.userName(datacontext.user.item.user.userName());

                vm.countries(localization.getLocalizedCodeSet('country'));

                instrumentationSrv.trackEvent('ViewVacancy',
                    {
                        'On': 'Loaded',
                        'Code': code
                    });

                state.systemIsBusy(true);

                datacontext.vacancy.getItem(code).then(function () {

                    for (var c = 0; c < vm.companies().length; c++) {

                        if (vm.companies()[c].id() === vm.vacancy.companyId()) {
                            vm.companyContainer(vm.companies()[c]);
                            state.systemIsBusy(false);

                            break;
                        }
                    }

                    state.systemIsBusy(false);

                });
            }

            function canActivate() {
                if (!state.isAuthenticated()) {
                    router.navigate('/');
                    return false;
                }
                return true;
            }

        });
}());
