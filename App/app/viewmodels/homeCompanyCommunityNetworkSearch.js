(function () {
    'use strict';

    define([
            'services/core/config',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/state',
            'services/core/security',
            'Clipboard',
            'services/core/logger',
            'model/model',
            'services/core/instrumentation',
            'services/utilities',
            'services/core/code'
        ],
        function (config, localization, datacontext, editor, state, security, Clipboard, logger, model, instrumentationSrv, utilities) {

            var Model = function () {
                this.title = 'Community Network Search';
                this.utilities = utilities;
                this.activate = activate;
                this.currentUser = datacontext.user.item.user;
                this.loc = datacontext.translations.item;
                this.countries = localization.getLocalizedCodeSet('country');
                this.config = config;
                this.state = state;
                this.companies = datacontext.companies.items;
                this.filteredCompanies = ko.observableArray();

                this.regionCodeValue = ko.observable();
                this.expertiseIndustryCodeValue = ko.observable();
                this.positionCodeValue = ko.observable();
                this.isBusy = ko.observable(false);
                this.dataIsBound = ko.observable(false);

                this.regions = localization.getLocalizedCodeSet('region');
                this.expertiseIndustries = localization.getLocalizedCodeSet('expertiseIndustryCategory');
                this.positions = localization.getLocalizedCodeSet('position');

                this.regionCodeValue.subscribe(filterCompanies, this);
                this.expertiseIndustryCodeValue.subscribe(filterCompanies, this);
                this.positionCodeValue.subscribe(filterCompanies, this);

            };

            var vm = new Model();

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
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
            vm.getLinkMailToCompanyOwner = function (emailAddress) {

                return 'mailto:' + emailAddress;
            };
            vm.getGoogleMapLink = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {

                    return 'https://www.google.com.my/maps/place/' + (item.cityName() ? matches[0].name() + ' ' + item.cityName() : matches[0].name()) + ' ' + item.addressOne();
                }
            };
            vm.getCompanyProfileUrl = function (item) {
                return '#/viewcompanyprofile/' + item.id();
            };

            vm.startSearch = ko.command({
                execute: function (item) {

                    instrumentationSrv.trackEvent('Account', {
                        'Command': 'SearchDiscipline',
                        'Company': vm.currentUser.userName()
                    });

                    return item;

                },
                canExecute: function () {
                    return true;
                }
            });

            return vm;

            function activate() {

                if(!vm.dataIsBound()) {
                    vm.regions.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });
                    vm.expertiseIndustries.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });
                    vm.positions.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    // todo: it is going to be more All enables options. Implement a binding for it
                    vm.regions.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });
                    vm.expertiseIndustries.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });
                    vm.positions.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.dataIsBound(true);
                }

                var clipboard = new Clipboard('.copy');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringEmailAddressCopiedToClipboard());
                });

                filterCompanies();
            }

            function filterCompanies() {
                
                vm.filteredCompanies([]);

                for (var c = 0; c < vm.companies().length; c++) {

                    var company = vm.companies()[c].company;

                    if (company.disciplines && company.isActive()) {

                        for (var d = 0; d < company.disciplines().length; d++) {

                            var discipline = company.disciplines()[d];

                            if ((!vm.regionCodeValue() || discipline.regionCodeValue() === vm.regionCodeValue()) &&
                                (!vm.expertiseIndustryCodeValue() || discipline.expertiseIndustryCodeValue() === '' || discipline.expertiseIndustryCodeValue() === vm.expertiseIndustryCodeValue()) &&
                                (!vm.positionCodeValue() || discipline.positionCodeValue() === '' || discipline.positionCodeValue() === vm.positionCodeValue())) {

                                vm.filteredCompanies.push(vm.companies()[c]);
                                break;

                            }
                        }
                    }
                }

                if (vm.filteredCompanies().length === 0) {
                    vm.messageDetail.type('info');
                    vm.messageDetail.message(vm.loc.stringCommunityNetworkSearchHasNoResult());
                } else {
                    vm.messageDetail.message('');
                }
            }

        });
}());
