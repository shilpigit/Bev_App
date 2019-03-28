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
            'model/model',
            'services/vacancy',
            'services/core/instrumentation',
            'services/candidateProfile',
            'services/utilities',
            'viewmodels/behaviors/editor'
        ],
        function (app, router, logger, config, dataservice, datacontext, security, localization, state, model, vacancySrv, instrumentationSrv, candidateProfileSrv, utilities) {
            var vm = {
                title: 'Candidate Profile',
                activate: activate,
                utilities: utilities,
                config: config,
                loc: datacontext.translations.item,
                myApplications: datacontext.myVacancyApplications.items,
                countries: localization.getLocalizedCodeSet('country'),
                vacancySearchOrderBy: localization.getLocalizedCodeSet('vacancySearchOrderBy'),
                industryExperiences: localization.getLocalizedCodeSet('industryExperience'),
                employmentTypes: localization.getLocalizedCodeSet('employmentType'),
                currencies: localization.getLocalizedCodeSet('currency'),
                educations: localization.getLocalizedCodeSet('education'),
                summaryOfExperienceCategories: localization.getLocalizedCodeSet('summaryOfExperienceCategory'),
                dSummaryOfExperienceCategories: localization.getLocalizedCodeSet('dSummaryOfExperienceCategory'),
                nDSummaryOfExperienceCategories: localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory'),
                state: state,
                parent: ko.observable(),
                userId: ko.observable(),
                userName: ko.observable(),
                searchPhrase: ko.observable(''),
                vacancySearchResult: ko.observableArray(),
                hasResult: ko.observable(),
                countryCodeValue: ko.observable(),
                industryExperienceCodeValue: ko.observable(),
                employmentTypeCodeValue: ko.observable(),
                salarySought: ko.observable(new model.SalarySought()),
                educationCodeValue: ko.observable(),
                summaryOfExperienceCategoryCodeValue: ko.observable(),
                selectedExperienceDisciplineFirstLevelCodeValue: ko.observable(''),
                selectedExperienceDisciplineSecondLevelCodeValue: ko.observable(),
                orderByCodeValue: ko.observable(),
                isShowingGuide: ko.observable(false),
                showSecondLevel: ko.observable(false),
                pagingTokens: ko.observableArray(['', '']),
                recordsCount: ko.observable(0),
                isPaging: ko.observable(false),
                isBusy: ko.observable(false),
                dataIsBound: ko.observable(false),
                setSelectedView: setSelectedView,
                startSearch: startSearch,
                startSearchNext: startSearchNext,
                startSearchBack: startSearchBack,
                showGuide: showGuide
            };

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.alreadyApplied = function (item) {

                var matches = ko.utils.arrayFilter(vm.myApplications(), function (el) {
                    return el.userAccountId() === vm.userId() && el.vacancyId() === item.id();
                });

                return matches.length > 0;
            };

            vm.getIndustryExperienceName = function (item) {

                var matches = ko.utils.arrayFilter(vm.industryExperiences.codes, function (el) {
                    return item.industryExperienceCodeValue() && el.codeValue() === item.industryExperienceCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }

            };

            vm.getEmploymentTypeName = function (item) {

                var employmentTypeNames = '';

                if (item.employmentTypeCodeValues()) {
                    for (var i = 0; i < item.employmentTypeCodeValues().length; i++) {

                        for (var j = 0; j < vm.employmentTypes.codes.length; j++) {
                            if (vm.employmentTypes.codes[j].codeValue() === item.employmentTypeCodeValues()[i]) {

                                employmentTypeNames += vm.employmentTypes.codes[j].name();

                                if (i < item.employmentTypeCodeValues().length - 1) {
                                    employmentTypeNames += ', ';
                                }
                            }
                        }
                    }

                    if (employmentTypeNames.length > 0) {
                        return employmentTypeNames;
                    }
                }
                return vm.loc.stringUnknown();

            };

            vm.getLocationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return item.countryCode() && el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {
                    return item.cityName() ? matches[0].name() + '/' + item.cityName() : matches[0].name();
                }
            };

            vm.userCanApply = function (item) {

                var matches = ko.utils.arrayFilter(item.applicants(), function (el) {
                    return el.userAccountId() === vm.userId() && el.isDeleted() === false;
                });

                if (matches.length > 0) {
                    return false;
                }
                else {
                    return true;
                }
            };

            vm.getCompanyProfileUrl = function (item) {
                return '#/viewcompanyprofile/' + item.companyContainer.id();
            };

            vm.getViewVacancyUrl = function (item) {
                return '#/viewvacancy/' + item.id();
            };

            vm.loadVacancyDetailCmd = ko.command({
                execute: function (data) {

                    instrumentationSrv.trackEvent('UserVacancySearch',
                        {
                            'Command': 'LoadVacancyDetail',
                            'JobTitle': data.jobTitle(),
                            'User': vm.userName()
                        });

                    data.isBeingShown(true);

                    data.isBeingShown(false);
                    data.vacancyIsLoaded(true);
                },
                canExecute: function (isExecuting) {
                    return !isExecuting;
                }
            });

            vm.applyForVacancyCmd = ko.command({
                execute: function (data) {

                    instrumentationSrv.trackEvent('UserVacancySearch',
                        {
                            'Command': 'ApplyForVacancy',
                            'JobTitle': data.jobTitle(),
                            'User': vm.userName()
                        });

                    data.isBeingApplied(true);
                    vacancySrv.applyForVacancy(data, vm.userId()).done(function () {
                        data.isBeingApplied(false);
                    });

                },
                canExecute: function (isExecuting) {
                    return !isExecuting;
                }
            });

            vm.experienceDisciplineSecondLevelCodeValue = ko.pureComputed({
                read: function () {
                    if (vm.summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {
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

                        nDSummaryOfExperienceCategory.codes.unshift({
                            codeValue: ko.observable(''),
                            name: ko.observable('All'),
                            codeSetId: ko.observable(''),
                            sortOrder: ko.observable(-1)
                        });

                        return nDSummaryOfExperienceCategory;
                    }
                }
            });

            vm.experienceDisciplineThirdLevelCodeValue = ko.pureComputed({
                read: function () {

                    if(!vm.selectedExperienceDisciplineFirstLevelCodeValue()){
                        vm.showSecondLevel(false);
                        return ko.observableArray();
                    }

                    var data = candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedExperienceDisciplineFirstLevelCodeValue());

                    data.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    data.codes.unshift({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.showSecondLevel(true);
                    return data;
                }
            });

            vm.getEducationLevel = function (item) {

                var matches = ko.utils.arrayFilter(vm.educations.codes, function (el) {
                    return item.educationCodeValue() && el.codeValue() === item.educationCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }
                else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getSalarySought = function (item) {

                var matches = ko.utils.arrayFilter(vm.currencies.codes, function (el) {
                    return item.salarySought && item.salarySought.currencyCodeValue() && el.codeValue() === item.salarySought.currencyCodeValue();
                });

                if (matches.length > 0) {
                    return item.salarySought.amount() ? matches[0].name() + ' ' + item.salarySought.amount() : vm.loc.stringUnknown();
                } else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.pagesCount = ko.pureComputed({
                read: function () {
                    return Math.ceil(vm.recordsCount() / 10);
                }
            });

            vm.currentPageIndex = ko.pureComputed({
                read: function () {
                    return vm.pagingTokens().length - 2;
                }
            });

            return vm;

            function showGuide() {
                vm.isShowingGuide(!vm.isShowingGuide());
            }

            function loadSearchPage(direction) {

                var vacancySearchParameter = new model.VacancySearchParameter();

                if (!direction) {
                    vacancySearchParameter.token('');
                }
                else if (direction === 'next') {
                    if (vm.pagingTokens()[vm.pagingTokens().length - 1] !== '') {
                        vacancySearchParameter.token(vm.pagingTokens()[vm.pagingTokens().length - 1]);
                    }
                    vm.isPaging(true);
                }
                else if (direction === 'back') {

                    if (vm.pagingTokens().length - 2 >= 2) {

                        vacancySearchParameter.token(vm.pagingTokens()[vm.pagingTokens().length - 3]);
                        // remove latest 2 items
                        vm.pagingTokens.splice(vm.pagingTokens().length - 2, 2);
                    }
                    vm.isPaging(true);
                }

                vacancySearchParameter.searchPhrase(vm.searchPhrase());
                vacancySearchParameter.countryCodeValue(vm.countryCodeValue());
                vacancySearchParameter.orderByCodeValue(vm.orderByCodeValue());
                vacancySearchParameter.industryExperienceCodeValue(vm.industryExperienceCodeValue());
                vacancySearchParameter.employmentTypeCodeValue(vm.employmentTypeCodeValue());
                vacancySearchParameter.salarySoughtCurrencyCodeValue = vm.salarySought.currencyCodeValue;
                vacancySearchParameter.salarySoughtAmount = vm.salarySought.amount;
                vacancySearchParameter.educationCodeValue(vm.educationCodeValue());
                vacancySearchParameter.summaryOfExperienceCategoryCodeValue(vm.summaryOfExperienceCategoryCodeValue());
                vacancySearchParameter.experienceDisciplineFirstLevelCodeValue(vm.selectedExperienceDisciplineFirstLevelCodeValue());

                if (vm.showSecondLevel()) {
                    vacancySearchParameter.experienceDisciplineSecondLevelCodeValue(vm.selectedExperienceDisciplineSecondLevelCodeValue());
                } else {
                    vacancySearchParameter.experienceDisciplineSecondLevelCodeValue('');
                }

                datacontext.vacancyPagedSearch.getItem(vacancySearchParameter).then(function () {
                    if (datacontext.vacancyPagedSearch.item && datacontext.vacancyPagedSearch.item.vacancySearchResult().length > 0) {
                        vm.vacancySearchResult(datacontext.vacancyPagedSearch.item.vacancySearchResult());

                        vm.pagingTokens.push(datacontext.vacancyPagedSearch.item.continuationToken());

                        if (!direction) {
                            vm.recordsCount(datacontext.vacancyPagedSearch.item.recordsCount());
                        }

                        if (vm.recordsCount() > 0) {
                            vm.hasResult(true);
                        }
                    }
                    else {
                        vm.messageDetail.type('info');
                        vm.vacancySearchResult([]);
                        vm.hasResult(false);
                        vm.messageDetail.message(vm.loc.stringVacancySearchHasNoResult());
                    }

                    vm.isBusy(false);
                    vm.isPaging(false);
                });

            }

            function startSearchNext() {
                loadSearchPage('next');
            }

            function startSearchBack() {
                loadSearchPage('back');
            }

            function startSearch() {

                instrumentationSrv.trackEvent('UserVacancySearch', {
                    'Command': 'StartSearch',
                    'CountryCodeValue': vm.countryCodeValue(),
                    'OrderByCodeValue': vm.orderByCodeValue()
                });

                vm.messageDetail.message('');
                vm.isBusy(true);
                vm.isShowingGuide(false);

                vm.pagingTokens(['', '']);

                loadSearchPage();
            }

            function setSelectedView(view) {
                vm.parent().setSelectedView(view);
            }

            function activate() {

                vm.parent(require('viewmodels/homeUser'));

                vm.userId(datacontext.user.item.user.id());
                vm.userName(datacontext.user.item.user.userName());

                if (!vm.dataIsBound()) {
                    vm.countries.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.vacancySearchOrderBy.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.employmentTypes.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.summaryOfExperienceCategories.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.countries.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.industryExperiences.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.employmentTypes.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.educations.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.currencies.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.summaryOfExperienceCategories.codes.push({
                        codeValue: ko.observable(''),
                        name: ko.observable('All'),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.dataIsBound(true);
                }
            }

        });
}());
