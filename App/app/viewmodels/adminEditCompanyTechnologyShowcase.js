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
        'model/model',
        'services/core/instrumentation',
        'services/core/code'
    ],
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization, editor, model, instrumentationSrv) {

            var Model = function () {
                this.loc = datacontext.translations.item;
                this.config = config;
                this.state = state;
                this.activate = activate;
                this.utilities = utilities;
                this.title = 'Technology Showcase Portal';
                this.companies = ko.observableArray();
                this.countries = localization.getLocalizedCodeSet('country');
                this.selectedCompanyTechnologyPortal = ko.observable();
                this.selectedImage = {
                    fileUrl: ko.observable(),
                    fileReference: ko.observable(),
                    contentType: ko.observable(),
                    percentage: ko.observable(),
                    uploadCompleted: ko.observable(),
                    size: ko.observable(20000000),
                    sizeIsValid: ko.observable(true)
                };
                this.selectedImage.fileUrl.subscribe(mediaChange, this);
                this.selectedCatalogue = {
                    fileUrl: ko.observable(),
                    fileReference: ko.observable(),
                    contentType: ko.observable(),
                    percentage: ko.observable(),
                    uploadCompleted: ko.observable(),
                    size: ko.observable(20000000),
                    sizeIsValid: ko.observable(true)
                };
                this.selectedCatalogue.fileUrl.subscribe(catalogueMediaChange, this);  
                this.companyTechnologyPortalIsDeleting = ko.observable(false);   
                this.reloadData = reloadData;
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.addRequirement = addRequirement;
                this.newRequirement = newRequirement;
                this.deleteCompanyTechnologyPortalItem = deleteCompanyTechnologyPortalItem;
                this.cancelDeleteTechnologyPortal = cancelDeleteTechnologyPortal;
                this.setSelectedCompanyTechnologyPortal = setSelectedCompanyTechnologyPortal;
                this.isflag = ko.observable(false);
            };

            var vm = new Model();

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.deleteCompanyTechnologyPortalItemCommand = ko.command({
                execute: function (item) {
                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteTechnologyPortal',
                        'Company': vm.selectedItem().company.name()
                    });

                    vm.selectedItem().company.technologyPortalContainers.remove(item);
                    vm.companyTechnologyPortalIsDeleting(false);
                },
                canExecute: function () {
                    return true;
                }
            });
           
            vm.companyTechnologyIsSelected = ko.pureComputed(function () {
                return vm.selectedCompanyTechnologyPortal().id() ? true : false;
            }, this);
          

            editor.extend(vm, datacontext.companies);

            return vm;

            function catalogueMediaChange(newValue) {                
                if (newValue) {

                    var container = vm.selectedCompanyTechnologyPortal();
                    if (!container.catalogueFileLocation) {
                        container.catalogueFileLocation = ko.observable();
                    }
                    if (!container.catalogueFileReference) {
                        container.catalogueFileReference = ko.observable();
                    }
                    container.catalogueFileLocation(vm.selectedCatalogue.fileUrl());
                    container.catalogueFileReference(vm.selectedCatalogue.fileReference());

                }
            }

            function getSelectedContainer() {                
                for (var i = 0; i < vm.companies().length; i++) {
                    if (vm.companies()[i].id() === vm.selectedItemId()) {
                        return vm.companies()[i];
                    }
                }
            }

            function mediaChange(newValue) {
                if (newValue) {
                    var container = getSelectedContainer();
                    container.logoImageLocation(vm.selectedImage.fileUrl());
                    container.logoImageReference(vm.selectedImage.fileReference());
                }
            }

            function activate() {
                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });
                vm.companyTechnologyPortalIsDeleting(false);
                vm.selectedCompanyTechnologyPortal(new model.CompanyTechnologyPortalContainer());                
                vm.selectedItem(undefined);
                vm.canDelete(false);

                vm.companies(security.listCompanyAccess());

                $('.nav-pills a').removeClass('active');
                $('.nav-pills a[href="#editCompanyProfile"]').addClass('active');
                //filterCompanies();                
            }

            function reloadData() {
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {
                    var searchVm = require('viewmodels/adminCompanyTechnologyShowcaseSearch');
                    searchVm.filterCompanies();
                    state.systemIsBusy(false);
                });

                return true;
            }

            function enterSave() {
                debugger
                return true;
            }

            function enterEdit() {                
                var container = getSelectedContainer();
                if (container.company.logoImageId()) {
                    vm.selectedImage.fileUrl(utilities.resolveFileUrl(container.company.logoImageId()));
                }
                else {
                    vm.selectedImage.fileUrl(config.imageCdn + 'logo/logo-solo.png');
                }
                newRequirement();
            }

            function cancelEdit() {
                vm.isEditing(false);
            }

            function addRequirement() {                
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveTechnologyShowcasePortal',
                    'Company': vm.selectedItem().company.name()
                });
                
                if (!vm.selectedCompanyTechnologyPortal().id()) {
                vm.selectedItem().company.technologyPortalContainers.push(vm.selectedCompanyTechnologyPortal());
                }

                newRequirement();
            }

            function newRequirement() {
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'NewTechnologyShowcasePortal',
                    'Company': vm.selectedItem().company.name()
                });

                vm.selectedCompanyTechnologyPortal(new model.CompanyTechnologyPortalContainer());
                vm.selectedCompanyTechnologyPortal().technologyPortal.isflag = true;
                getlist();
            }

            function deleteCompanyTechnologyPortalItem() {
                vm.companyTechnologyPortalIsDeleting(true);
            }

            function cancelDeleteTechnologyPortal() {
                vm.companyTechnologyPortalIsDeleting(false);
            }

            function setSelectedCompanyTechnologyPortal(item) { 
                vm.selectedCompanyTechnologyPortal().technologyPortal.isflag = false;   
                var index = vm.selectedItem().company.technologyPortalContainers().indexOf(item);
                if (index > -1) {
                    vm.selectedCompanyTechnologyPortal(vm.selectedItem().company.technologyPortalContainers()[index]);
                }
            }

            function getlist() {
                //vm.categoryList([]);     
                vm.selectedCompanyTechnologyPortal().categories = [];
                for (var c = 0; c < vm.companies().length; c++) {
                    var company = vm.companies()[c].company;
                    if (company.technologyPortalContainers) {
                        for (var d = 0; d < company.technologyPortalContainers().length; d++) {
                            if (company.technologyPortalContainers()[d].technologyPortal.category()) {
                                if (company.technologyPortalContainers()[d].technologyPortal.category())
                                    vm.selectedCompanyTechnologyPortal().categories.push(company.technologyPortalContainers()[d].technologyPortal.category());
                            }
                        }
                    }
                }
            }
            
        });
}());
