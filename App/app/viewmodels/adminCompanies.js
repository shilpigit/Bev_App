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
                this.utilities = utilities;
                this.activate = activate;
                this.title = 'Companies';
                this.timeZones = datacontext.timeZones.items;
                this.companies = ko.observableArray();
                this.selectedImage = {
                    fileUrl: ko.observable(),
                    fileReference: ko.observable(),
                    contentType: ko.observable(),
                    percentage: ko.observable(),
                    uploadCompleted: ko.observable(),
                    size: ko.observable(20000000),
                    sizeIsValid: ko.observable(true)
                };
                this.package = ko.observable();
                this.packageFirstLoad = ko.observable(true);
                this.countries = localization.getLocalizedCodeSet('country');
                this.sponsorshipPackages = localization.getLocalizedCodeSet('sponsorshipPackage');
                this.regions = localization.getLocalizedCodeSet('region');
                this.expertiseIndustries = localization.getLocalizedCodeSet('expertiseIndustryCategory');
                this.positions = localization.getLocalizedCodeSet('position');
                this.selectedCompanyDiscipline = ko.observable();
                this.companyDisciplineIsDeleting = ko.observable(false);
                this.selectedCompanyRequirement = ko.observable();
                this.companyRequirementIsDeleting = ko.observable(false);
                // todo: refine ko.detePicker.binding to get rid of this mess
                this.localExpireDateTime = ko.observable(new Date());
                this.selectedImage.fileUrl.subscribe(mediaChange, this);
                this.localExpireDateTime.subscribe(dateChange, this);
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.reloadData = reloadData;
                this.addDiscipline = addDiscipline;
                this.newDiscipline = newDiscipline;
                this.deleteCompanyDisciplineItem = deleteCompanyDisciplineItem;
                this.cancelDeleteDiscipline = cancelDeleteDiscipline;
                this.setSelectedCompanyDisciplineItem = setSelectedCompanyDisciplineItem;
                this.addRequirement = addRequirement;
                this.newRequirement = newRequirement;
                this.deleteCompanyRequirementItem = deleteCompanyRequirementItem;
                this.cancelDeleteRequirement = cancelDeleteRequirement;
                this.setSelectedCompanyRequirementItem = setSelectedCompanyRequirementItem;
                this.textAreaGotFocus = textAreaGotFocus;
                this.textAreaLostFocus = textAreaLostFocus;
            };

            var vm = new Model();

            vm.linkMailToExecutives = ko.pureComputed(function () {
                return 'mailto:?subject=' + vm.loc.textMailToExecurtivesLinkSubject() + '&body=' + vm.selectedItem().company.executivesGroupInvitationUrl();
            }, this);

            vm.linkMailToEmployees = ko.pureComputed(function () {
                return 'mailto:?subject=' + vm.loc.textMailToEmployeesLinkSubject() + '&body=' + vm.selectedItem().company.employeesGroupInvitationUrl();
            }, this);

            vm.companyDisciplineIsSelected = ko.pureComputed(function () {
                return vm.selectedCompanyDiscipline().id() ? true : false;
            }, this);
            
            vm.companyDisciplineIsValid = ko.pureComputed(function () {
                if (!vm.selectedCompanyDiscipline().regionCodeValue() || !vm.selectedCompanyDiscipline().expertiseIndustryCodeValue() || !vm.selectedCompanyDiscipline().positionCodeValue()) {
                    return false;
                }
                return true;
            }, this);

            vm.companyRequirementIsSelected = ko.pureComputed(function () {
                return vm.selectedCompanyRequirement().id() ? true : false;
            }, this);

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

            vm.getPositionName = function (item) {

                var matches = ko.utils.arrayFilter(vm.positions.codes, function (el) {
                    return el.codeValue() === item.positionCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }

            };

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

            vm.deleteDisciplineItemCommand = ko.command({
                execute: function (item) {
                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteDiscipline',
                        'Company': vm.selectedItem().company.name()
                    });
                    vm.companyDisciplineIsDeleting(false);
                    vm.selectedItem().company.disciplines.remove(item);

                },
                canExecute: function () {
                    return true;
                }
            });

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

            vm.package.subscribe(updatePackageData, this);

            editor.extend(vm, datacontext.companies);

            return vm;
           
            function activate() {                               
                vm.companyDisciplineIsDeleting(false);
                ko.bindingHandlers.wysiwyg.defaults = {
                    'toolbar': 'undo redo | bold italic | bullist numlist ',
                    'menubar': false,
                    'statusbar': false,
                    'setup': function (ed) {
                        ed.on('keydown', function (event) {
                            if (event.keyCode === 9) { // tab pressed
                                if (event.shiftKey) {
                                    ed.execCommand('Outdent');
                                }
                                else {
                                    ed.execCommand('Indent');
                                }

                                event.preventDefault();
                                return false;
                            }
                        });
                    }
                };

                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.regions.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.expertiseIndustries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                var clipboard = new Clipboard('.copy');
                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringInvitationLinkHasBeenCopiedToClipboard());
                });

                vm.selectedCompanyDiscipline(new model.CompanyDiscipline());
                vm.selectedCompanyRequirement(new model.CompanyRequirement());
                vm.selectedItem(undefined);
                vm.canDelete(state.isAdministrator());

                vm.companies(security.listCompanyAccess());

                $('.nav-pills a').removeClass('active');
                $('.nav-pills a[href="#editCompanyProfile"]').addClass('active');

            }

            function getSelectedContainer() {

                for (var i = 0; i < vm.companies().length; i++) {
                    if (vm.companies()[i].id() === vm.selectedItemId()) {
                        return vm.companies()[i];
                    }
                }
            }

            function reloadData() {

                state.systemIsBusy(true);                
                datacontext.companies.getData(state.userId).then(function () {
                    state.systemIsBusy(false);
                });
            }

            function enterSave() {                
                vm.selectedItem().company.sponsorshipPackage.packageCodeValue(vm.package());
               // reloadData();
                return true;
            }

            function enterEdit() {
                
                $('.nav-pills li').removeClass('active');
                $('.nav-pills li:eq(0)').addClass('active');   
               
               
                $('#editCompanyProfile').addClass('active in');

                ko.bindingHandlers.wysiwyg.defaults = {
                    'toolbar': 'undo redo | bold italic | bullist numlist ',
                    'menubar': false,
                    'statusbar': false,
                    'setup': function (ed) {
                        ed.on('keydown', function (event) {
                            if (event.keyCode === 9) { // tab pressed
                                if (event.shiftKey) {
                                    ed.execCommand('Outdent');
                                }
                                else {
                                    ed.execCommand('Indent');
                                }

                                event.preventDefault();
                                return false;
                            }
                        });
                    }
                };

                
                var container = getSelectedContainer();
                if (container.company.logoImageId()) {
                    vm.selectedImage.fileUrl(utilities.resolveFileUrl(container.company.logoImageId()));
                }
                else {
                    vm.selectedImage.fileUrl(config.imageCdn + 'logo/logo-solo.png');
                }

                if (vm.selectedItem().company.sponsorshipPackage && vm.selectedItem().company.sponsorshipPackage.packageCodeValue()) {

                    vm.package(vm.selectedItem().company.sponsorshipPackage.packageCodeValue());
                }
              
            }

            function mediaChange(newValue) {
                if (newValue) {

                    var container = getSelectedContainer();
                    container.logoImageLocation(vm.selectedImage.fileUrl());
                    container.logoImageReference(vm.selectedImage.fileReference());
                }
            }

            function dateChange(newValue) {
                if (newValue) {
                    if (newValue !== vm.selectedCompanyRequirement().expireDateTime()) {
                        vm.selectedCompanyRequirement().expireDateTime(new Date(newValue));
                    }
                }
            }

            function addDiscipline() {

                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveDiscipline',
                    'Company': vm.selectedItem().company.name()
                });

                if (!vm.selectedCompanyDiscipline().id()) {
                    vm.selectedItem().company.disciplines.push(vm.selectedCompanyDiscipline());
                }

                newDiscipline();
            }

            function newDiscipline() {

                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'NewDiscipline',
                    'Company': vm.selectedItem().company.name()
                });

                vm.selectedCompanyDiscipline(new model.CompanyDiscipline());

            }

            function deleteCompanyDisciplineItem() {
                vm.companyDisciplineIsDeleting(true);
            }

            function cancelDeleteDiscipline() {
                vm.companyDisciplineIsDeleting(false);
            }

            function setSelectedCompanyDisciplineItem(item) {

                if (vm.selectedCompanyDiscipline().id()) {
                    if (vm.regions.codes[0].codeSetId() === '') {
                        vm.regions.codes.shift();
                    }
                    if (vm.expertiseIndustries.codes[0].codeSetId() === '') {
                        vm.expertiseIndustries.codes.shift();
                    }
                    if (vm.positions.codes[0].codeSetId() === '') {
                        vm.positions.codes.shift();
                    }
                }

                var index = vm.selectedItem().company.disciplines().indexOf(item);
                vm.selectedCompanyDiscipline(vm.selectedItem().company.disciplines()[index]);

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

            // bullshit static checking "for NOW"
            function updatePackageData() {

                if (!vm.packageFirstLoad() && vm.package() !== vm.selectedItem().company.sponsorshipPackage.packageCodeValue()) {

                    if (vm.package() === 'platinumPlan') {
                        vm.selectedItem().company.sponsorshipPackage.administratorsCount(1);
                        vm.selectedItem().company.sponsorshipPackage.executivesCount(10);
                        vm.selectedItem().company.sponsorshipPackage.employeesCount(0);
                        vm.selectedItem().company.sponsorshipPackage.vacanciesCount(-1);

                        return;
                    }
                    if (vm.package() === 'goldPlan') {
                        vm.selectedItem().company.sponsorshipPackage.administratorsCount(1);
                        vm.selectedItem().company.sponsorshipPackage.executivesCount(5);
                        vm.selectedItem().company.sponsorshipPackage.employeesCount(0);
                        vm.selectedItem().company.sponsorshipPackage.vacanciesCount(-1);

                        return;
                    }
                    if (vm.package() === 'silverPlan') {
                        vm.selectedItem().company.sponsorshipPackage.administratorsCount(1);
                        vm.selectedItem().company.sponsorshipPackage.executivesCount(1);
                        vm.selectedItem().company.sponsorshipPackage.employeesCount(0);
                        vm.selectedItem().company.sponsorshipPackage.vacanciesCount(50);

                        return;
                    }
                    if (vm.package() === 'bronzePlan') {
                        vm.selectedItem().company.sponsorshipPackage.administratorsCount(1);
                        vm.selectedItem().company.sponsorshipPackage.executivesCount(0);
                        vm.selectedItem().company.sponsorshipPackage.employeesCount(0);
                        vm.selectedItem().company.sponsorshipPackage.vacanciesCount(0);

                        return;
                    }

                }
                vm.packageFirstLoad(false);
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
