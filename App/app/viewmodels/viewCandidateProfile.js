(function () {
    'use strict';

    define(['services/core/authentication',
            'services/core/config',
            'plugins/router',
            'services/core/logger',
            'services/data/dataprimer',
            'services/core/state',
            'services/data/datacontext',
            'services/core/localization',
            'services/candidateProfile',
            'services/core/instrumentation',
            'services/utilities'
        ],
        function (authentication, config, router, logger, dataprimer, state, datacontext, localization, candidateProfileSrv, instrumentationSrv) {

            var vm = {
                title: 'View Candidate Profile',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                selectedItem: datacontext.candidateProfile.item,
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
                isBusy: ko.observable(false)
            };

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.getCurrentLocation = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.countryCode();
                    });

                    if (matches.length > 0) {
                        return vm.selectedItem.candidateProfile.cityName() ? matches[0].name() + '/' + vm.selectedItem.candidateProfile.cityName() : matches[0].name();
                    } else {
                        return vm.loc.stringUnknown();
                    }

                }
            });

            vm.getAvailability = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.availabilities.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.availabilityCodeValue();
                    });

                    if (matches.length > 0) {
                        return matches[0].name();
                    } else {
                        return vm.loc.stringUnknown();
                    }

                }
            });

            vm.getNationality = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.nationalityCodeValue();
                    });

                    if (matches.length > 0) {
                        return matches[0].name();
                    } else {
                        return vm.loc.stringUnknown();
                    }

                }
            });

            vm.profileIsPublic = ko.pureComputed({
                read: function () {
                    return vm.selectedItem.candidateProfile.isPublic();
                }
            });

            vm.getWillingToRelocate = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.willingToRelocates.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.willingToRelocateCodeValue();
                    });

                    if (matches.length > 0) {
                        return matches[0].name();
                    } else {
                        return vm.loc.stringUnknown();
                    }
                }
            });

            vm.getAuthorisedToWorkCodeValues = ko.pureComputed({
                read: function () {

                    var countries = '';

                    for (var i = 0; i < vm.selectedItem.candidateProfile.authorisedToWorkCodeValues().length; i++) {

                        for (var j = 0; j < vm.countries.codes.length; j++) {
                            if (vm.countries.codes[j].codeValue() === vm.selectedItem.candidateProfile.authorisedToWorkCodeValues()[i]) {

                                countries += vm.countries.codes[j].name();

                                if (i < vm.selectedItem.candidateProfile.authorisedToWorkCodeValues().length - 1) {
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
                }
            });

            vm.getIndustryExperiences = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.industryExperiences.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.industryExperienceCodeValue();
                    });

                    if (matches.length > 0) {
                        return matches[0].name();
                    } else {
                        return vm.loc.stringUnknown();
                    }
                }
            });

            vm.getEmploymentTypes = ko.pureComputed({
                read: function () {

                    var countries = '';

                    for (var i = 0; i < vm.selectedItem.candidateProfile.employmentTypeCodeValues().length; i++) {

                        for (var j = 0; j < vm.employmentTypes.codes.length; j++) {
                            if (vm.employmentTypes.codes[j].codeValue() === vm.selectedItem.candidateProfile.employmentTypeCodeValues()[i]) {

                                countries += vm.employmentTypes.codes[j].name();

                                if (i < vm.selectedItem.candidateProfile.employmentTypeCodeValues().length - 1) {
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
                }
            });

            vm.getSalarySought = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.currencies.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.salarySought.currencyCodeValue();
                    });

                    if (matches.length > 0) {
                        return vm.selectedItem.candidateProfile.salarySought.amount() ? matches[0].name() + ' ' + vm.selectedItem.candidateProfile.salarySought.amount() : vm.loc.stringUnknown();
                    } else {
                        return vm.loc.stringUnknown();
                    }
                }
            });

            vm.getEducation = ko.pureComputed({
                read: function () {

                    var matches = ko.utils.arrayFilter(vm.educations.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.educationCodeValue();
                    });

                    if (matches.length > 0) {
                        return matches[0].name();
                    } else {
                        return vm.loc.stringUnknown();
                    }
                }
            });

            vm.getSummaryOfExperienceCategory = ko.pureComputed({
                read: function () {

                    var experienceCategory = '';

                    var matches = ko.utils.arrayFilter(vm.summaryOfExperienceCategories.codes, function (el) {
                        return el.codeValue() === vm.selectedItem.candidateProfile.summaryOfExperienceCategoryCodeValue();
                    });

                    if (matches.length > 0) {

                        experienceCategory = matches[0].name();

                        if (vm.selectedItem.candidateProfile.summaryOfExperienceCategoryCodeValue() === 'dOutWithOilIndustry') {

                            var dSecondLevelMatches = ko.utils.arrayFilter(vm.dSummaryOfExperienceCategories.codes, function (el) {
                                return el.codeValue() === vm.selectedItem.candidateProfile.experienceDisciplineFirstLevelCodeValue();
                            });

                            if (dSecondLevelMatches.length > 0) {
                                experienceCategory += ', ' + dSecondLevelMatches[0].name();
                            }

                        } else {

                            var nDSecondLevelMatches = ko.utils.arrayFilter(vm.nDSummaryOfExperienceCategories.codes, function (el) {
                                return el.codeValue() === vm.selectedItem.candidateProfile.experienceDisciplineFirstLevelCodeValue();
                            });

                            if (nDSecondLevelMatches.length > 0) {
                                experienceCategory += ', ' + nDSecondLevelMatches[0].name();

                                var experienceDisciplineSecondLevelCategories =
                                    candidateProfileSrv.getSecondLevelExperienceDisciplines(vm.selectedItem.candidateProfile.experienceDisciplineFirstLevelCodeValue());

                                var thirdLevelMatches = ko.utils.arrayFilter(experienceDisciplineSecondLevelCategories.codes, function (el) {
                                    return el.codeValue() === vm.selectedItem.candidateProfile.experienceDisciplineSecondLevelCodeValue();
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
                }
            });

            return vm;

            function activate(code) {

                instrumentationSrv.trackEvent('ViewCandidateProfile',
                    {
                        'On': 'Loaded',
                        'Code': code
                    });

                state.systemIsBusy(true);

                datacontext.candidateProfile.getItem(code).then(function () {
                    state.systemIsBusy(false);
                });

            }

        });
}());
