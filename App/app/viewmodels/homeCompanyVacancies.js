(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/security',
            'services/core/state',
            'services/core/instrumentation',
            'services/candidateProfile',
            'services/utilities',
        ],
        function (app, localization, datacontext, editor, security, state, instrumentationSrv, candidateProfileSrv, utilities) {

            var Model = function () {
                this.title = 'Vacancies';                
                this.activate = activate;
                this.state = state;
                this.loc = datacontext.translations.item;
                this.vacancies = ko.observableArray();
                this.countries = localization.getLocalizedCodeSet('country');
                this.industryExperiences = localization.getLocalizedCodeSet('industryExperience');
                this.employmentTypes = localization.getLocalizedCodeSet('employmentType');
                this.currencies = localization.getLocalizedCodeSet('currency');
                this.educations = localization.getLocalizedCodeSet('education');
                this.summaryOfExperienceCategories = localization.getLocalizedCodeSet('summaryOfExperienceCategory');
                this.dSummaryOfExperienceCategories = localization.getLocalizedCodeSet('dSummaryOfExperienceCategory');
                this.nDSummaryOfExperienceCategories = localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');
                this.companies = ko.observableArray();
                this.selectedCompany = ko.observable();
                this.showSecondLevel = ko.observable(false);
                this.resetAgingEpoch = ko.observable(false);
                this.canCreate = ko.observable(false);
                this.textAreaGotFocus = textAreaGotFocus;
                this.textAreaLostFocus = textAreaLostFocus;
                this.selectedCompany.subscribe(selectedCompanyChanged, this);
                this.isVacancyActive = isVacancyActive;
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.reloadData = reloadData;
                this.postDelete = postDelete;
            };

            var vm = new Model();

            // Some other things
            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.experienceDisciplineSecondLevelCodeValue = ko.pureComputed({
                read: function () {
                    if (vm.selectedItem().summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {
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
                    var data = candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedItem().experienceDisciplineFirstLevelCodeValue());

                    data.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    return data;
                }
            });

            vm.createIsEnabled = ko.pureComputed(function () {
                return vm.vacancies().length < vm.selectedCompany().company.sponsorshipPackage.vacanciesCount() || vm.selectedCompany().company.sponsorshipPackage.vacanciesCount() === -1;
            }, this);

            vm.resetAgingIsEnabled = ko.pureComputed(function () {    

                return vm.selectedItem().agingEpoch() && vm.selectedItem().agingEpoch() !== 0;
            }, this);

            editor.extend(vm, datacontext.vacancies);


            return vm;

            function selectedCompanyChanged() {
                listVacancies(vm.selectedCompany().id());
            }

            function listVacancies(companyId) {

                instrumentationSrv.trackEvent('CompanyVacancies', {'Command': 'ListVacancies'});

                vm.vacancies.removeAll();
                ko.utils.arrayFilter(datacontext.vacancies.items(), function (el) {
                    if (el.companyId() === companyId) {
                        vm.vacancies.push(el);
                    }
                });

                if (vm.vacancies().length === 0) {
                    showMessage(vm.loc.stringNoVacancyAvaliable(), 'warning');
                }

            }

            function isVacancyActive(data) {                
                return data.isActive() && (moment().diff(moment((data.agingEpoch() * 1000)).add(data.jobAge(), 'days'), 'days') <= 0);
            }

            function enterEdit() {                
                if (vm.resetAgingIsEnabled()) {
                    vm.resetAgingEpoch(false);
                } else {
                    vm.resetAgingEpoch(true);
                }

                return true;
            }

            function enterSave() {                                
                vm.selectedItem().companyId(vm.selectedCompany().id());

                if (vm.selectedItem().agingEpoch() === 0 || vm.resetAgingEpoch()) {
                    vm.selectedItem().agingEpoch(parseInt(Date.now() / 1000));
                }

                return vm.selectedCompany().id();
            }

            function reloadData() {
                listVacancies(vm.selectedCompany().id());
                return true;
            }

            function postDelete() {                
                vm.vacancies.remove(function (item) {
                    return item.id() === vm.selectedItem().id();
                });
                return true;
            }

            function activate() {

                // sort countries
                vm.countries.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.employmentTypes.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.summaryOfExperienceCategories.codes.sort(function (left, right) {
                    return left.name() < right.name() ? -1 : 1;
                });

                vm.selectedItem(undefined);

                vm.companies([]);
                ko.utils.arrayFirst(security.listCompanyAccess(), function (company) {
                        if (security.checkPartyAccess(company.organizationId(), 'vacancy', 'view')) {
                            vm.companies.push(company);
                        }
                    }
                );

                if (vm.companies().length > 0) {
                    vm.selectedCompany(vm.companies()[0]);
                    vm.reloadData();
                    vm.canEdit(security.checkPartyAccess(vm.selectedCompany().organizationId(), 'vacancy', 'edit'));
                    vm.canDelete(security.checkPartyAccess(vm.selectedCompany().organizationId(), 'vacancy', 'delete'));
                    vm.canCreate(security.checkPartyAccess(vm.selectedCompany().organizationId(), 'vacancy', 'create'));

                    vm.companies.sort(function (left, right) {
                        return left.companyName() < right.companyName() ? -1 : 1;
                    });

                    showMessage(vm.loc.stringEditVacancyTip(), 'info');
                }
                else {
                    showMessage(vm.loc.testNoCompanyAccess(), 'info');
                }

                return true;
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

            function showMessage(message, type) {
                vm.messageDetail.message(message);
                vm.messageDetail.type(type);

            }

        });
}());
