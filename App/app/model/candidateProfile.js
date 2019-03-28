(function () {
    'use strict';

    define(['model/item', 'model/salarySought'],
        function (Item, SalarySought) {

            var CandidateProfile = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {
                };

                self.userAccountId = ko.observable();
                self.countryCode = ko.observable();
                self.cityName = ko.observable();
                self.addressOne = ko.observable();
                self.addressTwo = ko.observable();
                self.postCode = ko.observable();
                self.primaryContactNumber = ko.observable();
                self.secondaryContactNumber = ko.observable();
                self.currentCompanyName = ko.observable();
                self.currentJobTitle = ko.observable();
                self.availabilityCodeValue = ko.observable();
                self.nationalityCodeValue = ko.observable();
                self.willingToTravel = ko.observable();
                self.willingToRelocateCodeValue = ko.observable();
                self.authorisedToWorkCodeValues = ko.observableArray([]);
                self.industryExperienceCodeValue = ko.observable();
                self.employmentTypeCodeValues = ko.observableArray([]);
                self.salarySought = new SalarySought();
                self.educationCodeValue = ko.observable();
                self.summaryOfExperienceCategoryCodeValue = ko.observable();
                self.summaryOfExperience = ko.observable();
                self.experienceDisciplineFirstLevelCodeValue = ko.observable();
                self.experienceDisciplineSecondLevelCodeValue = ko.observable();
                self.experienceDisciplineThirdLevelCodeValue = ko.observable();
                self.categoryOfPersonnelCodeValue = ko.observable();
                self.cvFileId = ko.observable();
                self.lastCvUpdateDateTime = ko.observable();
                self.personalWebSiteUrl = ko.observable();
                self.facebookUrl = ko.observable();
                self.linkedinUrl = ko.observable();
                self.isPublic = ko.observable();
                self.summary = ko.observable();
                self.isActive = ko.observable();

                self.currentPosition = ko.pureComputed(function () {
                    return self.currentJobTitle() + '(' + self.currentCompanyName() + ')';
                });

                self.formattedLastCvUpdateDateTime = ko.pureComputed(function () {
                    if (self.lastCvUpdateDateTime()) {
                        return moment(self.lastCvUpdateDateTime()).format('MMMM Do YYYY HH:mm');
                    }
                    else {
                        return '';
                    }
                });

            };

            ko.utils.extend(CandidateProfile.prototype, Item);

            return CandidateProfile;
        });
})();
