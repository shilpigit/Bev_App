(function () {
    'use strict';

    define(['services/core/authentication',
            'services/core/config',
            'plugins/router',
            'services/core/logger',
            'services/data/dataprimer',
            'services/core/state',
            'services/data/datacontext',
            'services/core/localization',
            'services/candidateProfile',
            'services/core/instrumentation',
            'services/utilities'
        ],
        function (authentication, config, router, logger, dataprimer, state, datacontext, localization, candidateProfileSrv, instrumentationSrv, utilities) {

            var vm = {
                title: 'View Company Profile',
                activate: activate,
                utilities: utilities,
                config: config,
                loc: datacontext.translations.item,
                companies: datacontext.companies.items,
                countries: localization.getLocalizedCodeSet('country'),
                regions: localization.getLocalizedCodeSet('region'),
                expertiseIndustries: localization.getLocalizedCodeSet('expertiseIndustryCategory'),
                positions: localization.getLocalizedCodeSet('position'),
                selectedItem: ko.observable(),
                isBusy: ko.observable(false)
            };

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.getCurrentLocation = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {
                    return item.cityName() ? matches[0].name() + '/' + item.cityName() : matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }
            };
            vm.getAddressOneGoogleMapLink = function (item) {
                return 'https://www.google.com.my/maps/place/' + item.addressOne();
            };
            vm.getAddressTwoGoogleMapLink = function (item) {
                return 'https://www.google.com.my/maps/place/' + item.addressTwo();
            };
            vm.getLinkMailToCompanyOwner = function (emailAddress) {

                return 'mailto:' + emailAddress;
            };
            vm.getRegionName = function (item) {

                var matches = ko.utils.arrayFilter(vm.regions.codes, function (el) {
                    return el.codeValue() === item.regionCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }

            };
            vm.getExpertiseIndustryName = function (item) {

                var matches = ko.utils.arrayFilter(vm.expertiseIndustries.codes, function (el) {
                    return el.codeValue() === item.expertiseIndustryCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }

            };
            vm.getPositionName = function (item) {

                var matches = ko.utils.arrayFilter(vm.positions.codes, function (el) {
                    return el.codeValue() === item.positionCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }

            };
            vm.getLocationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {
                    return item.cityName() ? matches[0].name() + '/' + item.cityName() : matches[0].name();
                }
            };

            return vm;

            function activate(code) {

                instrumentationSrv.trackEvent('ViewCompanyProfile',
                    {
                        'On': 'Loaded',
                        'Code': code
                    });

                state.systemIsBusy(true);
                for (var c = 0; c < vm.companies().length; c++) {

                    if(vm.companies()[c].id() === code) {
                        vm.selectedItem(vm.companies()[c]);
                        state.systemIsBusy(false);
                        break;
                    }
                }

                if(!vm.selectedItem()){
                    state.systemIsBusy(false);
                    logger.logError('Requested Company dose not exist in our system anymore!');
                }
            }

        });
}());
