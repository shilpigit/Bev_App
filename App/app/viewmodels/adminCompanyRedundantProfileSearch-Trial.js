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
        'services/core/instrumentation',
        'services/company',       
        'model/model',
        'services/candidateProfile',
        'viewmodels/behaviors/editor'
    ],
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization, instrumentation, candidateProfileSrv, model) {           
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Business CoOperation Search',
                config: config,
                loc: datacontext.translations.item,
                state: state,
                utilities: utilities,
                currentUser: datacontext.user.item.user,
                companies: datacontext.companies.items,
                companyRequirementSections: localization.getLocalizedCodeSet('companyRequirementSection'),
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
                categoryOfPersonnel: localization.getLocalizedCodeSet('categoryOfPersonnel'),
                parent: ko.observable(),
                userId: ko.observable(),
                searchPhrase: ko.observable(),
                candidateProfiles: ko.observableArray(),
                hasResult: ko.observable(),
                isShowingGuide: ko.observable(false),
                showSecondLevel: ko.observable(false),
                countryCodeValue: ko.observable(''),
                educationCodeValue: ko.observable(''),
                //nationalityCodeValue: ko.observable(''),
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



                summaryOfExperienceCategoryCodeValue: ko.observable(''),
                selectedExperienceDisciplineFirstLevelCodeValue: ko.observable(''),
                selectedExperienceDisciplineSecondLevelCodeValue: ko.observable(''),
                selectedcategoryOfPersonnelCodeValue: ko.observable(''),
                isShowingGuide: ko.observable(false),
                searchPhrase: ko.observable(),
                candidateProfiles: ko.observableArray(),
                hasResult: ko.observable(),
                userId: ko.observable(),
                pagingTokens: ko.observableArray(['', '']),
                candidateProfiles: ko.observableArray(),
                countryCode: ko.observable(),
                nationalityCodeValue: ko.observable(),
                industryExperienceCodeValue: ko.observable(),
                employmentTypeCodeValue: ko.observable(),
                educationCodeValue: ko.observable(),
                availabilityCodeValue: ko.observable(),
                filteredCompanies: ko.observableArray(),
                filteredRedundantProfile: ko.observableArray(),
                isBusy: ko.observable(false),
                searchPhrase: ko.observable(),
                dataIsBound: ko.observable(false),
                showSecondLevel: ko.observable(false),
                filterCompanies: filterCompanies,
                setSelectedView: setSelectedView,
                recordsCount: ko.observable(0),
                isPaging: ko.observable(false),
                dataIsBound: ko.observable(false),
                searchPhrase: ko.observable(),
                setSelectedView: setSelectedView,
                startSearch: startSearch,
                startSearchNext: startSearchNext,
                startSearchBack: startSearchBack,
                startAdvancedSearch: startAdvancedSearch,
                showGuide: showGuide,
                countryCodeValue: ko.observable(''),
                currentCountryCodeValue: ko.observable(''),
                educationCodeValue: ko.observable(''),
                advancedEducationCodeValue: ko.observable(''),
                currentAvailabilityCodeValue: ko.observable(''),
                
                resourceTypeCodeValue: getResourceValue // ko.observable('candidateProfile'),
                
                //resourceTypeCodeValue: datacontext.CandidateProfileSearchParameter.resourceType || datacontext.CompanyCandidateProfileSearchParameter.resourceType
            };

           

            //vm.searchPhrase.subscribe(filterCompanies, this);
            vm.selectedcategoryOfPersonnelCodeValue.subscribe(filterCompanies, this);

            vm.experienceDisciplineSecondLevelCodeValue = ko.pureComputed({
                read: function () {
                    var nDSummaryOfExperienceCategory = localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory');

                    nDSummaryOfExperienceCategory.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    return nDSummaryOfExperienceCategory;
                }
            });

            vm.experienceDisciplineThirdLevelCodeValue = ko.pureComputed({
                read: function () {

                    if (!vm.selectedExperienceDisciplineFirstLevelCodeValue()) {
                        vm.showSecondLevel(false);
                        return ko.observableArray();
                    }
                    var data = candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedExperienceDisciplineFirstLevelCodeValue());

                    data.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.showSecondLevel(true);
                    return data;
                }
            });

            vm.categoryOfPersonnelCodeValue = ko.pureComputed({
                read: function () {
                    var categoryOfPersonnel = localization.getLocalizedCodeSet('categoryOfPersonnel');

                    categoryOfPersonnel.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    return categoryOfPersonnel;
                }
            });

            vm.pagesCount = ko.pureComputed({
                read: function () {
                    return Math.ceil(vm.recordsCount() / 10);
                }
            });

            function getResourceValue() {
                //if (datacontext.candidateProfiles.items.length != 0)
                if (vm.companies.length != 0)
                    return 'candidateProfile';
                else
                    return 'company';
              }  

            vm.currentPageIndex = ko.pureComputed({
                read: function () {
                    return vm.pagingTokens().length - 2;
                }
            });   

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.getFullNameAndEmail = function (item) {

                return item.firstName() + ' ' + item.lastName() + ' (' + item.emailAddress() + ') ';

            };
            vm.getEducationName = function (item) {

                var matches = ko.utils.arrayFilter(vm.educations.codes, function (el) {
                    return el.codeValue() === item.candidateProfile.educationCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }

            };
            vm.getIndustryExperienceName = function (item) {

                var matches = ko.utils.arrayFilter(vm.industryExperiences.codes, function (el) {
                    return el.codeValue() === item.industryExperienceCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }

            };
            vm.getCurrentAvailabilityName = function (item) {

                var matches = ko.utils.arrayFilter(vm.availabilities.codes, function (el) {
                    return el.codeValue() === item.availabilityCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }

            };
            vm.getNationalityName = function (item) {                
                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.candidateProfile.nationalityCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }

            };
            vm.getEmploymentTypeName = function (item) {

                var countries = '';
                for (var i = 0; i < item.employmentTypeCodeValues().length; i++) {

                    for (var j = 0; j < vm.employmentTypes.codes.length; j++) {
                        if (vm.employmentTypes.codes[j].codeValue() === item.employmentTypeCodeValues()[i]) {

                            countries += vm.employmentTypes.codes[j].name();

                            if (i < item.employmentTypeCodeValues().length - 1) {
                                countries += ', ';
                            }
                        }
                    }
                }

                if (countries.length > 0) {
                    return countries;
                } else {
                    return vm.loc.stringUnknown();
                }
            };
            vm.getLocationName = function (item) {                
                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {
                    return item.cityName() ? matches[0].name() + '/' + item.cityName() : matches[0].name();
                }
            };
            


            vm.getSummaryOfExperience = function (item) {

                var experienceCategory = '';

                var matches = ko.utils.arrayFilter(vm.summaryOfExperienceCategories.codes, function (el) {
                    return el.codeValue() === item.summaryOfExperienceCategoryCodeValue();
                });

                if (matches.length > 0) {

                    experienceCategory = matches[0].name();

                    if (item.summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {

                        var dSecondLevelMatches = ko.utils.arrayFilter(vm.dSummaryOfExperienceCategories.codes, function (el) {
                            return el.codeValue() === item.experienceDisciplineFirstLevelCodeValue();
                        });

                        if (dSecondLevelMatches.length > 0) {
                            experienceCategory += ', ' + dSecondLevelMatches[0].name();
                        }

                    } else {

                        var nDSecondLevelMatches = ko.utils.arrayFilter(vm.nDSummaryOfExperienceCategories.codes, function (el) {
                            return el.codeValue() === item.experienceDisciplineFirstLevelCodeValue();
                        });

                        if (nDSecondLevelMatches.length > 0) {
                            experienceCategory += ', ' + nDSecondLevelMatches[0].name();

                            var experienceDisciplineSecondLevelCategories =
                                candidateProfileSrv.getSecondLevelExperienceDisciplines(item.experienceDisciplineFirstLevelCodeValue());

                            var thirdLevelMatches = ko.utils.arrayFilter(experienceDisciplineSecondLevelCategories.codes, function (el) {
                                return el.codeValue() === item.experienceDisciplineSecondLevelCodeValue();
                            });

                            if (thirdLevelMatches.length > 0) {
                                experienceCategory += ', ' + thirdLevelMatches[0].name();

                            }

                        }
                    }

                    if (experienceCategory.length > 0) {
                        return experienceCategory;
                    } else {
                        return vm.loc.stringUnknown();
                    }

                } else {
                    return vm.loc.stringUnknown();
                }
            };

            vm.getCompanyRequirementSectionName = function (item) {

                var matches = ko.utils.arrayFilter(vm.companyRequirementSections.codes, function (el) {
                    return el.codeValue() === item.sectionCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }
            };
            vm.getLinkMailToCompanyOwner = function (emailAddress) {

                return 'mailto:' + emailAddress;
            };
            vm.getGoogleMapLink = function (item) {

                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {

                    return 'https://www.google.com.my/maps/place/' + (item.cityName() ? matches[0].name() + ' ' + item.cityName() : matches[0].name()) + ' ' + item.addressOne();
                }
            };
            vm.getCompanyProfileUrl = function (item) {
                return '#/viewcompanyprofile/' + item.id();
            };

            vm.includeSearchPhrase = function (profile) {
                if (
                    (vm.countryCode() === '' || profile.countryCode() && profile.countryCode() === vm.countryCode()) &&
                    (vm.nationalityCodeValue() === '' || profile.nationalityCodeValue() && profile.nationalityCodeValue() === vm.nationalityCodeValue()) &&
                    (vm.industryExperienceCodeValue() === '' || profile.industryExperienceCodeValue() && profile.industryExperienceCodeValue() === vm.industryExperienceCodeValue()) &&
                    //(vm.employmentTypeCodeValue() === '' || profile.employmentTypeCodeValues() && profile.employmentTypeCodeValues.indexOf(vm.employmentTypeCodeValue()) > -1) &&
                    (vm.educationCodeValue() === '' || profile.educationCodeValue() && profile.educationCodeValue() === vm.educationCodeValue()) &&
                    (!vm.selectedExperienceDisciplineFirstLevelCodeValue() || vm.selectedExperienceDisciplineFirstLevelCodeValue() === '' || profile.experienceDisciplineFirstLevelCodeValue() && profile.experienceDisciplineFirstLevelCodeValue() === vm.selectedExperienceDisciplineFirstLevelCodeValue()) &&
                    (!vm.selectedExperienceDisciplineSecondLevelCodeValue() || vm.selectedExperienceDisciplineSecondLevelCodeValue() === '' || profile.experienceDisciplineSecondLevelCodeValue() && profile.experienceDisciplineSecondLevelCodeValue() === vm.selectedExperienceDisciplineSecondLevelCodeValue()) &&
                    (!vm.selectedcategoryOfPersonnelCodeValue() || vm.selectedcategoryOfPersonnelCodeValue() === '' || profile.categoryOfPersonnelCodeValue() === vm.selectedcategoryOfPersonnelCodeValue())
                ) {
                    return true;
                }
            };
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

            vm.countryCode.subscribe(filterCompanies, this);
            vm.nationalityCodeValue.subscribe(filterCompanies, this);
            vm.industryExperienceCodeValue.subscribe(filterCompanies, this);
            vm.employmentTypeCodeValue.subscribe(filterCompanies, this);
            vm.educationCodeValue.subscribe(filterCompanies, this);
            vm.availabilityCodeValue.subscribe(filterCompanies, this);
            vm.selectedcategoryOfPersonnelCodeValue.subscribe(filterCompanies, this);
            vm.currentCountryCodeValue.subscribe(filterCompanies, this);
            vm.summaryOfExperienceCategoryCodeValue.subscribe(filterCompanies, this);
            vm.selectedExperienceDisciplineSecondLevelCodeValue.subscribe(filterCompanies, this);
            vm.currentAvailabilityCodeValue.subscribe(filterCompanies, this);
            return vm;

            function showGuide() {
                vm.isShowingGuide(!vm.isShowingGuide());
            }

            function loadSearchPage(direction) {
                var companyCandidateProfileSearchParameter = new model.CompanyCandidateProfileSearchParameter();

                
                if (!direction) {
                    companyCandidateProfileSearchParameter.token('');
                }
                else if (direction === 'next') {
                    if (vm.pagingTokens()[vm.pagingTokens().length - 1] !== '') {
                        companyCandidateProfileSearchParameter.token(vm.pagingTokens()[vm.pagingTokens().length - 1]);
                    }
                    vm.isPaging(true);
                }
                else if (direction === 'back') {

                    if (vm.pagingTokens().length - 2 >= 2) {

                        companyCandidateProfileSearchParameter.token(vm.pagingTokens()[vm.pagingTokens().length - 3]);
                        vm.pagingTokens.splice(vm.pagingTokens().length - 2, 2);
                    }
                    vm.isPaging(true);
                }                
                companyCandidateProfileSearchParameter.searchPhrase(vm.searchPhrase() ? vm.searchPhrase() : '*');
                companyCandidateProfileSearchParameter.countryCodeValue(vm.countryCode());
                companyCandidateProfileSearchParameter.nationalityCodeValue(vm.nationalityCodeValue());
                companyCandidateProfileSearchParameter.industryExperienceCodeValue(vm.industryExperienceCodeValue());
                companyCandidateProfileSearchParameter.educationCodeValue(vm.educationCodeValue());
                companyCandidateProfileSearchParameter.summaryOfExperienceCategoryCodeValue(vm.summaryOfExperienceCategoryCodeValue());
                companyCandidateProfileSearchParameter.experienceDisciplineFirstLevelCodeValue(vm.selectedExperienceDisciplineFirstLevelCodeValue());

                if (vm.showSecondLevel()) {
                    companyCandidateProfileSearchParameter.experienceDisciplineSecondLevelCodeValue(vm.selectedExperienceDisciplineSecondLevelCodeValue());
                } else {
                    companyCandidateProfileSearchParameter.experienceDisciplineSecondLevelCodeValue('');
                }
               
                companyCandidateProfileSearchParameter.categoryOfPersonnelCodeValue(vm.selectedcategoryOfPersonnelCodeValue());
                

                datacontext.companyCandidateProfileSearch.getItem(companyCandidateProfileSearchParameter).then(function ()
                {                    
                    if (datacontext.companyCandidateProfileSearch.item && datacontext.companyCandidateProfileSearch.item.companyContainers().length > 0) {

                        vm.pagingTokens.push(datacontext.companyCandidateProfileSearch.item.continuationToken());
                        if (!direction) {
                            vm.recordsCount(datacontext.companyCandidateProfileSearch.item.recordsCount());

                        }

                        if (vm.recordsCount() > 0) {
                            vm.hasResult(true);
                        }
                    } else {
                        vm.messageDetail.type('info');
                        vm.companies([]);
                        vm.hasResult(false);
                        vm.messageDetail.message(vm.loc.stringCompanyRequirementSearchHasNoResult);
                        vm.isShowingGuide(true);
                    }
                    vm.isBusy(false);
                    vm.isPaging(false);
                });
            }

           

            function startSearch() {
                filterCompanies();
                //instrumentation.trackEvent('CompanyCandidateProfileSearch', {
                //    'Command': 'StartSearch-Phrasal',
                //    'SearchPhrase': vm.searchPhrase(),
                //    'CountryCodeValue': vm.countryCodeValue(),
                //    'EducationCodeValue': vm.educationCodeValue()
                //});

                //vm.messageDetail.message('');
                //vm.isBusy(true);
                //vm.isShowingGuide(false);

                //vm.pagingTokens(['', '']);

                //loadSearchPage();

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
                candidateProfileSearchParameter.categoryOfPersonnelCodeValue(vm.selectedcategoryOfPersonnelCodeValue());

                datacontext.candidateProfileAdvancedSearch.getData(candidateProfileSearchParameter).then(function () {
                    if (datacontext.candidateProfileAdvancedSearch.items().length > 0) {
                        vm.candidateProfiles(datacontext.candidateProfileAdvancedSearch.items());
                        vm.hasResult(true);
                    }
                    else {
                        vm.messageDetail.type('info');
                        vm.candidateProfiles([]);
                        vm.hasResult(false);
                        vm.messageDetail.message(vm.loc.stringCompanyRequirementSearchHasNoResult());
                    }
                    vm.isBusy(false);
                });
            }

            function setSelectedView(view) {
                vm.parent().setSelectedView(view);
            }

            function canActivate() {

                return true;
            }

            function activate() {

                var clipboard = new Clipboard('.copy');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringEmailAddressCopiedToClipboard());
                });

                if (!vm.dataIsBound()) {

                    vm.countries.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.availabilities.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    vm.summaryOfExperienceCategories.codes.sort(function (left, right) {
                        return left.name() < right.name() ? -1 : 1;
                    });

                    // add 'All' option
                    vm.countries.codes.push({
                        codeValue: ko.observable(''),
                        //name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.educations.codes.push({
                        codeValue: ko.observable(''),
                        //name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.industryExperiences.codes.push({
                        codeValue: ko.observable(''),
                        //name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.employmentTypes.codes.push({
                        codeValue: ko.observable(''),
                        //name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    vm.summaryOfExperienceCategories.codes.push({
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
                    vm.categoryOfPersonnel.codes.push({
                        codeValue: ko.observable(''),
                       // name: ko.observable(vm.loc.stringAll()),
                        codeSetId: ko.observable(''),
                        sortOrder: ko.observable(-1)
                    });

                    // stop adding 'All' option
                    vm.dataIsBound(true);
                }
                filterCompanies();                
                return true;
            }



            function filterCompanies() {
                
                vm.filteredCompanies([]);
                vm.filteredRedundantProfile([]);
                
                for (var c = 0; c < vm.companies().length; c++) {

                    var company = vm.companies()[c].company;

                    if (company.redundantProfiles) { //&& company.isActive()   (redundantProfiles.firstName())
                        
                        for (var d = 0; d < company.redundantProfiles().length; d++) {                            
                            var redundantProfiles = company.redundantProfiles()[d];                            

                            if ((vm.nationalityCodeValue() === '' || redundantProfiles.nationalityCodeValue() && redundantProfiles.nationalityCodeValue() === vm.nationalityCodeValue()) ||
                                (vm.countryCode() === '' || redundantProfiles.countryCode() && redundantProfiles.countryCode() === vm.countryCode()) ||
                                (vm.industryExperienceCodeValue() === '' || redundantProfiles.industryExperienceCodeValue() && redundantProfiles.industryExperienceCodeValue() === vm.industryExperienceCodeValue())||
                                (vm.educationCodeValue() === '' || redundantProfiles.educationCodeValue() && redundantProfiles.educationCodeValue() === vm.educationCodeValue())&&
                            //    (redundantProfiles.experienceDisciplineFirstLevelCodeValue() && redundantProfiles.experienceDisciplineFirstLevelCodeValue() === vm.selectedExperienceDisciplineFirstLevelCodeValue())||
                            //    (!vm.selectedExperienceDisciplineFirstLevelCodeValue() || vm.selectedExperienceDisciplineFirstLevelCodeValue() === '' || redundantProfiles.experienceDisciplineFirstLevelCodeValue() && redundantProfiles.experienceDisciplineFirstLevelCodeValue() === vm.selectedExperienceDisciplineFirstLevelCodeValue())||
                            //    (!vm.selectedExperienceDisciplineSecondLevelCodeValue() || vm.selectedExperienceDisciplineSecondLevelCodeValue() === '' || redundantProfiles.experienceDisciplineSecondLevelCodeValue() && redundantProfiles.experienceDisciplineSecondLevelCodeValue() === vm.selectedExperienceDisciplineSecondLevelCodeValue()) ||
                                
                            (!vm.selectedcategoryOfPersonnelCodeValue() || vm.selectedcategoryOfPersonnelCodeValue() === '' || redundantProfiles.categoryOfPersonnelCodeValue() === vm.selectedcategoryOfPersonnelCodeValue())

                            )
                            {

                                vm.filteredCompanies.push(vm.companies()[c]);                                
                                //break;
                                vm.filteredRedundantProfile.push(company.redundantProfiles()[d]);                               
                            }
                        }
                    }
                }

                if (vm.filteredRedundantProfile().length === 0) {
                    vm.messageDetail.type('info');
                    vm.messageDetail.message(vm.loc.stringRigAndVesselSearchHasNoResult());
                } else {
                    vm.messageDetail.message('');
                }
            }

            
            //function filterCompanies() {            
            //    vm.filteredCompanies([]);

            //    for (var c = 0; c < vm.companies().length; c++) {

            //        var company = vm.companies()[c].company;

            //        if (company.redundantProfiles) {

            //            for (var d = 0; d < company.redundantProfiles().length; d++) {

            //                var profile = company.redundantProfiles()[d];

            //                //if (
            //                //    (vm.countryCode() === '' || profile.countryCode() && profile.countryCode() === vm.countryCode()) &&
            //                //    (vm.nationalityCodeValue() === '' || profile.nationalityCodeValue() && profile.nationalityCodeValue() === vm.nationalityCodeValue()) &&
            //                //    (vm.industryExperienceCodeValue() === '' || profile.industryExperienceCodeValue() && profile.industryExperienceCodeValue() === vm.industryExperienceCodeValue()) &&
            //                //    (vm.educationCodeValue() === '' || profile.educationCodeValue() && profile.educationCodeValue() === vm.educationCodeValue()) &&
            //                //    (!vm.selectedExperienceDisciplineFirstLevelCodeValue() || vm.selectedExperienceDisciplineFirstLevelCodeValue() === '' || profile.experienceDisciplineFirstLevelCodeValue() && profile.experienceDisciplineFirstLevelCodeValue() === vm.selectedExperienceDisciplineFirstLevelCodeValue()) &&
            //                //    (!vm.selectedExperienceDisciplineSecondLevelCodeValue() || vm.selectedExperienceDisciplineSecondLevelCodeValue() === '' || profile.experienceDisciplineSecondLevelCodeValue() && profile.experienceDisciplineSecondLevelCodeValue() === vm.selectedExperienceDisciplineSecondLevelCodeValue()) &&
            //                //    (!vm.selectedcategoryOfPersonnelCodeValue() || vm.selectedcategoryOfPersonnelCodeValue() === '' || profile.categoryOfPersonnelCodeValue() === vm.selectedcategoryOfPersonnelCodeValue())

            //                //)
            //            if(profile.nationalityCodeValue())
            //                {

            //                    vm.filteredCompanies.push(vm.companies()[c]);
            //                    break;

            //                }
            //            }
            //        }
            //    }

            //    if (vm.filteredCompanies().length === 0) {
            //        vm.messageDetail.type('info');
            //        vm.messageDetail.message(vm.loc.stringCompanyRequirementSearchHasNoResult());
            //    } else {
            //        vm.messageDetail.message('');
            //    }
            //}
        });
}());
