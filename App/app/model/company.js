(function () {
    'use strict';

    define([
            'model/item',
            'model/companyDiscipline',
            'model/companyRequirement',
            'model/companyRedundantProfile',
            'model/companySponsorshipPackage',
            'model/companyGraduateShareScheme',
            'model/companyGraduateRecruitment',
            'model/companyEquipmentContainer',
            'model/companyInnovativePortalContainer',
            'model/companyTechnologyPortalContainer'],
        function (Item, CompanyDiscipline, CompanyRequirement, CompanyRedundantProfile, CompanySponsorshipPackage, CompanyGraduateShareScheme, CompanyGraduateRecruitment, CompanyEquipmentContainer, CompanyInnovativePortalContainer, CompanyTechnologyPortalContainer) {

            var Company = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.userAccountId = ko.observable();
                self.organizationId = ko.observable();
                self.name = ko.observable();
                self.timeZoneId = ko.observable();
                self.logoImageId = ko.observable();
                self.companyUrl = ko.observable();
                self.facebookUrl = ko.observable();
                self.linkedinUrl = ko.observable();
                self.countryCode = ko.observable();
                self.cityName = ko.observable();
                self.addressOne = ko.observable();
                self.addressTwo = ko.observable();
                self.postCode = ko.observable();
                self.primaryContactNumber = ko.observable();
                self.secondaryContactNumber = ko.observable();
                self.isActive = ko.observable();
                self.description = ko.observable();
                self.isParticipatingInGraduateShareScheme = ko.observable();
                self.sponsorshipPackage = new CompanySponsorshipPackage();
                self.graduateShareScheme = new CompanyGraduateShareScheme();
                self.disciplines = ko.observableArray();
                self.requirements = ko.observableArray();
                self.graduateRecruitments = ko.observableArray();
                self.redundantProfiles = ko.observableArray();
                self.equipmentContainers = ko.observableArray();
                self.administratorsGroupId = ko.observable();
                self.executivesGroupId = ko.observable();
                self.employeesGroupId = ko.observable();
                self.administratorsGroupInvitationUrl = ko.observable();
                self.executivesGroupInvitationUrl = ko.observable();
                self.employeesGroupInvitationUrl = ko.observable();
                self.innovativePortalContainers = ko.observableArray();
                self.technologyPortalContainers = ko.observableArray();

                self.state.mapping = {
                    'disciplines': {
                        create: function (options) {
                            var discipline = new CompanyDiscipline();

                            ko.mapping.fromJS(options.data, discipline.mapping || {}, discipline);

                            return discipline;
                        }
                    },
                    'requirements': {
                        create: function (options) {
                            var requirement = new CompanyRequirement();

                            ko.mapping.fromJS(options.data, requirement.mapping || {}, requirement);

                            return requirement;
                        }
                    },
                    'redundantProfiles': {
                        create: function (options) {
                            var profile = new CompanyRedundantProfile();

                            ko.mapping.fromJS(options.data, profile.mapping || {}, profile);

                            return profile;
                        }
                    },
                    'graduateRecruitments': {
                        create: function (options) {
                            var graduateRecruitment = new CompanyGraduateRecruitment();

                            ko.mapping.fromJS(options.data, graduateRecruitment.mapping || {}, graduateRecruitment);

                            return graduateRecruitment;
                        }
                    },
                    'equipmentContainers': {
                        create: function (options) {
                            var companyEquipmentContainer = new CompanyEquipmentContainer();

                            ko.mapping.fromJS(options.data, companyEquipmentContainer.mapping || {}, companyEquipmentContainer);

                            return companyEquipmentContainer;
                        }
                    },
                    'innovativePortalContainers': {
                        create: function (options) {
                            var innovativeProfile = new CompanyInnovativePortalContainer();

                            ko.mapping.fromJS(options.data, innovativeProfile.mapping || {}, innovativeProfile);

                            return innovativeProfile;
                        }
                    },
                    'technologyPortalContainers': {
                        create: function (options) {
                            var technologyProfile = new CompanyTechnologyPortalContainer();

                            ko.mapping.fromJS(options.data, technologyProfile.mapping || {}, technologyProfile);

                            return technologyProfile;
                        }
                    },
                };

            };

            ko.utils.extend(Company.prototype, Item);

            return Company;
        });
})();
