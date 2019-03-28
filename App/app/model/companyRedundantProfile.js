(function () {
    'use strict';

    define(['model/candidateProfile','model/item'],
        function (CandidateProfile,Item) {

            var CompanyRedundantProfile = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () { };
                self.candidateProfile = new CandidateProfile();               
                self.token = ko.observable();
                self.searchPhrase = ko.observable();
                self.countryCode = ko.observable();
                self.jobTitle = ko.observable();
                self.firstName = ko.observable();
                self.lastName = ko.observable();
                self.genderCodeValue = ko.observable();
                self.cityName = ko.observable();
                self.addressOne = ko.observable();
                self.postCode = ko.observable();
                self.primaryContactNumber = ko.observable();
                self.emailAddress = ko.observable();
                self.currentJobTitle = ko.observable();
                self.availabilityCodeValue = ko.observable();
                self.nationalityCodeValue = ko.observable();
                self.industryExperienceCodeValue = ko.observable();
                self.employmentTypeCodeValues = ko.observableArray([]);
                self.educationCodeValue = ko.observable();
                self.summaryOfExperienceCategoryCodeValue = ko.observable();
                self.summaryOfExperience = ko.observable();
                self.experienceDisciplineFirstLevelCodeValue = ko.observable();
                self.experienceDisciplineSecondLevelCodeValue = ko.observable();
                self.experienceDisciplineThirdLevelCodeValue = ko.observable();
                self.categoryOfPersonnelCodeValue = ko.observable();
                self.companyName = ko.observable();
                self.contactPerson = ko.observable();
                self.title = ko.observable();
                self.email = ko.observable();
                self.telephoneNumber = ko.observable();
                self.location = ko.observable();
                self.projectBeingDownManned = ko.observable();
                self.amountOfPersonnelAvailable = ko.observable();
                self.descriptionOfPersonnelAvailable = ko.observable();
                self.availableDate  = ko.observable();
                self.additionalInformation = ko.observable();
                self.createdDateTime = ko.observable();
                self.isPublic = ko.observable();
                self.isActive = ko.observable();
                self.cvFileId = ko.observable();
                self.cvFileLocation = ko.observable();
                self.cvFileReference = ko.observable();
                self.cvHighlightedText = ko.observable();
               
                //self.selectionChanged = ko.observable();

                self.currentPosition = ko.pureComputed(function () {
                    return self.currentJobTitle();
                });

                self.fullName = ko.pureComputed(function () {
                    return self.firstName() + ' ' + self.lastName();
                });

            };
            ko.utils.extend(CompanyRedundantProfile.prototype, Item);

            return CompanyRedundantProfile;
        });
})();
