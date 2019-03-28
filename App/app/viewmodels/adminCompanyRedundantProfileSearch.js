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
        'services/utilities',
        'viewmodels/behaviors/editor',
        'services/company'
    ],
        function (app, router, logger, config, dataservice, datacontext, security, localization, state, model, Clipboard, instrumentation, candidateProfileSrv, utilities) {           
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

                categoryOfPersonnel: localization.getLocalizedCodeSet('categoryOfPersonnel'),
                parent: ko.observable(),
                userId: ko.observable(),
                searchPhrase: ko.observable(),
                candidateProfiles: ko.observableArray(),
                hasResult: ko.observable(),
                isShowingGuide: ko.observable(false),               
                countryCodeValue: ko.observable(''),
                educationCodeValue: ko.observable(''),               
                employmentTypeCodeValue: ko.observable(''),
                industryExperienceCodeValue: ko.observable(''),
                salarySought: ko.observable(new model.SalarySought()),
                
                              
                advancedEducationCodeValue: ko.observable(''),
                orderByCodeValue: ko.observable(''),
                currentCountryCodeValue: ko.observable(''),
                currentAvailabilityCodeValue: ko.observable(''),
                willingToRelocateCodeValue: ko.observable(''),
                authorizedToWorkCodeValue: ko.observable(''),
                willingToTravel: ko.observable(''),
                categoryOfPersonnelCodeValue: ko.observable(''),
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
                showGuide: showGuide,
                countryCodeValue: ko.observable(''),
                currentCountryCodeValue: ko.observable(''),
                educationCodeValue: ko.observable(''),
                advancedEducationCodeValue: ko.observable(''),
                currentAvailabilityCodeValue: ko.observable(''),

                summaryOfExperienceCategories: localization.getLocalizedCodeSet('summaryOfExperienceCategory'),
                dSummaryOfExperienceCategories: localization.getLocalizedCodeSet('dSummaryOfExperienceCategory'),
                nDSummaryOfExperienceCategories: localization.getLocalizedCodeSet('nDSummaryOfExperienceCategory'),
                showSecondLevel: ko.observable(false),

                summaryOfExperienceCategoryCodeValue: ko.observable(''),
                selectedExperienceDisciplineFirstLevelCodeValue: ko.observable(''),
                selectedExperienceDisciplineSecondLevelCodeValue: ko.observable(''), 
                
                resourceTypeCodeValue: getResourceValue
            };

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.searchPhrase.subscribe(filterCompanies, this);
            vm.categoryOfPersonnelCodeValue.subscribe(filterCompanies, this);

            vm.countryCode.subscribe(filterCompanies, this);
            vm.nationalityCodeValue.subscribe(filterCompanies, this);
            vm.industryExperienceCodeValue.subscribe(filterCompanies, this);
            vm.employmentTypeCodeValue.subscribe(filterCompanies, this);
            vm.educationCodeValue.subscribe(filterCompanies, this);
            vm.availabilityCodeValue.subscribe(filterCompanies, this);
            vm.currentCountryCodeValue.subscribe(filterCompanies, this);
            vm.summaryOfExperienceCategoryCodeValue.subscribe(filterCompanies, this);
            vm.selectedExperienceDisciplineSecondLevelCodeValue.subscribe(filterCompanies, this);

            vm.currentAvailabilityCodeValue.subscribe(filterCompanies, this);
           
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
                debugger
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
                    (!vm.categoryOfPersonnelCodeValue() || vm.categoryOfPersonnelCodeValue() === '' || profile.categoryOfPersonnelCodeValue() === vm.categoryOfPersonnelCodeValue())
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

            return vm;

            function showGuide() {
                vm.isShowingGuide(!vm.isShowingGuide());
            }

            function startSearch() {
                //filterCompanies();
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
                    if (company.redundantProfiles) { //&& company.isActive()                         
                        for (var d = 0; d < company.redundantProfiles().length; d++) {
                            var redundantProfiles = company.redundantProfiles()[d];

                            if ((vm.countryCode() === '' || redundantProfiles.countryCode() && redundantProfiles.countryCode() === vm.countryCode()) ||
                                (vm.nationalityCodeValue() === '' || redundantProfiles.nationalityCodeValue() && redundantProfiles.nationalityCodeValue() === vm.nationalityCodeValue()) ||
                                (vm.industryExperienceCodeValue() === '' || redundantProfiles.industryExperienceCodeValue() && redundantProfiles.industryExperienceCodeValue() === vm.industryExperienceCodeValue()) ||
                                (vm.educationCodeValue() === '' || redundantProfiles.educationCodeValue() && redundantProfiles.educationCodeValue() === vm.educationCodeValue())||
                                (vm.selectedExperienceDisciplineFirstLevelCodeValue() === '' || redundantProfiles.experienceDisciplineFirstLevelCodeValue() && redundantProfiles.experienceDisciplineFirstLevelCodeValue() === vm.selectedExperienceDisciplineFirstLevelCodeValue())||
                                (vm.selectedExperienceDisciplineSecondLevelCodeValue() === '' || redundantProfiles.experienceDisciplineSecondLevelCodeValue() && redundantProfiles.experienceDisciplineSecondLevelCodeValue() === vm.selectedExperienceDisciplineSecondLevelCodeValue())||
                                (vm.categoryOfPersonnelCodeValue() === '' || redundantProfiles.categoryOfPersonnelCodeValue() && redundantProfiles.categoryOfPersonnelCodeValue() === vm.categoryOfPersonnelCodeValue())
                            )
                            {

                                vm.filteredCompanies.push(vm.companies()[c]);                               
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
        });
}());
