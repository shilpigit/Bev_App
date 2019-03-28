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
            'Clipboard',
            'services/core/instrumentation',
            'services/candidateProfile',
            'viewmodels/behaviors/editor'
        ],
        function (app, router, logger, config, dataservice, datacontext, security, localization, state, model, Clipboard, instrumentation, candidateProfileSrv) {
            var vm = {
                title: 'Candidate Profile',
                activate: activate,
                config: config,
                state: state,
                loc: datacontext.translations.item,
                countries: localization.getLocalizedCodeSet('country'),
                vacancySearchOrderBy: localization.getLocalizedCodeSet('vacancySearchOrderBy'),
                currencies: localization.getLocalizedCodeSet('currency'),
                educations: localization.getLocalizedCodeSet('education'),
                employmentTypes: localization.getLocalizedCodeSet('employmentType'),
                industryExperiences: localization.getLocalizedCodeSet('industryExperience'),
                availabilities: localization.getLocalizedCodeSet('availability'),
                willingToRelocates: localization.getLocalizedCodeSet('willingToRelocate'),
                summaryOfExperienceCategories: localization.getLocalizedCodeSet('summaryOfExperienceCategory'),
                dSummaryOfExperienceCategories: localization.getLocalizedCodeSet('dSummaryOfExperienceCategory'),
                nDSummaryOfExperienceCategories: localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory'),
                parent: ko.observable(),
                userId: ko.observable(),
                searchPhrase: ko.observable(),
                candidateProfiles: ko.observableArray(),
                hasResult: ko.observable(),
                isShowingGuide: ko.observable(false),
                showSecondLevel: ko.observable(false),
                countryCodeValue: ko.observable(''),
                educationCodeValue: ko.observable(''),
                nationalityCodeValue: ko.observable(''),
                employmentTypeCodeValue: ko.observable(''),
                industryExperienceCodeValue: ko.observable(''),
                salarySought: ko.observable(new model.SalarySought()),
                summaryOfExperienceCategoryCodeValue: ko.observable(''),
                selectedExperienceDisciplineFirstLevelCodeValue: ko.observable(''),
                selectedExperienceDisciplineSecondLevelCodeValue: ko.observable(''),
                selectedcategoryOfPersonnelCodeValue: ko.observable(''),
                advancedEducationCodeValue: ko.observable(''),
                orderByCodeValue: ko.observable(''),
                currentCountryCodeValue: ko.observable(''),
                currentAvailabilityCodeValue: ko.observable(''),
                willingToRelocateCodeValue: ko.observable(''),
                authorizedToWorkCodeValue: ko.observable(''),
                willingToTravel: ko.observable(''),
                pagingTokens: ko.observableArray(['', '']),
                recordsCount: ko.observable(0),
                isPaging: ko.observable(false),
                isBusy: ko.observable(false),
                dataIsBound: ko.observable(false),
                setSelectedView: setSelectedView,
                startSearch: startSearch,
                startSearchNext: startSearchNext,
                startSearchBack: startSearchBack,
                startAdvancedSearch: startAdvancedSearch,
                showGuide: showGuide
            };          
            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.experienceDisciplineSecondLevelCodeValue = ko.pureComputed({
                read: function () {
                    
                    if (vm.summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {
                        vm.showSecondLevel(false);

                        var dSummaryOfExperienceCategory = localization.getLocalizedCodeSet('dSummaryOfExperienceCategory');

                        dSummaryOfExperienceCategory.codes.sort(function (left, right) {
                            return left.name() < right.name() ? -1 : 1;
                        });

                        dSummaryOfExperienceCategory.codes.push({
                            codeValue: ko.observable(''),
                            //name: ko.observable(vm.loc.stringAll()),
                            codeSetId: ko.observable(''),
                            sortOrder: ko.observable(-1)
                        });

                        return dSummaryOfExperienceCategory;
                    }
                    else {
                        vm.showSecondLevel(true);
                        var nDSummaryOfExperienceCategory = localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');

                        nDSummaryOfExperienceCategory.codes.sort(function (left, right) {
                            return left.name() < right.name() ? -1 : 1;
                        });

                        nDSummaryOfExperienceCategory.codes.push({
                            codeValue: ko.observable(''),
                            //name: ko.observable(vm.loc.stringAll()),
                            codeSetId: ko.observable(''),
                            sortOrder: ko.observable(-1)
                        });

                        return nDSummaryOfExperienceCategory;
                    }
                }
            });

            vm.experienceDisciplineThirdLevelCodeValue = ko.pureComputed({
                read: function () {                    
                    var data = candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedExperienceDisciplineFirstLevelCodeValue());

                    data.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    if (!vm.selectedExperienceDisciplineFirstLevelCodeValue()) {
                        data.codes = [];
                    }

                    data.codes.push({
                        codeValue: ko.observable(''),
                        //name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    if (!vm.selectedExperienceDisciplineFirstLevelCodeValue()) {
                        vm.showSecondLevel(false);
                    } else {
                        vm.showSecondLevel(true);
                    }

                    vm.selectedExperienceDisciplineSecondLevelCodeValue('');

                    return data;
                }
            });

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

            vm.getCandidateProfileUrl = function (item) {
                return '#/viewcandidateprofile/' + item.candidateProfile.id();
            };

            vm.getLinkMailToCandidate = function (item) {

                return 'mailto:' + item.owner.emailAddress();
            };

            vm.getEducationLevel = function (item) {

                var matches = ko.utils.arrayFilter(vm.educations.codes, function (el) {
                    return el.codeValue() === item.candidateProfile.educationCodeValue();
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
                    return el.codeValue() === item.candidateProfile.salarySought.currencyCodeValue();
                });

                if (matches.length > 0) {
                    return item.candidateProfile.salarySought.amount() ? matches[0].name() + ' ' + item.candidateProfile.salarySought.amount() : vm.loc.stringUnknown();
                } else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getCurrentLocationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.candidateProfile.countryCode();
                });

                if (matches.length > 0) {
                    return item.candidateProfile.cityName() ? matches[0].name() + '/' + item.candidateProfile.cityName() : matches[0].name();
                } else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getCandidateImageUrl = function (item) {

                if (item.owner.person.photoImageId()) {
                    return config.root + 'api/storage/redirect?id=' + item.owner.person.photoImageId();
                }

                return config.imageCdn + 'logo/logo-solo.png';
            };

            vm.getCandidateCvUrl = function (item) {

                if (item.candidateProfile.cvFileId()) {
                    return config.root + 'api/storage/redirect?id=' + item.candidateProfile.cvFileId();
                }

                return '';
            };

            return vm;

            function showGuide() {
                vm.isShowingGuide(!vm.isShowingGuide());
            }

            function loadSearchPage(direction) {

                var candidateProfileSearchParameter = new model.CandidateProfileSearchParameter();

                if (!direction) {
                    candidateProfileSearchParameter.token('');
                }
                else if (direction === 'next') {                    
                    if (vm.pagingTokens()[vm.pagingTokens().length - 1] !== '') {
                        candidateProfileSearchParameter.token(vm.pagingTokens()[vm.pagingTokens().length - 1]);
                    }
                    vm.isPaging(true);
                }
                else if (direction === 'back') {

                    if (vm.pagingTokens().length - 2 >= 2) {

                        candidateProfileSearchParameter.token(vm.pagingTokens()[vm.pagingTokens().length - 3]);
                        vm.pagingTokens.splice(vm.pagingTokens().length - 2, 2);
                    }
                    vm.isPaging(true);
                }
                
                candidateProfileSearchParameter.searchPhrase(vm.searchPhrase() ? vm.searchPhrase() : '*');
                candidateProfileSearchParameter.countryCodeValue(vm.currentCountryCodeValue());
                candidateProfileSearchParameter.nationalityCodeValue(vm.nationalityCodeValue());
                candidateProfileSearchParameter.industryExperienceCodeValue(vm.industryExperienceCodeValue());
                candidateProfileSearchParameter.educationCodeValue(vm.advancedEducationCodeValue());

                candidateProfileSearchParameter.summaryOfExperienceCategoryCodeValue(vm.summaryOfExperienceCategoryCodeValue());
                candidateProfileSearchParameter.experienceDisciplineFirstLevelCodeValue(vm.selectedExperienceDisciplineFirstLevelCodeValue());
                if (vm.showSecondLevel()) {
                    candidateProfileSearchParameter.experienceDisciplineSecondLevelCodeValue(vm.selectedExperienceDisciplineSecondLevelCodeValue());
                } else {
                    candidateProfileSearchParameter.experienceDisciplineSecondLevelCodeValue('');
                }

                candidateProfileSearchParameter.currentAvailabilityCodeValue(vm.currentAvailabilityCodeValue());
                candidateProfileSearchParameter.employmentTypeCodeValue(vm.employmentTypeCodeValue());

                datacontext.candidateProfilePagedSearch.getItem(candidateProfileSearchParameter).then(function () {                    
                    if (datacontext.candidateProfilePagedSearch.item && datacontext.candidateProfilePagedSearch.item.candidateProfileContainers().length > 0) {
                        vm.candidateProfiles(datacontext.candidateProfilePagedSearch.item.candidateProfileContainers());

                        vm.pagingTokens.push(datacontext.candidateProfilePagedSearch.item.continuationToken());

                        if (!direction) {
                            vm.recordsCount(datacontext.candidateProfilePagedSearch.item.recordsCount());
                        }

                        if (vm.recordsCount() > 0) {
                            vm.hasResult(true);
                        }
                    } else {
                        vm.messageDetail.type('info');
                        vm.candidateProfiles([]);
                        vm.hasResult(false);
                        vm.messageDetail.message(vm.loc.stringCandidateProfileSearchHasNoResult());
                        vm.isShowingGuide(true);
                    }
                    vm.isBusy(false);
                    vm.isPaging(false);
                });
            }

            function startSearch() {
               
                instrumentation.trackEvent('CompanyCandidateProfileSearch', {
                    'Command': 'StartSearch-Phrasal',
                    'SearchPhrase': vm.searchPhrase(),
                    'CountryCodeValue': vm.countryCodeValue(),
                    'EducationCodeValue': vm.educationCodeValue()
                });

                vm.messageDetail.message('');
                vm.isBusy(true);
                vm.isShowingGuide(false);

                vm.pagingTokens(['', '']);

                loadSearchPage();

            }

            function startSearchNext() {
                loadSearchPage('next');
            }

            function startSearchBack() {
                loadSearchPage('back');
            }

            function startAdvancedSearch() {

                instrumentation.trackEvent('CompanyCandidateProfileSearch', {
                    'Command': 'StartSearch-Advanced',
                    'SearchPhrase': vm.searchPhrase(),
                    'CountryCodeValue': vm.countryCodeValue(),
                    'EducationCodeValue': vm.educationCodeValue()
                });

                vm.messageDetail.message('');
                vm.isBusy(true);
                vm.isShowingGuide(false);

                var candidateProfileSearchParameter = new model.CandidateProfileSearchParameter();

                candidateProfileSearchParameter.countryCodeValue(vm.currentCountryCodeValue());
                candidateProfileSearchParameter.educationCodeValue(vm.advancedEducationCodeValue());
                candidateProfileSearchParameter.nationalityCodeValue(vm.nationalityCodeValue());
                candidateProfileSearchParameter.employmentTypeCodeValue(vm.employmentTypeCodeValue());
                candidateProfileSearchParameter.industryExperienceCodeValue(vm.industryExperienceCodeValue());
                candidateProfileSearchParameter.salarySoughtCurrencyCodeValue(vm.salarySought.currencyCodeValue);
                candidateProfileSearchParameter.salarySoughtAmount(vm.salarySought.amount);
                candidateProfileSearchParameter.summaryOfExperienceCategoryCodeValue(vm.summaryOfExperienceCategoryCodeValue());
                candidateProfileSearchParameter.experienceDisciplineFirstLevelCodeValue(vm.selectedExperienceDisciplineFirstLevelCodeValue());
                candidateProfileSearchParameter.experienceDisciplineSecondLevelCodeValue(vm.selectedExperienceDisciplineSecondLevelCodeValue());
                candidateProfileSearchParameter.currentAvailabilityCodeValue(vm.currentAvailabilityCodeValue());
                candidateProfileSearchParameter.willingToRelocateCodeValue(vm.willingToRelocateCodeValue());
                candidateProfileSearchParameter.authorizedToWorkCodeValue(vm.authorizedToWorkCodeValue());
                candidateProfileSearchParameter.willingToTravel(vm.willingToTravel());

                datacontext.candidateProfileAdvancedSearch.getData(candidateProfileSearchParameter).then(function () {
                    if (datacontext.candidateProfileAdvancedSearch.items().length > 0) {
                        vm.candidateProfiles(datacontext.candidateProfileAdvancedSearch.items());
                        vm.hasResult(true);
                    }
                    else {
                        vm.messageDetail.type('info');
                        vm.candidateProfiles([]);
                        vm.hasResult(false);
                        vm.messageDetail.message(vm.loc.stringCandidateProfileSearchHasNoResult());
                    }
                    vm.isBusy(false);
                });
            }

            function setSelectedView(view) {
                vm.parent().setSelectedView(view);
            }

            function activate() {
                
                vm.parent(require('viewmodels/homeCompany'));

                var clipboard = new Clipboard('.copy-candidate-email-address');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringCandidateEmailAddressCopiedToClipboard());
                });

                vm.userId(datacontext.user.item.user.id());

                if (!vm.dataIsBound()) {

                    vm.countries.codes.sort(function (left, right) {                        
                        return left.name() < right.name() ? -1 : 1;
                    });                   

                    vm.willingToRelocates.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.summaryOfExperienceCategories.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.countries.codes.push({                       
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),                       
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });
                   
                    vm.educations.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.industryExperiences.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.employmentTypes.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    //vm.summaryOfExperienceCategories.codes.push({
                    //    codeValue: ko.observable(''),
                    //    //name: ko.observable(vm.loc.stringAll()),
                    //    codeSetId: ko.observable(''),
                    //    sortOrder: ko.observable(-1)
                    //});

                    vm.summaryOfExperienceCategories.codes.push({
                        codeValue: ko.observable(''),
                        //name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });



                    vm.currencies.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.availabilities.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.willingToRelocates.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.dataIsBound(true);
                }
            }

        });
}());
