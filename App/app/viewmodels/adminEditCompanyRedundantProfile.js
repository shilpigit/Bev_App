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
            'services/candidateProfile',
            'services/utilities',
            'services/core/code'
        ],
        function (config, localization, datacontext, editor, state, security, Clipboard, logger, model, instrumentationSrv, candidateProfileSrv, utilities) {

            var Model = function () {                
                this.loc = datacontext.translations.item;
                this.config = config;
                this.state = state;
                this.utilities = utilities;
                this.activate = activate;
                this.title = 'Redundant Profile';
                this.companies = ko.observableArray();              
                this.companyRedundantProfileIsDeleting = ko.observable(false);
                this.companyRequirementSections = localization.getLocalizedCodeSet('companyRequirementSection');
                this.genders = localization.getLocalizedCodeSet('gender');
                this.countries = localization.getLocalizedCodeSet('country');
                this.availabilities = localization.getLocalizedCodeSet('availability');
                this.industryExperiences = localization.getLocalizedCodeSet('industryExperience');
                this.employmentTypes = localization.getLocalizedCodeSet('employmentType');
                this.educations = localization.getLocalizedCodeSet('education');
                this.summaryOfExperienceCategories = localization.getLocalizedCodeSet('summaryOfExperienceCategory');
                this.dSummaryOfExperienceCategories = localization.getLocalizedCodeSet('dSummaryOfExperienceCategory');
                this.nDSummaryOfExperienceCategories = localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');
                this.categoryOfPersonnel = localization.getLocalizedCodeSet('categoryOfPersonnel');
                this.showSecondLevel = ko.observable(false);
                this.categoryOfPersonnelCodeValue = ko.observable();
                this.reloadData = reloadData;
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.wizardShowContactInformation = wizardShowContactInformation;
                this.wizardShowPrimaryInformation = wizardShowPrimaryInformation;
                this.wizardShowProfessionalPreferences = wizardShowProfessionalPreferences;
                this.wizardCompanyContactDetails = wizardCompanyContactDetails;
                this.wizardProjectDetails = wizardProjectDetails;
                this.showwizard = showwizard;
                this.showwizard = ko.observable(false);
                this.addRedundantProfile = addRedundantProfile;
                this.newRedundantProfile = newRedundantProfile;
                this.deleteRedundantProfileItem = deleteRedundantProfileItem;
                this.cancelDeleteRedundantProfile = cancelDeleteRedundantProfile;
                this.setSelectedCompanyRedundantProfileItem = setSelectedCompanyRedundantProfileItem;
                this.selectedcategoryOfPersonnelCodeValue = ko.observable('');
                this.selectedCompanyRedundantProfile = ko.observable();
                this.selectedCv = {
                    fileUrl: ko.observable(),
                    fileReference: ko.observable(),
                    contentType: ko.observable(),
                    percentage: ko.observable(),
                    uploadCompleted: ko.observable(),
                    size: ko.observable(20000000),
                    sizeIsValid: ko.observable(true)
                };
               
            };

            var vm = new Model();

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.selectedCv.fileUrl.subscribe(mediaChange, vm);
            var save = saveCmd();

            // todo: work on knockout mappings to bind inner computed observables too
            vm.getRelativePostedDateTime = function (item) {

                if (item.createdDateTime()) {
                    return moment(item.createdDateTime()).fromNow();
                }
                else {
                    return 'Who Knows!';
                }

            };

            vm.categoryOfPersonnelCodeValue.subscribe(function (value) {
                //activate();
                showwizard(value);
            });

           
            vm.getFullName = function (item) {                
                let itemName = '';
                if (item.firstName() === undefined || item.firstName() === null) {
                    itemName = item.companyName();
                }
                else {
                    itemName = item.firstName() + ' ' + item.lastName();
                }
                return itemName;
            };

            //vm.getNationalityName = function (item) {                
            //    var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
            //        return el.codeValue() === item.candidateProfile.nationalityCodeValue();
            //    });

            //    if (matches.length > 0) {
            //        return matches[0].name();
            //    }

            //};

            //vm.categoryOfPersonnelCodeValue = ko.pureComputed({
            //    read: function () {                   
            //        var categoryOfPersonnel = localization.getLocalizedCodeSet('categoryOfPersonnel');

            //        categoryOfPersonnel.codes.sort(function (left, right) {
            //            return left.name() < right.name() ? -1 : 1;
            //        });

            //        return categoryOfPersonnel;
            //    }
            //});

            //vm.getCategoryOfPersonnelCodeValue = function (item) {

            //    var matches = ko.utils.arrayFilter(vm.categoryOfPersonnel.codes, function (el) {
            //        return el.codeValue() === item.categoryOfPersonnelCodeValue();
            //    });

            //    if (matches.length > 0) {
            //        return matches[0].name();
            //    }
            //};
            
            vm.deleteDeleteRedundantProfileItemCommand = ko.command({
                execute: function (item) {                    
                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteRedundantPortal',
                        'Company': vm.selectedItem().company.name()
                    });
                    vm.companyRedundantProfileIsDeleting(false);
                    vm.selectedItem().company.redundantProfiles.remove(item);

                    newRedundantProfile();

                },
                canExecute: function () {
                    return true;
                }
            });

            vm.companyRedundantProfileIsSelected = ko.pureComputed(function () {
                return vm.selectedCompanyRedundantProfile().id() ? true : false;
            }, this);

            vm.addProfileDetailIsValid = ko.pureComputed(function () {
                if (!vm.selectedCompanyRedundantProfile().companyName()) {
                    return false;
                }
                return true;
            }, this);

            vm.experienceDisciplineSecondLevelCodeValue = ko.pureComputed({
                read: function () {
                    if (vm.selectedCompanyRedundantProfile().summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {
                        vm.showSecondLevel(false);
                        var dSummaryOfExperienceCategory = localization.getLocalizedCodeSet('dSummaryOfExperienceCategory');

                        dSummaryOfExperienceCategory.codes.sort(function (left, right) {
                            return left.name() < right.name() ? -1 : 1;
                        });

                        return dSummaryOfExperienceCategory;
                    }
                    else {
                        vm.showSecondLevel(true);
                        var nDSummaryOfExperienceCategory = localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');

                        nDSummaryOfExperienceCategory.codes.sort(function (left, right) {
                            return left.name() < right.name() ? -1 : 1;
                        });

                        return nDSummaryOfExperienceCategory;
                    }
                }
            });
            vm.experienceDisciplineThirdLevelCodeValue = ko.pureComputed({
                read: function () {
                    var data = candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedCompanyRedundantProfile().experienceDisciplineFirstLevelCodeValue());

                    data.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    return data;
                }
            });

            
            editor.extend(vm, datacontext.companies);

            return vm;

            function activate() {
                vm.companyRedundantProfileIsDeleting(false);
                vm.selectedCompanyRedundantProfile(new model.CompanyRedundantProfile());
                vm.selectedItem();
                vm.canDelete(false);
                vm.companies(security.listCompanyAccess());
                vm.validationModel = ko.validatedObservable({
                    emailAddress: vm.selectedCompanyRedundantProfile().emailAddress,
                    cityName: vm.selectedCompanyRedundantProfile().cityName,
                    addressOne: vm.selectedCompanyRedundantProfile().addressOne,
                    postCode: vm.selectedCompanyRedundantProfile().postCode,
                    primaryContactNumber: vm.selectedCompanyRedundantProfile().primaryContactNumber,
                    employmentTypeCodeValues: vm.selectedCompanyRedundantProfile().employmentTypeCodeValues,
                    currentJobTitle: vm.selectedCompanyRedundantProfile().currentJobTitle,
                    availabilityCodeValue: vm.selectedCompanyRedundantProfile().availabilityCodeValue,
                    nationalityCodeValue: vm.selectedCompanyRedundantProfile().nationalityCodeValue,
                    companyName:vm.selectedCompanyRedundantProfile().companyName,
                    contactPerson:vm.selectedCompanyRedundantProfile().contactPerson,
                    title:vm.selectedCompanyRedundantProfile().title,
                    email:vm.selectedCompanyRedundantProfile().email,
                    telephoneNumber:vm.selectedCompanyRedundantProfile().telephoneNumber,
                    location: vm.selectedCompanyRedundantProfile().location
                });

                vm.validationModelDownManning = ko.validatedObservable({
                    companyName: vm.selectedCompanyRedundantProfile().companyName,
                    contactPerson: vm.selectedCompanyRedundantProfile().contactPerson,
                    title: vm.selectedCompanyRedundantProfile().title,
                    email: vm.selectedCompanyRedundantProfile().email,
                    telephoneNumber: vm.selectedCompanyRedundantProfile().telephoneNumber,
                    location: vm.selectedCompanyRedundantProfile().location,
                    projectBeingDownManned: vm.selectedCompanyRedundantProfile().projectBeingDownManned,
                    amountOfPersonnelAvailable: vm.selectedCompanyRedundantProfile().amountOfPersonnelAvailable,
                    descriptionOfPersonnelAvailable: vm.selectedCompanyRedundantProfile().descriptionOfPersonnelAvailable,
                    availableDate: vm.selectedCompanyRedundantProfile().availableDate,
                    additionalInformation: vm.selectedCompanyRedundantProfile().additionalInformation
                });
               
                vm.selectedCompanyRedundantProfile().emailAddress.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    },
                    email: {
                        message: vm.loc.textMailSampleMessage()
                    }
                });
                vm.selectedCompanyRedundantProfile().cityName.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().addressOne.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().postCode.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().primaryContactNumber.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().employmentTypeCodeValues.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().currentJobTitle.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().availabilityCodeValue.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().nationalityCodeValue.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });

                vm.selectedCompanyRedundantProfile().companyName.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    },
                    
                });
                vm.selectedCompanyRedundantProfile().contactPerson.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().title.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().email.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().telephoneNumber.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().location.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().projectBeingDownManned.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().amountOfPersonnelAvailable.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().descriptionOfPersonnelAvailable.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
                vm.selectedCompanyRedundantProfile().availableDate.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });

                vm.selectedCompanyRedundantProfile().additionalInformation.extend({
                    required: {
                        message: vm.loc.stringGenericThisFieldIsMandatory(),
                        valueUpdate: 'afterKeyDown'
                    }
                });
               
                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.availabilities.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.summaryOfExperienceCategories.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

            }
            function mediaChange(newValue) {
                if (newValue) {

                    vm.selectedItem().cvFileLocation(vm.selectedCv.fileUrl());
                    vm.selectedItem().cvFileReference(vm.selectedCv.fileReference());
                }
            }
            function saveCmd() {
                return ko.command({
                    execute: function () {
                        
                        if (vm.validationModel.isValid()) {

                            if (!vm.showSecondLevel()) {
                                vm.selectedItem().candidateProfile.experienceDisciplineSecondLevelCodeValue('');
                            }
                            
                            state.systemIsBusy(true);
                            vm.saveCommand(function () {
                                state.systemIsBusy(true);
                            });

                        }
                        else {
                            logger.logError(vm.loc.stringGenericFillRequiredInformation());
                            return false;
                        }
                    }
                });                
            }

            function reloadData() {
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {

                    var searchVm = require('viewmodels/adminCompanyRedundantProfileSearch');

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

            // ui
            function wizardShowContactInformation() {

                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-company-information').collapse('hide');
                $('#panel-project-information').collapse('hide');
                $('#panel-contact-information').collapse('show');
                
            }

            function wizardShowPrimaryInformation() {
                $('#panel-professional-preferences').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-company-information').collapse('hide');
                $('#panel-project-information').collapse('hide');
                $('#panel-primary-information').collapse('show');
             
            }

            function wizardShowProfessionalPreferences() {
                $('#panel-contact-information').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-company-information').collapse('hide');
                $('#panel-project-information').collapse('hide');
                $('#panel-professional-preferences').collapse('show');
               
            }
            function wizardCompanyContactDetails() {

                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-project-information').collapse('hide');
                $('#panel-company-information').collapse('show');
                
            }
            function wizardProjectDetails() {

                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-company-information').collapse('hide');
                $('#panel-project-information').collapse('show');
               
            }
            function showwizard(personnelValue) {
                switch (personnelValue) {
                    case 'bDownManningProject':
                        disablePanel();
                        break;
                    case 'cDownManningRig':
                        disablePanel();
                        break;
                    default:
                        enablePanel(); 
                        break;
                }
              
                //$('#panel-project-information').collapse('show');
            }

            function enablePanel() {
                $('#panel-project-information').collapse('hide');
                $('#panel-professional-preferences').collapse('show');
                $('#panel-primary-information').collapse('show');
                $('#panel-contact-information').collapse('show');
                $('#panel-company-information').collapse('show');
                $('#panel-project-information').parent('#panel-project-parent').addClass('panel-disabled');
                $('#panel-professional-preferences').parent('#panel-professional-parent').removeClass('panel-disabled');
                $('#panel-primary-information').parent('#panel-primary-parent').removeClass('panel-disabled');
                $('#panel-contact-information').parent('#panel-contact-parent').removeClass('panel-disabled');
            }

            function disablePanel() {
                $('#panel-project-information').collapse('show');
                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-company-information').collapse('show');
                $('#panel-professional-preferences').parent('#panel-professional-parent').addClass('panel-disabled');
                $('#panel-contact-information').parent('#panel-contact-parent').addClass('panel-disabled');
                $('#panel-primary-information').parent('#panel-primary-parent').addClass('panel-disabled');
                $('#panel-project-information').parent('#panel-project-parent').removeClass('panel-disabled');
            }
            
            function addRedundantProfile() {
                
                if (vm.categoryOfPersonnelCodeValue() === 'bDownManningProject' || vm.categoryOfPersonnelCodeValue() === 'cDownManningRig') {
                    if (!vm.validationModelDownManning.isValid()) {
                        showMessage(vm.loc.stringFillFormCompletely(), 'warning');
                        return;
                    }
                }
                else {
                    if (!vm.validationModel.isValid()) {
                        showMessage(vm.loc.stringFillFormCompletely(), 'warning');
                        return;
                    }
                }
                
                vm.selectedCompanyRedundantProfile().categoryOfPersonnelCodeValue(vm.categoryOfPersonnelCodeValue());
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveRedundantProfile',
                    'Company': vm.selectedItem().company.name()
                });

                if (!vm.selectedCompanyRedundantProfile().id()) {                    
                    vm.selectedItem().company.redundantProfiles.push(vm.selectedCompanyRedundantProfile());
                }

                vm.selectedCompanyRedundantProfile().createdDateTime(new Date());

                newRedundantProfile();
            }

            function newRedundantProfile() {

                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'NewRedundantProfile',
                    'Company': vm.selectedItem().company.name()
                });

                // reset the model
                //vm.selectedCompanyRedundantProfile(new model.CompanyRedundantProfile());
                activate()

            }

            function deleteRedundantProfileItem() {                  
                vm.companyRedundantProfileIsDeleting(true);
            }

            function cancelDeleteRedundantProfile() {                    
                vm.companyRedundantProfileIsDeleting(false);
            }

            function setSelectedCompanyRedundantProfileItem(item) {                
                var index = vm.selectedItem().company.redundantProfiles().indexOf(item);
                vm.selectedCompanyRedundantProfile(vm.selectedItem().company.redundantProfiles()[index]);

            }

            function showMessage(message, type) {
                vm.messageDetail.message(message);
                vm.messageDetail.type(type);
                utilities.scrollToAnchor('message-box-place');
            }
        });
}());
