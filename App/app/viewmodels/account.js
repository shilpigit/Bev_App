(function () {
    'use strict';

    define([
        'services/core/config',
        'services/core/localization',
        'services/core/logger',
        'plugins/router',
        'services/data/datacontext',
        'services/core/authentication',
        'services/core/state',
        'services/core/instrumentation'
    ], function (config, localizationSvc, logger, router, datacontext, authentication, state, instrumentationSrv) {
        var vm = {
            title: 'My Profile',
            activate: activate,
            loc: datacontext.translations.item,
            isBusy: ko.observable(false),

            currentUser: datacontext.user.item.user,
            showAccountUpdateError: ko.observable(false),

            firstName: ko.observable(),
            lastName: ko.observable(),
            dateOfBirth: ko.observable(new Date()),
            selectedGender: ko.observable(),
            selectedLanguage: ko.observable(),
            selectedUomLength: ko.observable(),
            selectedUomWeight: ko.observable(),
            subscribeForUpdate: ko.observable(),
            languageSet: localizationSvc.getLocalizedCodeSet('language'),
            preferredUomLengthSet: localizationSvc.getLocalizedCodeSet('uomLength'),
            preferredUomWeightSet: localizationSvc.getLocalizedCodeSet('uomWeight'),
            statedLanguage: state.languageCode(),
            days: ko.observableArray(),
            years: getYears(),
            months: getMonths(),
            selectedImage: {
                fileUrl: ko.observable(),
                fileReference: ko.observable(),
                contentType: ko.observable(),
                percentage: ko.observable(),
                uploadCompleted: ko.observable(),
                size: ko.observable(20000000),
                sizeIsValid: ko.observable(true)
            },
            userId: ko.observable(),
            currentPassword: ko.observable(),
            newPassword: ko.observable(),
            confirmNewPassword: ko.observable()
        };

        vm.selectedImage.fileUrl.subscribe(mediaChange, vm);

        vm.messageDetail = {
            message: ko.observable(),
            type: ko.observable()
        };

        vm.validationModel = ko.validatedObservable({
            currentPassword: vm.currentPassword,
            newPassword: vm.newPassword,
            confirmNewPassword: vm.confirmNewPassword
        });

        vm.birthYear = ko.pureComputed({
            read: function () {
                return vm.dateOfBirth().getFullYear();
            },
            write: function (value) {
                vm.dateOfBirth().setFullYear(value);
                updateDaysInCurrentMonth();
            },
            owner: this
        });

        vm.birthMonth = ko.pureComputed({
            read: function () {
                return vm.months[vm.dateOfBirth().getMonth()];
            },
            write: function (value) {
                vm.dateOfBirth().setMonth(vm.months.indexOf(value));
                updateDaysInCurrentMonth();
            },
            owner: this
        });

        vm.birthDate = ko.pureComputed({
            read: function () {
                return vm.dateOfBirth().getDate();
            },
            write: function (value) {
                vm.dateOfBirth().setDate(value);
            },
            owner: this
        });

        vm.saveUserCmd = ko.command({
            execute: function () {

                instrumentationSrv.trackEvent('Account', {
                    'Command': 'Save',
                    'User': vm.currentUser.userName()
                });
                vm.isBusy(true);
                datacontext.user.item.user.person.names.firstName(vm.firstName());
                datacontext.user.item.user.person.names.lastName(vm.lastName());
                datacontext.user.item.user.person.genderCode(vm.selectedGender());
                datacontext.user.item.user.person.languageCode(vm.selectedLanguage().codeValue());
                datacontext.user.item.user.person.birthDateTime(vm.dateOfBirth());
                datacontext.user.item.user.person.preferredHeightUomCode(vm.selectedUomLength().codeValue());
                datacontext.user.item.user.person.preferredWeightUomCode(vm.selectedUomWeight().codeValue());
                datacontext.user.item.user.person.subscribeForUpdate(vm.subscribeForUpdate());
                datacontext.user.saveItem().done(function () {

                    if (config.languageCode() !== datacontext.user.item.user.person.languageCode()) {
                        window.location.reload();
                    }
                    else {
                        var shell = require('viewmodels/shell');
                        shell.navigateHome();
                    }
                }).fail(function () {
                    vm.showAccountUpdateError(true);
                }).always(function () {
                    vm.isBusy(false);
                });
            },
            canExecute: function () {
                return true;
            }
        });

        vm.savePasswordCmd = ko.command({
            execute: function () {

                if (validate()) {

                    instrumentationSrv.trackEvent('Account', {
                        'Command': 'SavePassword',
                        'User': vm.currentUser.userName()
                    });

                    vm.messageDetail.message('');
                    vm.messageDetail.type('');
                    vm.isBusy(true);

                    authentication.changePassword(vm.userId(), vm.currentPassword(), vm.newPassword()).done(function (result) {
                        if (result.succeeded) {
                            vm.messageDetail.message(vm.loc.textPasswordIsChanged());
                            vm.messageDetail.type('info');
                        }
                        else {
                            vm.messageDetail.message(vm.loc.textCurrentPasswordIsWrong());
                            vm.messageDetail.type('danger');
                        }
                    }).fail(function () {
                        vm.messageDetail.message(vm.loc.textExperiencingProblem());
                        vm.messageDetail.type('danger');
                    }).always(function () {
                        vm.isBusy(false);
                    });
                } else {
                }

            },
            canExecute: function () {
                return true;
            }
        });

        vm.cancelEdit = function () {
            vm.isBusy(false);
            router.navigate('');
        };

        vm.compositionComplete = function () {
            return true;
        };

        return vm;

        function validate() {

            if (!vm.validationModel.isValid()) {
                vm.messageDetail.message(vm.loc.stringFillFormCompletely());
                vm.messageDetail.type('warning');
                return;
            }

            if (vm.newPassword() !== vm.confirmNewPassword()) {
                vm.messageDetail.message(vm.loc.textNewPasswordDoesNotMatch());
                vm.messageDetail.type('warning');
                return;
            }

            if (vm.newPassword() === vm.currentPassword()) {
                vm.messageDetail.message(vm.loc.textNewPasswordAndCurrentPasswordAreSame());
                vm.messageDetail.type('warning');
                return;
            }

            return true;
        }

        function updateDaysInCurrentMonth() {
            var d = new Date(vm.dateOfBirth().getFullYear(), vm.dateOfBirth().getMonth() + 1, 0);
            var days = [];

            for (var i = 1; i <= d.getDate(); i++) {
                days[i] = i;
            }

            vm.days(days);
        }

        function getMonths() {
            var months = [];

            for (var i = 0; i < 12; i++) {
                months[i] = moment().months(i).format('MMMM');
            }

            return months;
        }

        function getYears() {
            var endYear = new Date().getFullYear();
            var years = [];

            for (var i = 0; i < 100; i++) {
                years[i] = endYear - i;
            }

            return years;
        }

        function activate() {

            vm.firstName(datacontext.user.item.user.person.names.firstName());
            vm.lastName(datacontext.user.item.user.person.names.lastName());
            vm.selectedGender(datacontext.user.item.user.person.genderCode());
            vm.userId(datacontext.user.item.user.id());
            var languageCode = datacontext.user.item.user.person.languageCode() || config.languageCode();
            vm.selectedLanguage(vm.languageSet.getById(languageCode));

            if (datacontext.user.item.user.person.birthDateTime()) {
                vm.dateOfBirth(new Date(datacontext.user.item.user.person.birthDateTime()));
            }

            updateDaysInCurrentMonth();

            var selectedUomLengthCode = datacontext.user.item.user.person.preferredHeightUomCode() || config.lengthCode();
            vm.selectedUomLength(vm.preferredUomLengthSet.getById(selectedUomLengthCode));
            var selectedUomWidthCode = datacontext.user.item.user.person.preferredWeightUomCode() || config.widthCode();
            vm.selectedUomWeight(vm.preferredUomWeightSet.getById(selectedUomWidthCode));
            vm.subscribeForUpdate(datacontext.user.item.user.person.subscribeForUpdate());

            vm.currentPassword.extend({
                required: {
                    message: vm.loc.textEnterCurrentPassword()
                }
            });

            vm.newPassword.extend({
                required: {
                    message: vm.loc.textEnterNewPassword()
                },
                minLength: {
                    params: 6,
                    message: vm.loc.textPasswordLenghtMessage()
                }
            });

            vm.confirmNewPassword.extend({
                required: {
                    message: vm.loc.textReEnterChosenPassword()
                },
                minLength: {
                    params: 6,
                    message: vm.loc.textPasswordLenghtMessage()
                }
            });

            vm.selectedImage.fileUrl(datacontext.user.item.user.person.photoImageLocation());

            return true;
        }

        function mediaChange(newValue) {
            if (newValue) {
                datacontext.user.item.user.person.photoImageLocation(vm.selectedImage.fileUrl());
                datacontext.user.item.user.person.photoImageReference(vm.selectedImage.fileReference());
            }
        }
    });
})();
