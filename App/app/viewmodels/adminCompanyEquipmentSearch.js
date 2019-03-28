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
            'services/core/localization'
        ],
        function (app, router, logger, config, security, state, dataservice, datacontext, utilities, Clipboard, localization) {
            var vm = {
                activate: activate,
                canActivate: canActivate,
                title: 'Redundancy Portal Search',
                config: config,
                loc: datacontext.translations.item,
                state: state,
                utilities: utilities,
                currentUser: datacontext.user.item.user,
                companies: datacontext.companies.items,
                countries: localization.getLocalizedCodeSet('country'),
                rigAndVesselTypes: localization.getLocalizedCodeSet('rigAndVesselType'),
                regions: localization.getLocalizedCodeSet('region'),

                yearQuartersCodeValue: ko.observable(),

                yearCodeValue: ko.observable(),

                yearQuarters: localization.getLocalizedCodeSet('yearQuarters'),

                year: localization.getLocalizedCodeSet('year'),

                filteredCompanies: ko.observableArray(),
                isBusy: ko.observable(false),
                searchPhrase: ko.observable(''),
                regionCodeValue: ko.observable(),
               
                typeCodeValue: ko.observable(),
                startSearch: startSearch,
                filterCompanies: filterCompanies
            };

            vm.searchPhrase.subscribe(filterCompanies, this);
            vm.yearCodeValue.subscribe(filterCompanies, this);

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.summarizeDescription = function (item) {

                if (item.description()) {
                    return utilities.trimByWord(item.description(), 20);
                }
                else {
                    return 'Who Knows!';
                }

            };
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
            vm.getLocationName = function (item) {
                
                var matches = ko.utils.arrayFilter(vm.countries.codes, function (el) {
                    return el.codeValue() === item.countryCode();
                });

                if (matches.length > 0) {
                    return item.cityName() ? matches[0].name() + '/' + item.cityName() : matches[0].name();
                }
            };
            vm.getRegionName = function (item) {                
                var matches = ko.utils.arrayFilter(vm.regions.codes, function (el) {
                    return el.codeValue() === item.equipment.regionCodeValue();
                });

                if (matches.length > 0) {
                    return matches[0].name();
                }
            };
            //vm.yearQuarters = function (item) {
            //    var matches = ko.utils.arrayFilter(vm.yearQuarters.codes, function (el) {
            //        return el.codeValue() == item.equipment.yearQuartersCodeValue();
            //    });
            //};


            vm.getTypeName = function (item) {

                var matches = ko.utils.arrayFilter(vm.rigAndVesselTypes.codes, function (el) {
                    return el.codeValue() === item.equipment.typeCodeValue();
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
            vm.includeSearchPhrase = function (item) {
                return (
                    ((item.equipment.features() && item.equipment.features().length > 0 && item.equipment.features().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1) ||
                    (item.equipment.name() && item.equipment.name().length > 0 && item.equipment.name().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1)) &&
                    (!vm.regionCodeValue() || item.equipment.regionCodeValue() === vm.regionCodeValue()) &&
                    (!vm.typeCodeValue() || item.equipment.typeCodeValue() === vm.typeCodeValue())
                );
            };
            vm.getFileUrl = function (item) {

                if (!item.equipment.catalogueFileId()) {
                    return '';
                }

                return config.root + 'api/storage/redirect?id=' + item.equipment.catalogueFileId();

            };

            return vm;

            function canActivate() {

                return true;
            }

            function activate() {

                var clipboard = new Clipboard('.copy');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringEmailAddressCopiedToClipboard());
                });

                filterCompanies();

                return true;
            }

            function filterCompanies() {

                vm.filteredCompanies([]);

                for (var c = 0; c < vm.companies().length; c++) {

                    var company = vm.companies()[c].company;

                    if (company.equipmentContainers && company.isActive()) {
                        
                        for (var d = 0; d < company.equipmentContainers().length; d++) {

                            var equipmentContainers = company.equipmentContainers()[d];

                            if ((equipmentContainers.equipment.features() && equipmentContainers.equipment.features().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1 ||
                                equipmentContainers.equipment.name() && equipmentContainers.equipment.name().toLowerCase().indexOf(vm.searchPhrase().toLowerCase()) > -1) &&
                                (!vm.regionCodeValue() || (equipmentContainers.equipment.regionCodeValue() && equipmentContainers.equipment.regionCodeValue() === vm.regionCodeValue())) &&
                                (!vm.typeCodeValue() || (equipmentContainers.equipment.typeCodeValue() && equipmentContainers.equipment.typeCodeValue() === vm.typeCodeValue()))
                            ) {                                
                                vm.filteredCompanies.push(vm.companies()[c]);
                                break;

                            }
                        }
                    }
                }

                if (vm.filteredCompanies().length === 0) {
                    vm.messageDetail.type('info');
                    vm.messageDetail.message(vm.loc.stringRigAndVesselSearchHasNoResult());
                } else {
                    vm.messageDetail.message('');
                }
            }

            function startSearch() {                
                filterCompanies();
                utilities.scrollToElement($('#searchResult'));
            }
        });
}());
