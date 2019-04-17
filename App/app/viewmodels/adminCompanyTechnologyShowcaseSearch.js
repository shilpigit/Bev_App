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
                this.title = 'Technology Portal Search';
                this.config = config;
                this.loc = datacontext.translations.item;
                this.state = state;
                this.currentUser = datacontext.user.item.user;
                this.companies = datacontext.companies.items;
                this.filteredCompanies = ko.observableArray();
                this.countries = localization.getLocalizedCodeSet('country');
                this.countryCode = ko.observable();                            
                this.parent = ko.observable();
                this.userId = ko.observable();

                this.isBusy = ko.observable(false);
                this.hasResult = ko.observable();
                this.filterCompanies = filterCompanies;
                this.filteredTechnologyProfile = ko.observableArray();
                this.searchPhrase = ko.observable('');
                this.startSearch = startSearch;
                this.category = ko.observable('');
                this.attach = ko.observable();

                this.resourceTypeCodeValue = getResourceValue;
            };

            var vm = new Model();
            vm.countryCode.subscribe(filterCompanies, this);
            vm.searchPhrase.subscribe(filterCompanies, this);
            vm.category.subscribe(filterCompanies, this);
            vm.attach.subscribe(filterCompanies, this);


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

            vm.includeSearchPhrase = function (item) {
                if ((item.technologyPortal.description() === '' && item.technologyPortal.description().length > 0 && item.technologyPortal.description.toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1)
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
                vm.filteredTechnologyProfile([]);

                for (var c = 0; c < vm.companies().length; c++) {

                    var company = vm.companies()[c].company;
                    if (company.technologyPortalContainers) {
                        
                        for (var d = 0; d < company.technologyPortalContainers().length; d++) {
                            var technologyPortalContainers = company.technologyPortalContainers()[d];
                                                       
                            if (!vm.countryCode() && !vm.searchPhrase() && !vm.category()) {                                
                                vm.filteredCompanies.push(vm.companies()[c]);
                                vm.filteredTechnologyProfile.push(company.technologyPortalContainers()[d].technologyPortal);
                            }
                            else if (!vm.searchPhrase() && !vm.category()) {
                                if ((technologyPortalContainers.technologyPortal.countryCode() === vm.countryCode())
                                ) {
                                    vm.filteredCompanies.push(vm.companies()[c]);
                                    vm.filteredTechnologyProfile.push(company.technologyPortalContainers()[d].technologyPortal);
                                }
                            }
                            else if (!vm.countryCode() && !vm.searchPhrase())
                            {
                                if (technologyPortalContainers.technologyPortal.category().toLowerCase().indexOf(vm.category().toLowerCase()) > -1
                                ) {
                                    vm.filteredCompanies.push(vm.companies()[c]);
                                    vm.filteredTechnologyProfile.push(company.technologyPortalContainers()[d].technologyPortal);
                                }
                            }
                            else if (!vm.searchPhrase()) {
                                if (technologyPortalContainers.technologyPortal.countryCode() === vm.countryCode() 
                                    && technologyPortalContainers.technologyPortal.category().toLowerCase().indexOf(vm.category().toLowerCase()) > -1
                                ) {
                                    vm.filteredCompanies.push(vm.companies()[c]);
                                    vm.filteredTechnologyProfile.push(company.technologyPortalContainers()[d].technologyPortal);
                                }
                            }
                            else if ((technologyPortalContainers.technologyPortal.description()
                                && technologyPortalContainers.technologyPortal.description().length > 0
                                && technologyPortalContainers.technologyPortal.description().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1) ||                                
                                (technologyPortalContainers.technologyPortal.countryCode() === vm.countryCode())
                            ) {
                                vm.filteredCompanies.push(vm.companies()[c]);
                                vm.filteredTechnologyProfile.push(company.technologyPortalContainers()[d].technologyPortal);

                            }
                            
                            if (company.technologyPortalContainers()[d].technologyPortal.catalogueFileId())
                                vm.attach = config.root + 'api/storage/redirect?id=';// + company.technologyPortalContainers()[d].technologyPortal.catalogueFileId();
                        }
                    }
                }
                if (vm.filteredTechnologyProfile().length === 0) {
                    vm.messageDetail.type('info');
                    vm.messageDetail.message(vm.loc.stringCompanyRequirementSearchHasNoResult());
                } else {
                    vm.messageDetail.message('');
                }
            }

            function startSearch() {
                filterCompanies();
                utilities.scrollToElement($('#searchResult'));
            }

        });
}());
