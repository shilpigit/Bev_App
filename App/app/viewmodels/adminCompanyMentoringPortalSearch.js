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
                this.title = 'Mentoring Portal Search';
                this.activate = activate;
                this.currentUser = datacontext.user.item.user;
                this.loc = datacontext.translations.item;
                this.utilities = utilities;
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
                this.filterCompanies = filterCompanies;
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

                    instrumentationSrv.trackEvent('Mentoring Portal ', {
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

                if (!vm.dataIsBound()) {

                    vm.regions.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });
                    vm.expertiseIndustries.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });
                    vm.positions.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

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

                    if (company.mentoringPortal && company.isActive() && company.isParticipatingInMentoring()) {

                        vm.filteredCompanies.push(vm.companies()[c]);
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
