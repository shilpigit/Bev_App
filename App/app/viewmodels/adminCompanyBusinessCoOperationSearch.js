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
            'services/core/localization',        
            'viewmodels/behaviors/editor',
            'services/core/state',
            'model/model',
            'services/core/instrumentation',
            'services/core/code'
        ],
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization ,editor, model, instrumentationSrv ) {
            var Model = function () {
                this.title = 'Redundancy Portal Search';
                this.utilities = utilities;
                this.activate = activate;
                this.canActivate = canActivate;               
                this.currentUser = datacontext.user.item.user;
              
                this.loc = datacontext.translations.item;
                this.countries = localization.getLocalizedCodeSet('country');
                this.config = config;
                this.state = state;
                
                this.companies = datacontext.companies.items;
                this.filteredCompanies = ko.observableArray();
                this.companyRequirementSections = localization.getLocalizedCodeSet('companyRequirementSection');
               
                this.isBusy = ko.observable(false);
                this.searchPhrase = ko.observable('');
                this.sectionCodeValue = ko.observable();

                this.regionCodeValue = ko.observable();
                this.expertiseIndustryCodeValue = ko.observable();
                this.dataIsBound = ko.observable(false);

                this.regions = localization.getLocalizedCodeSet('region');
                this.expertiseIndustries = localization.getLocalizedCodeSet('expertiseIndustryCategory');

                this.regionCodeValue.subscribe(filterCompanies, this);
                this.expertiseIndustryCodeValue.subscribe(filterCompanies, this);

                this.filterCompanies = filterCompanies;
                
            };
            var vm = new Model();

            vm.searchPhrase.subscribe(filterCompanies, this);
            vm.regionCodeValue.subscribe(filterCompanies, this);
            vm.expertiseIndustryCodeValue.subscribe(filterCompanies, this);
            vm.sectionCodeValue.subscribe(filterCompanies, this);

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
            vm.summarizeDescription = function (item) {

                if (item.description()) {
                    return utilities.trimByWord(item.description(), 20);
                }
                else {
                    return 'Who Knows!';
                }

            };
            vm.getRelativePostedDateTime = function (item) {

                if (item.createdDateTime()) {
                    return moment(item.createdDateTime()).fromNow();
                }
                else {
                    return 'Who Knows!';
                }

            };
            vm.getRelativeExpiresOnDateTime = function (item) {

                if (item.expireDateTime()) {
                    return moment(item.expireDateTime()).fromNow();
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
            vm.getCompanyRequirementSectionName = function (item) {

                var matches = ko.utils.arrayFilter(vm.companyRequirementSections.codes, function (el) {
                    return el.codeValue() === item.sectionCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
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
                return ((!vm.sectionCodeValue() || item.sectionCodeValue() === vm.sectionCodeValue()) &&
                ((!vm.searchPhrase() || (item.description() && item.description().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1)) ||
                (!vm.searchPhrase() || (item.subject() && item.subject().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1))));
                //return (item.description() && item.description().length > 0 && item.description().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1
                //|| item.subject() && item.subject().length > 0 && item.subject().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1);
            };

            return vm;

            function canActivate() {

                return true;
            }

            function activate() {
                
                vm.regions.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });
                //vm.regions.codes.push({
                //    codeValue: ko.observable(''),
                //    name: ko.observable('All'),
                //    codeSetId: ko.observable(''),
                //    sortOrder: ko.observable(-1)
                //});
                //vm.expertiseIndustries.codes.push({
                //    codeValue: ko.observable(''),
                //    name: ko.observable('All'),
                //    codeSetId: ko.observable(''),
                //    sortOrder: ko.observable(-1)
                //});
                //vm.companyRequirementSections.codes.push({
                //    codeValue: ko.observable(''),
                //    name: ko.observable('All'),
                //    codeSetId: ko.observable(''),
                //    sortOrder: ko.observable(-1)
                //});

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

                    if (company.requirements && company.isActive()) {

                        for (var d = 0; d < company.requirements().length; d++) {
                            var discipline = company.disciplines()[d];
                            var requirement = company.requirements()[d];
                            
                            if ((!vm.regionCodeValue() || discipline.regionCodeValue() === vm.regionCodeValue()) &&
                                (!vm.expertiseIndustryCodeValue() || requirement.expertiseIndustryCodeValue() === '' || discipline.expertiseIndustryCodeValue() === vm.expertiseIndustryCodeValue()) &&
                                (!vm.sectionCodeValue() || requirement.sectionCodeValue() === vm.sectionCodeValue()) &&
                                ((!vm.searchPhrase() || (requirement.description() && requirement.description().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1)) ||
                                (!vm.searchPhrase() || (requirement.subject() && requirement.subject().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1)))) {

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
