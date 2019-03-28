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
                this.companies = ko.observableArray();
                this.selectedCompanyGraduateRecruitment = ko.observable();
                this.companyGraduateRecruitmentIsDeleting = ko.observable(false);
                this.years = getYears();
                this.months = getMonths();
                this.days = ko.observableArray();
                this.selectedYear = ko.observable();
                this.selectedMonth = ko.observable();
                this.selectedDay = ko.observable();
                this.lockDay = ko.observable(false);
                this.enterSave = enterSave;
                this.enterEdit = enterEdit;
                this.cancelEdit = cancelEdit;
                this.reloadData = reloadData;
                this.addCampaign = addCampaign;
                this.newCampaign = newCampaign;
                this.deleteCompanyGraduateRecruitmentItem = deleteCompanyGraduateRecruitmentItem;
                this.cancelDeleteCampaign = cancelDeleteCampaign;
                this.setSelectedCompanyGraduateRecruitmentItem = setSelectedCompanyGraduateRecruitmentItem;
                this.getYears = getYears;
                this.getMonths = getMonths;
                this.updateDaysInCurrentDay = updateDaysInCurrentDay;
                this.updateDaysInCurrentMonth = updateDaysInCurrentMonth;
                this.updateDaysInCurrentYear = updateDaysInCurrentYear;
                this.textAreaGotFocus = textAreaGotFocus;
                this.textAreaLostFocus = textAreaLostFocus;
            };

            var vm = new Model();

            vm.getRelativeIntakeDateTime = function (item) {

                if (item.dateOfIntake()) {
                    return moment(item.dateOfIntake()).fromNow();
                }
                else {
                    return 'Who Knows!';
                }

            };

            vm.deleteGraduateRecruitmentItemCommand = ko.command({
                execute: function (item) {

                    instrumentationSrv.trackEvent('CompanyProfile', {
                        'Command': 'DeleteRequirement',
                        'Company': vm.selectedItem().company.name()
                    });

                    vm.selectedItem().company.graduateRecruitments.remove(item);

                },
                canExecute: function () {
                    return true;
                }
            });
          
            vm.companyGraduateRecruitmentIsSelected = ko.pureComputed(function () {
                return vm.selectedCompanyGraduateRecruitment().id() ? true : false;
            }, this);

            vm.selectedDay.subscribe(updateDaysInCurrentDay, this);
            vm.selectedMonth.subscribe(updateDaysInCurrentMonth, this);
            vm.selectedYear.subscribe(updateDaysInCurrentYear, this);
            editor.extend(vm, datacontext.companies);
            return vm;

            function activate() {
                vm.companyGraduateRecruitmentIsDeleting(false);
                vm.selectedCompanyGraduateRecruitment(new model.CompanyGraduateRecruitment());
                vm.selectedItem(undefined);
                vm.canDelete(false);

                vm.companies(security.listCompanyAccess());

            }

            function enterSave() {
                return true;
            }

            function enterEdit() {

            }

            function cancelEdit() {
                vm.isEditing(false);
            }


            function reloadData() {
                state.systemIsBusy(true);
                datacontext.companies.getData(state.userId).then(function () {

                    var searchVm = require('viewmodels/adminCompanyGraduateRecruitmentSearch');

                    searchVm.filterCompanies();

                    state.systemIsBusy(false);
                });

                return true;
            }

            function getYears() {
                var endYear = new Date().getFullYear();
                var years = [];

                for (var i = 0; i < 5; i++) {
                    years[i] = endYear + i;
                }

                return years;
            }

            function getMonths() {
                var months = [];

                for (var i = 0; i < 12; i++) {
                    months[i] = moment().months(i).format('MMMM');
                }

                return months;
            }

            function updateDaysInCurrentDay() {
                vm.selectedCompanyGraduateRecruitment().dateOfIntake(
                    new Date(moment.utc(vm.selectedYear() + '-' + vm.selectedMonth() + '-' + vm.selectedDay() + ' 00:00:00', 'YYYY-MMMM-DD HH:mm:ss').format()));
            }
            function updateDaysInCurrentMonth() {

                var d = moment(vm.selectedYear() + '-' + vm.selectedMonth() + '-' + 1, 'YYYY-MMMM-DD');
                var days = [];

                for (var i = 1; i <= d.daysInMonth(); i++) {
                    days[i - 1] = i;
                }

                vm.days(days);

            }
            function updateDaysInCurrentYear() {
                vm.selectedCompanyGraduateRecruitment().dateOfIntake(
                    new Date(moment.utc(vm.selectedYear() + '-' + vm.selectedMonth() + '-' + vm.selectedDay() + ' 00:00:00', 'YYYY-MMMM-DD HH:mm:ss').format()));
            }

            function addCampaign() {

                // log it first
                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'SaveGraduateRecruitmentCampaign',
                    'Company': vm.selectedItem().company.name()
                });

                vm.selectedCompanyGraduateRecruitment().dateOfIntake(
                    new Date(moment.utc(vm.selectedYear() + '-' + vm.selectedMonth() + '-' + vm.selectedDay() + ' 00:00:00', 'YYYY-MMMM-DD HH:mm:ss').format()));

                vm.selectedCompanyGraduateRecruitment().createdDateTime(new Date());

                if (!vm.selectedCompanyGraduateRecruitment().id()) {

                    vm.selectedItem().company.graduateRecruitments.push(vm.selectedCompanyGraduateRecruitment());

                }

                newCampaign();
            }

            function newCampaign() {

                instrumentationSrv.trackEvent('CompanyProfile', {
                    'Command': 'newCampaign',
                    'Company': vm.selectedItem().company.name()
                });

                vm.selectedCompanyGraduateRecruitment(new model.CompanyGraduateRecruitment());

            }

            function deleteCompanyGraduateRecruitmentItem() {
                vm.companyGraduateRecruitmentIsDeleting(true);
            }

            function cancelDeleteCampaign() {
                vm.companyGraduateRecruitmentIsDeleting(false);
            }

            function setSelectedCompanyGraduateRecruitmentItem(item) {

                var index = vm.selectedItem().company.graduateRecruitments().indexOf(item);
                vm.selectedCompanyGraduateRecruitment(vm.selectedItem().company.graduateRecruitments()[index]);


                var intakeDate = new Date(vm.selectedItem().company.graduateRecruitments()[index].dateOfIntake());
                var momentInatkeDate = moment(intakeDate);

                vm.selectedYear(momentInatkeDate.format('YYYY'));
                vm.selectedMonth(momentInatkeDate.format('MMMM'));
                vm.selectedDay(momentInatkeDate.format('DD'));

                vm.lockDay(true);
                // bullshit late binding
                setTimeout(function () {
                    vm.selectedDay(momentInatkeDate.format('DD'));
                    vm.lockDay(false);
                }, 1000);

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
