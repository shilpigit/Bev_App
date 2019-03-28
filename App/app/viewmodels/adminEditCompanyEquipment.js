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
                this.loc = datacontext.translations.item;
                this.config = config;
                this.state = state;
                this.activate = activate;
                this.utilities = utilities;
                this.title = 'Companies';
                this.rigAndVesselTypes = localization.getLocalizedCodeSet('rigAndVesselType');
                this.regions = localization.getLocalizedCodeSet('region');
                this.yearQuarters = localization.getLocalizedCodeSet('yearQuarters'),
                this.year = localization.getLocalizedCodeSet('year'),
                this.companies = ko.observableArray();
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
                this.selectedCompanyEquipment = ko.observable();
                this.companyEquipmentIsDeleting = ko.observable(false);
                // todo: refine ko.detePicker.binding to get rid of this mess
                this.localExpireDateTime = ko.observable(new Date());
                this.enterSave = enterSave;
                this.reloadData = reloadData;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.addEquipment = addEquipment;
                this.newEquipment = newEquipment;
                this.deleteCompanyEquipmentItem = deleteCompanyEquipmentItem;
                this.cancelDeleteEquipment = cancelDeleteEquipment;
                this.setSelectedCompanyEquipmentItem = setSelectedCompanyEquipmentItem;
                this.textAreaGotFocus = textAreaGotFocus;
                this.textAreaLostFocus = textAreaLostFocus;
            };

            var vm = new Model();

            // todo: work on knockout mappings to bind inner computed observables too
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

            vm.getFormattedExpiresDate = function (item) {

                if (item.expireDateTime()) {
                    return moment(item.expireDateTime()).format(config.dateFormat);
                }
                else {
                    return moment(new Date()).format(config.dateFormat);
                }

            };

            vm.getFileUrl = function (item) {

                if (!item.equipment.catalogueFileId()) {
                    return '';
                }

                return config.root + 'api/storage/redirect?id=' + item.equipment.catalogueFileId();

            };

            vm.deleteEquipmentItemCommand = ko.command({
                execute: function (item) {

                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteEquipment',
                        'Company': vm.selectedItem().company.name()
                    });

                    vm.selectedItem().company.equipmentContainers.remove(item);

                },
                canExecute: function () {
                    return true;
                }
            });

            vm.companyEquipmentIsSelected = ko.pureComputed(function () {
                return vm.selectedCompanyEquipment().id() ? true : false;
            }, this);

            editor.extend(vm, datacontext.companies);

            return vm;

            function catalogueMediaChange(newValue) {

                if (newValue) {

                    var container = vm.selectedCompanyEquipment();
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
                vm.companyEquipmentIsDeleting(false);
                vm.selectedCompanyEquipment(new model.CompanyEquipmentContainer());
                vm.selectedItem(undefined);
                vm.canDelete(false);

                vm.companies(security.listCompanyAccess());

            }

            function reloadData() {
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {

                    var searchVm = require('viewmodels/adminCompanyEquipmentSearch');

                    searchVm.filterCompanies();

                    state.systemIsBusy(false);
                });

                return true;
            }

            function enterSave() {
                return true;
            }

            function enterEdit() {
            }

            function cancelEdit() {
                vm.isEditing(false);
            }

            function addEquipment() {

                if (!vm.selectedCompanyEquipment().equipment.regionCodeValue()) {
                    logger.logError(vm.loc.stringSelectEquipmentRegionMessage());
                    return;
                }

                if (!vm.selectedCompanyEquipment().equipment.typeCodeValue()) {
                    logger.logError(vm.loc.stringSelectEquipmentType());
                    return;
                }               
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveEquipment',
                    'Company': vm.selectedItem().company.name()
                });               
                if (!vm.selectedCompanyEquipment().id()) {

                    vm.selectedItem().company.equipmentContainers.push(vm.selectedCompanyEquipment());
                }
               
                vm.selectedCompanyEquipment().equipment.createdDateTime(new Date());

                // set to rig/vessel category (for now maybe later we will have some other kind of equipments)
                vm.selectedCompanyEquipment().equipment.category('rigAndVessel');

                newEquipment();
            }

            function newEquipment() {

                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'NewEquipment',
                    'Company': vm.selectedItem().company.name()
                });

                vm.selectedCompanyEquipment(new model.CompanyEquipmentContainer());
            }

            function deleteCompanyEquipmentItem() {
                vm.companyEquipmentIsDeleting(true);
            }

            function cancelDeleteEquipment() {
                vm.companyEquipmentIsDeleting(false);
            }

            function setSelectedCompanyEquipmentItem(item) {

                var index = vm.selectedItem().company.equipmentContainers().indexOf(item);
                vm.selectedCompanyEquipment(vm.selectedItem().company.equipmentContainers()[index]);
                vm.selectedCompanyEquipment().equipment.category('rigAndVessel');

            }

            function textAreaGotFocus(elementId) {
                var el = $('#' + elementId);

                autosize(el);  // jshint ignore:line
                utilities.scrollToElement(el);
            }

            function textAreaLostFocus(elementId) {
                var el = $('#' + elementId);
                autosize.destroy(el);  // jshint ignore:line
            }
        });
}());
