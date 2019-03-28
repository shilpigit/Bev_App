(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/security',
            'services/core/localization',
            'services/core/state',
            'services/candidateProfile',
            'viewmodels/behaviors/editor'
        ],
        function (app, router, logger, config, dataservice, datacontext, security, localization, state, candidateProfileSrv, editor) {
            var vm = {
                title: 'Candidate Profile',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                state: state,
                selectedView: ko.observable('dashboard'),
                profiles: datacontext.candidateProfiles.items,
                profile: ko.observable(),
                currentUser: datacontext.user.item.user,
                countries: localization.getLocalizedCodeSet('country'),
                availabilities: localization.getLocalizedCodeSet('availability'),
                willingToRelocates: localization.getLocalizedCodeSet('willingToRelocate'),
                industryExperiences: localization.getLocalizedCodeSet('industryExperience'),
                employmentTypes: localization.getLocalizedCodeSet('employmentType'),
                currencies: localization.getLocalizedCodeSet('currency'),
                educations: localization.getLocalizedCodeSet('education'),
                summaryOfExperienceCategories: localization.getLocalizedCodeSet('summaryOfExperienceCategory'),
                dSummaryOfExperienceCategories: localization.getLocalizedCodeSet('dSummaryOfExperienceCategory'),
                nDSummaryOfExperienceCategories: localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory'),
                timeZones: datacontext.timeZones.items,
                showSecondLevel: ko.observable(false),
                parent: ko.observable(),

                selectedCv: {
                    fileUrl: ko.observable(),
                    fileReference: ko.observable(),
                    contentType: ko.observable(),
                    percentage: ko.observable(),
                    uploadCompleted: ko.observable(),
                    size: ko.observable(20000000),
                    sizeIsValid: ko.observable(true)
                },

                isBusy: ko.observable(false),
                enterSave: enterSave,
                setSelectedView: setSelectedView,
                cancelEditing: cancelEditing,
                reloadData: reloadData,
                wizardShowCv: wizardShowCv,
                wizardShowContactInformation: wizardShowContactInformation,
                wizardShowSocialLinks: wizardShowSocialLinks,
                wizardShowPrimaryInformation: wizardShowPrimaryInformation,
                wizardShowProfessionalPreferences: wizardShowProfessionalPreferences
            };

            
            // this is to make unity in "View" form-groups binders like a C# property
            vm.experienceDisciplineSecondLevelCodeValue = ko.pureComputed({
                read: function () {
                    if (vm.selectedItem().candidateProfile.summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {
                        vm.showSecondLevel(false);
                        var dSummaryOfExperienceCategory =  localization.getLocalizedCodeSet('dSummaryOfExperienceCategory');

                        dSummaryOfExperienceCategory.codes.sort(function (left, right) {
                            return left.name() < right.name() ? -1 : 1;
                        });

                        return dSummaryOfExperienceCategory;
                    }
                    else {
                        vm.showSecondLevel(true);
                        var nDSummaryOfExperienceCategory=  localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');

                        nDSummaryOfExperienceCategory.codes.sort(function (left, right) {
                            return left.name() < right.name() ? -1 : 1;
                        });

                        return nDSummaryOfExperienceCategory;
                    }
                }
            });

            vm.experienceDisciplineThirdLevelCodeValue = ko.pureComputed({
                read: function () {
                    var data = candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedItem().candidateProfile.experienceDisciplineFirstLevelCodeValue());

                    data.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    return data;
                }
            });

            vm.selectedCv.fileUrl.subscribe(mediaChange, vm);
            vm.saveCmd = saveCmd();

            editor.extend(vm, datacontext.candidateProfiles);

            return vm;

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
                            console.log(vm);
                        }
                        else {
                            logger.logError(vm.loc.stringGenericFillRequiredInformation());
                            return false;
                        }
                    }
                });
            }

            function wizardShowCv() {
                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-social-links').collapse('hide');
                $('#panel-contact-information').collapse('hide');

                $('#panel-cv').collapse('show');
            }

            function wizardShowContactInformation() {
                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-social-links').collapse('hide');
                $('#panel-cv').collapse('hide');
                $('#panel-contact-information').collapse('show');
            }

            function wizardShowSocialLinks() {
                $('#panel-professional-preferences').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-cv').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-social-links').collapse('show');
            }

            function wizardShowPrimaryInformation() {
                $('#panel-professional-preferences').collapse('hide');
                $('#panel-cv').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-social-links').collapse('hide');
                $('#panel-primary-information').collapse('show');
            }

            function wizardShowProfessionalPreferences() {
                $('#panel-cv').collapse('hide');
                $('#panel-contact-information').collapse('hide');
                $('#panel-social-links').collapse('hide');
                $('#panel-primary-information').collapse('hide');
                $('#panel-professional-preferences').collapse('show');
            }

            function reloadData() {
                state.systemIsBusy(false);
                setSelectedView('dashboard');
            }

            function enterSave() {
            }

            function mediaChange(newValue) {
                if (newValue) {

                    vm.selectedItem().cvFileLocation(vm.selectedCv.fileUrl());
                    vm.selectedItem().cvFileReference(vm.selectedCv.fileReference());
                }
            }

            function setSelectedView(view) {
                vm.parent().setSelectedView(view);
            }

            function cancelEditing() {
                vm.isBusy(false);
                vm.cancelEdit();
                setSelectedView('dashboard');
            }

            function activate() {

                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.parent(require('viewmodels/homeUser'));

                state.systemIsBusy(true);

                datacontext.candidateProfiles.getData().then(function () {
                    vm.selectedItem(vm.profiles()[0]);
                    vm.profile(vm.profiles()[0]);
                    state.systemIsBusy(false);
                    wizardShowContactInformation();

                    vm.validationModel = ko.validatedObservable({
                        cityName: vm.selectedItem().candidateProfile.cityName,
                        addressOne: vm.selectedItem().candidateProfile.addressOne,
                        postCode: vm.selectedItem().candidateProfile.postCode,
                        primaryContactNumber: vm.selectedItem().candidateProfile.primaryContactNumber,
                        willingToTravel: vm.selectedItem().candidateProfile.willingToTravel,
                        willingToRelocateCodeValue: vm.selectedItem().candidateProfile.willingToRelocateCodeValue,
                        authorisedToWorkCodeValues: vm.selectedItem().candidateProfile.authorisedToWorkCodeValues,
                        employmentTypeCodeValues: vm.selectedItem().candidateProfile.employmentTypeCodeValues,
                        currentCompanyName: vm.selectedItem().candidateProfile.currentCompanyName,
                        currentJobTitle: vm.selectedItem().candidateProfile.currentJobTitle,
                        availabilityCodeValue: vm.selectedItem().candidateProfile.availabilityCodeValue,
                        nationalityCodeValue: vm.selectedItem().candidateProfile.nationalityCodeValue,
                        isPublic: vm.selectedItem().candidateProfile.isPublic,
                    });

                    vm.selectedItem().candidateProfile.cityName.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.addressOne.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.postCode.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.primaryContactNumber.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.willingToTravel.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.willingToRelocateCodeValue.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.authorisedToWorkCodeValues.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.employmentTypeCodeValues.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.currentCompanyName.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.currentJobTitle.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.availabilityCodeValue.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.nationalityCodeValue.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });
                    vm.selectedItem().candidateProfile.isPublic.extend({
                        required: {
                            message: vm.loc.stringGenericThisFieldIsMandatory(),
                            valueUpdate: 'afterKeyDown'
                        }
                    });

                });

                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.summaryOfExperienceCategories.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });
            }


        });
}());
