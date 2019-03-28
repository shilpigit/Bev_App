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
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization, editor, model, instrumentationSrv) {
            var Model = function () {
                this.activate = activate;
                this.canActivate = canActivate;
                this.utilities = utilities;
                this.title = 'Innovative Portal Search';
                this.config = config;
                this.loc = datacontext.translations.item;
                this.state = state;
                this.currentUser = datacontext.user.item.user;
                this.companies = datacontext.companies.items;
                this.filteredCompanies = ko.observableArray();
                this.countryCode = ko.observable('');
                this.countries = localization.getLocalizedCodeSet('country');
                this.seekingCodeValues = ko.observable(''); 
                this.seeking = localization.getLocalizedCodeSet('seeking');
                this.parent = ko.observable();
                this.userId = ko.observable();


                this.isBusy = ko.observable(false);
                this.hasResult = ko.observable();
                this.filterCompanies = filterCompanies;
                this.filteredRedundantProfile = ko.observableArray();                
                this.searchPhrase = ko.observable();
                this.startSearch = startSearch;

                this.resourceTypeCodeValue = getResourceValue;

            };
            var vm = new Model();

           
            vm.countryCode.subscribe(filterCompanies, this);
            vm.searchPhrase.subscribe(filterCompanies, this);
            

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            
            function getResourceValue() {
                //if (datacontext.candidateProfiles.items.length != 0)
                if (vm.companies.length != 0)
                    return 'candidateProfile';
                else
                    return 'company';
            }  

            vm.getCompanyProfileUrl = function (item) {
                return '#/viewcompanyprofile/' + item.id();
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

            vm.getLocationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {
                    return item.cityName() ? matches[0].name() + '/' + item.cityName() : matches[0].name();
                }
            };

            vm.includeSearchPhrase = function (item) {
                if ((item.innovativePortal.description() === '' && item.innovativePortal.description().length > 0 && item.innovativePortal.description.toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1) &&
                    (item.innovativePortal.idea() === '' && item.innovativePortal.idea().length > 0 && item.innovativePortal.idea.toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1)
                ) {
                    return true;
                }
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

                vm.countries.codes.push({
                    codeValue: ko.observable(''),
                    //name: ko.observable(vm.loc.stringAll()),
                    codeSetId: ko.observable(''),
                    sortOrder: ko.observable(-1)
                });              
                
                filterCompanies();

                return true;
            }

            function filterCompanies() {

                vm.filteredCompanies([]);
                vm.filteredRedundantProfile([]);

                for (var c = 0; c < vm.companies().length; c++) {

                    var company = vm.companies()[c].company;
                    if (company.innovativePortalContainers) {

                        for (var d = 0; d < company.innovativePortalContainers().length; d++) {
                            var innovativePortalContainers = company.innovativePortalContainers()[d];
                            //innovativePortal                              
                            if (!vm.countryCode() && !vm.searchPhrase()) {
                                vm.filteredCompanies.push(vm.companies()[c]);
                                vm.filteredRedundantProfile.push(company.innovativePortalContainers()[d].innovativePortal);
                            }
                            debugger
                            var x = vm.searchPhrase().toLowerCase();
                           
                            if ((innovativePortalContainers.innovativePortal.description() && innovativePortalContainers.innovativePortal.description().length > 0 && innovativePortalContainers.innovativePortal.description().indexOf(vm.searchPhrase()) > -1) ||
                                (innovativePortalContainers.innovativePortal.idea() && innovativePortalContainers.innovativePortal.idea().length > 0 && innovativePortalContainers.innovativePortal.idea().indexOf(vm.searchPhrase()) > -1) ||
                                (innovativePortalContainers.innovativePortal.countryCode() === vm.countryCode())
                            ) 
                            {
                                vm.filteredCompanies.push(vm.companies()[c]);
                                vm.filteredRedundantProfile.push(company.innovativePortalContainers()[d].innovativePortal);
                                //break;

                            }
                        }
                    }
                }                
                if (vm.filteredRedundantProfile().length === 0) {
                    vm.messageDetail.type('info');
                    vm.messageDetail.message(vm.loc.stringCompanyRequirementSearchHasNoResult());
                } else {
                    vm.messageDetail.message('');
                }
            }

            function startSearch() {
                debugger
                filterCompanies();
                utilities.scrollToElement($('#searchResult'));
            }

        });
}());
