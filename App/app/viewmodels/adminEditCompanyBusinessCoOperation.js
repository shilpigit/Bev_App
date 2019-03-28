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
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization, editor, model, instrumentationSrv ) {

            var Model = function () {
                this.loc = datacontext.translations.item;
                this.config = config;
                this.state = state;
                this.activate = activate;
                this.utilities = utilities;
                this.title = 'Companies';
                this.filteredCompanies = ko.observableArray();
                this.companies = ko.observableArray();
                this.selectedCompanyRequirement = ko.observable();
                this.searchPhrase = ko.observable('');
                this.sectionCodeValue = ko.observable();
                this.regionCodeValue = ko.observable();
                this.expertiseIndustryCodeValue = ko.observable();
                this.companyRequirementIsDeleting = ko.observable(false);
                this.companyRequirementSections = localization.getLocalizedCodeSet('companyRequirementSection');
                this.regions = localization.getLocalizedCodeSet('region');
                this.expertiseIndustries = localization.getLocalizedCodeSet('expertiseIndustryCategory');
                // todo: refine ko.detePicker.binding to get rid of this mess
                this.localExpireDateTime = ko.observable(new Date());
                this.localExpireDateTime.subscribe(dateChange, this);
                this.reloadData = reloadData;
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.addRequirement = addRequirement;
                this.newRequirement = newRequirement;
                this.deleteCompanyRequirementItem = deleteCompanyRequirementItem;
                this.cancelDeleteRequirement = cancelDeleteRequirement;
                this.setSelectedCompanyRequirementItem = setSelectedCompanyRequirementItem;
                this.textAreaGotFocus = textAreaGotFocus;
                this.textAreaLostFocus = textAreaLostFocus;
                this.regionCodeValue.subscribe(filterCompanies, this);
                this.expertiseIndustryCodeValue.subscribe(filterCompanies, this);
                this.filterCompanies = filterCompanies;


            };

            var vm = new Model();

            vm.searchPhrase.subscribe(filterCompanies, this);
            vm.sectionCodeValue.subscribe(filterCompanies, this);

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            // todo: work on knockout mappings to bind inner computed observables too

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

            vm.deleteRequirementItemCommand = ko.command({
                execute: function (item) {

                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteRequirement',
                        'Company': vm.selectedItem().company.name()
                    });

                    vm.selectedItem().company.requirements.remove(item);

                },
                canExecute: function () {
                    return true;
                }
            });
            vm.companyRequirementIsSelected = ko.pureComputed(function () {                  
                return vm.selectedCompanyRequirement().id() ? true : false;
            }, this);

            vm.checkValues = ko.pureComputed(function () {
                if (vm.selectedCompanyRequirement().subject() || vm.selectedCompanyRequirement().state() || vm.selectedCompanyRequirement().description() ||
                    vm.selectedCompanyRequirement().contactPersonPhoneNumber() || vm.selectedCompanyRequirement().contactPersonEmailAddress() ||
                    vm.selectedCompanyRequirement().contactPersonFullName()) {
                    return true;
                }
                else {
                    return false;
                }
            }, this);

            editor.extend(vm, datacontext.companies);

            return vm;

            function activate() {                
                vm.companyRequirementIsDeleting(false);
                vm.selectedCompanyRequirement(new model.CompanyRequirement());
                vm.selectedItem(undefined);
                vm.canDelete(false);
                vm.companies(security.listCompanyAccess());
                filterCompanies();
            }

            function reloadData() {                
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {
                    var searchVm = require('viewmodels/adminCompanyBusinessCoOperationSearch');
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

            function dateChange(newValue) {                
                if (newValue) {
                    if (newValue !== vm.selectedCompanyRequirement().expireDateTime()) {
                        vm.selectedCompanyRequirement().expireDateTime(new Date(newValue));
                    }
                }
            }

            function addRequirement() {  
                
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveRequirement',
                    'Company': vm.selectedItem().company.name()
                });

                if (!vm.selectedCompanyRequirement().id()) {
                    vm.selectedItem().company.requirements.push(vm.selectedCompanyRequirement());
                }

                vm.selectedCompanyRequirement().createdDateTime(new Date());

                newRequirement();
            }

            function newRequirement() {                
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'NewRequirement',
                    'Company': vm.selectedItem().company.name()
                });

                vm.selectedCompanyRequirement(new model.CompanyRequirement());
                vm.localExpireDateTime(new Date());
                vm.selectedCompanyRequirement().expireDateTime(new Date());

            }

            function deleteCompanyRequirementItem() {
                vm.companyRequirementIsDeleting(true);
            }

            function cancelDeleteRequirement() {
                vm.companyRequirementIsDeleting(false);
            }

            function setSelectedCompanyRequirementItem(item) {                
                var index = vm.selectedItem().company.requirements().indexOf(item);
                vm.selectedCompanyRequirement(vm.selectedItem().company.requirements()[index]);
                vm.localExpireDateTime(new Date(vm.selectedCompanyRequirement().expireDateTime()));
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
        
    function filterCompanies() {

        vm.filteredCompanies([]);

        for (var c = 0; c < vm.companies().length; c++) {

            var company = vm.companies()[c].company;

            if (company.requirements && company.isActive()) {

                for (var d = 0; d < company.requirements().length; d++) {

                    var requirement = company.requirements()[d];

                    if ((!vm.sectionCodeValue() || requirement.sectionCodeValue() === vm.sectionCodeValue()) &&
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
