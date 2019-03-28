(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/core/security',
            'services/core/state',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/utilities',
            'Clipboard',
            'services/core/localization'
        ],
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Graduate Recruitment Search',
                config: config,
                loc: datacontext.translations.item,
                state: state,
                utilities: utilities,
                currentUser: datacontext.user.item.user,
                companies: datacontext.companies.items,
                countries: localization.getLocalizedCodeSet('country'),
                filteredCompanies: ko.observableArray(),
                isBusy: ko.observable(false),
                searchPhrase: ko.observable(''),
                filterCompanies: filterCompanies
            };

            vm.searchPhrase.subscribe(filterCompanies, this)
            ;
            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.getRelativeIntakeDateTime = function (item) {

                if (item.dateOfIntake()) {
                    return moment(item.dateOfIntake()).fromNow();
                }
                else {
                    return 'Who Knows!';
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
            vm.includeSearchPhrase = function (item) {
                return (
                item.availablePositions() &&
                item.availablePositions().length > 0 &&
                item.availablePositions().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1 ||
                item.campaignTitle() && item.campaignTitle().length > 0 && item.campaignTitle().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1);
            };

            return vm;

            function canActivate() {

                return true;
            }

            function activate() {

                var clipboard = new Clipboard('.copy');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringEmailAddressCopiedToClipboard());
                });

                filterCompanies();

                return true;
            }

            function filterCompanies() {

                vm.filteredCompanies([]);

                for (var c = 0; c < vm.companies().length; c++) {

                    var company = vm.companies()[c].company;

                    if (company.graduateRecruitments && company.isActive()) {

                        for (var d = 0; d < company.graduateRecruitments().length; d++) {

                            var graduateRecruitment = company.graduateRecruitments()[d];

                            if (graduateRecruitment.availablePositions() && graduateRecruitment.availablePositions().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1 ||
                                graduateRecruitment.campaignTitle() && graduateRecruitment.campaignTitle().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1) {

                                vm.filteredCompanies.push(vm.companies()[c]);
                                break;

                            }
                        }
                    }
                }

                if (vm.filteredCompanies().length === 0) {
                    vm.messageDetail.type('info');
                    vm.messageDetail.message(vm.loc.stringCompanyRequirementSearchHasNoResult());
                } else {
                    vm.messageDetail.message('');
                }
            }
        });
}());
