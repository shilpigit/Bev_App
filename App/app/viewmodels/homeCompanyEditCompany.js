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
            'services/core/state'
        ],
        function (app, router, logger, config, dataservice, datacontext, security, localization, state) {
            var vm = {
                title: 'Companies Panel',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                state: state,
                selectedView: ko.observable('dashboard'),
                companies: ko.observableArray(),
                company: ko.observable(),
                currentUser: datacontext.user.item.user,
                sponsorshipPackages: localization.getLocalizedCodeSet('sponsorshipPackage'),
                countries: localization.getLocalizedCodeSet('country'),
                timeZones: datacontext.timeZones.items,
                parent: ko.observable(),

                selectedImage: {
                    fileUrl: ko.observable(),
                    fileReference: ko.observable(),
                    contentType: ko.observable(),
                    percentage: ko.observable(),
                    uploadCompleted: ko.observable(),
                    size: ko.observable(20000000),
                    sizeIsValid: ko.observable(true)
                },

                isBusy: ko.observable(false),
                setSelectedView: setSelectedView,
                cancelEdit: cancelEdit
            };

            vm.selectedImage.fileUrl.subscribe(mediaChange, vm);
            vm.saveCommand = saveCommand();

            return vm;

            function mediaChange(newValue) {
                if (newValue) {

                    vm.company().logoImageLocation(vm.selectedImage.fileUrl());
                    vm.company().logoImageReference(vm.selectedImage.fileReference());
                }
            }

            function setSelectedView(view) {
                vm.parent().setSelectedView(view);
            }

            function cancelEdit() {
                vm.isBusy(false);
                setSelectedView('dashboard');
            }

            function saveCommand() {
                return ko.asyncCommand({
                    execute: function (callback) {

                        state.systemIsBusy(true);
                        // Save
                        datacontext.companies.saveItem(vm.company(),
                            {
                                success: function () {
                                    callback();

                                    vm.company().commit();

                                    state.systemIsBusy(false);

                                    cancelEdit();

                                },
                                failure: function () {
                                    callback();
                                    logger.logError('An Error occurred while saving company profile');
                                    state.systemIsBusy(false);
                                }
                            });
                    }
                });
            }

            function activate() {

                vm.parent(require('viewmodels/homeCompany'));
                vm.companies(security.listCompanyAccess());
                vm.company(vm.companies()[0]);

                if (vm.company().logoImageLocation()) {
                    vm.selectedImage.fileUrl(vm.company().logoImageLocation());
                }
                else {
                    vm.selectedImage.fileUrl(config.imageCdn + 'logo/logo-solo.png');
                }
            }

        });
}());
