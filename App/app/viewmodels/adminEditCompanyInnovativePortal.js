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
                this.title = 'Innovative Portal';
                this.companies = ko.observableArray();
                this.countries = localization.getLocalizedCodeSet('country');
                this.selectedCompanyInnovativePortal = ko.observable();
                this.seeking = localization.getLocalizedCodeSet('seeking');
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
                this.companyInnovativePortalIsDeleting = ko.observable(false);                
                this.reloadData = reloadData;
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.addRequirement = addRequirement;
                this.newRequirement = newRequirement;
                this.deleteCompanyInnovativePortalItem = deleteCompanyInnovativePortalItem;
                this.cancelDeleteInnovativePortal = cancelDeleteInnovativePortal;
                this.setSelectedCompanyInnovativePortal = setSelectedCompanyInnovativePortal;

                //this.categoryList = ko.observableArray();
                this.isflag = ko.observable(false);
              
            };

            var vm = new Model();
           
            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.deleteCompanyInnovativePortalItemCommand = ko.command({
                execute: function (item) {   
                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteInnovativePortal',
                        'Company': vm.selectedItem().company.name()
                    });
                    
                    vm.selectedItem().company.innovativePortalContainers.remove(item);
                    vm.companyInnovativePortalIsDeleting(false);
                },
                canExecute: function () {
                    return true;
                }
            });

            vm.companyInnovativeIsSelected = ko.pureComputed(function () {                
                return vm.selectedCompanyInnovativePortal().id() ? true : false;
            }, this);
            
            editor.extend(vm, datacontext.companies);         

                  
            return vm;

            function catalogueMediaChange(newValue) {
                if (newValue) {

                    var container = vm.selectedCompanyInnovativePortal();
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
            
            function activate() {                   
                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });
                vm.companyInnovativePortalIsDeleting(false);
                vm.selectedCompanyInnovativePortal(new model.CompanyInnovativePortalContainer());
                vm.selectedItem(undefined);
                vm.canDelete(false);
                vm.companies(security.listCompanyAccess());
            }

            function reloadData() {                  
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {
                    var searchVm = require('viewmodels/adminCompanyInnovativePortalSearch');
                    searchVm.filterCompanies();
                    state.systemIsBusy(false);
                });

                return true;
            }

            function enterSave() {                
                return true;
            }

            function enterEdit() {     
                //vm.selectedCompanyInnovativePortal(new model.CompanyInnovativePortalContainer());
                //vm.selectedCompanyInnovativePortal().innovativePortal.isflag = true;
                //getlist();
                newRequirement();
            }

            function cancelEdit() {
                vm.isEditing(false);
            }

            function addRequirement() {                
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveInnovativePortal',
                    'Company': vm.selectedItem().company.name()
                });
                
                //if (!vm.selectedCompanyInnovativePortal().id()) {
                    vm.selectedItem().company.innovativePortalContainers.push(vm.selectedCompanyInnovativePortal());
                //}

                newRequirement();
            }

            function newRequirement() {
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'NewInnovativePortal',
                    'Company': vm.selectedItem().company.name()
                });                
                vm.selectedCompanyInnovativePortal(new model.CompanyInnovativePortalContainer());
                vm.selectedCompanyInnovativePortal().innovativePortal.isflag = true; 
                getlist();
            }

            function deleteCompanyInnovativePortalItem() {                
                vm.companyInnovativePortalIsDeleting(true);                
            }

            function cancelDeleteInnovativePortal() {                
                vm.companyInnovativePortalIsDeleting(false);
            }

            function setSelectedCompanyInnovativePortal(item) {   
                vm.selectedCompanyInnovativePortal().innovativePortal.isflag=false;                
                var index = vm.selectedItem().company.innovativePortalContainers().indexOf(item);
                if (index > -1) {                   
                    vm.selectedCompanyInnovativePortal(vm.selectedItem().company.innovativePortalContainers()[index]);
                }
            }


            function getlist() {                   
                //vm.categoryList([]);     
                vm.selectedCompanyInnovativePortal().categories = [];
                for (var c = 0; c < vm.companies().length; c++) {
                    var company = vm.companies()[c].company;
                    if (company.innovativePortalContainers) {
                        for (var d = 0; d < company.innovativePortalContainers().length; d++) {                            
                            if (company.innovativePortalContainers()[d].innovativePortal.category()) {                                
                                if (company.innovativePortalContainers()[d].innovativePortal.category())
                                    vm.selectedCompanyInnovativePortal().categories.push(company.innovativePortalContainers()[d].innovativePortal.category());
                            }
                        }
                    }
                }              
            }

        });
}());

