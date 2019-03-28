(function () {
    'use strict';

    define(['model/item', 'model/vacancyApplicant', 'model/salarySought'],
        function (Item, VacancyApplicant, SalarySought) {

            var Vacancy = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.companyId = ko.observable();
                self.userId = ko.observable();
                self.jobTitle = ko.observable();
                self.countryCode = ko.observable();
                self.cityName = ko.observable();
                self.responsibilities = ko.observable();
                self.scopeOfResponsibilities = ko.observable();
                self.entryRequirements = ko.observable();
                self.additionalInformation = ko.observable();
                self.requireVisa = ko.observable();
                self.createdDateTime = ko.observable();
                self.isActive = ko.observable();
                self.industryExperienceCodeValue = ko.observable();
                self.employmentTypeCodeValues = ko.observableArray([]);
                self.salarySought = new SalarySought();
                self.educationCodeValue = ko.observable();
                self.summaryOfExperienceCategoryCodeValue = ko.observable();
                self.summaryOfExperience = ko.observable();
                self.experienceDisciplineFirstLevelCodeValue = ko.observable();
                self.experienceDisciplineSecondLevelCodeValue = ko.observable();
                self.experienceDisciplineThirdLevelCodeValue = ko.observable();
                self.jobAge = ko.observable();
                self.isBeingApplied = ko.observable(false);
                self.isShowingApplications = ko.observable(false);
                self.vacancyIsLoaded = ko.observable(false);
                self.isBeingShown = ko.observable(false);
                self.agingEpoch = ko.observable();
                self.applicationsCount = ko.observable('<div class="loading"></div>');
                self.applicationsCountIsLoaded = ko.observable(false);
                self.applicants = ko.observableArray();

                self.relativeAgingEpoch = ko.pureComputed(function () {                    
                    if (self.agingEpoch()) {                       
                        return moment((self.agingEpoch() * 1000)).format('ddd, MMM Do YYYY');
                    }
                    else {
                        return 'Who Knows!';
                    }
                });

                self.relativePostedDateTime = ko.pureComputed(function () {
                    
                    if (self.createdDateTime()) {
                        return moment(self.createdDateTime()).fromNow();
                    }
                    else {
                        return 'Who Knows!';
                    }
                });

                self.expiresOn = ko.pureComputed(function () {
                    if (self.createdDateTime()) {

                        if(self.jobAge()){
                            return moment((self.agingEpoch() * 1000)).add(self.jobAge(), 'days').fromNow();
                        }
                        return '';
                    }
                    else {
                        return '';
                    }
                });

                self.smartExpiresOn = ko.pureComputed(function () {
                    if (self.expiresOn()) {
                        if(self.expiresOn().startsWith('in')){
                            return 'Expires ' + self.expiresOn();
                        }
                        if(self.expiresOn().endsWith('ago')){
                            return 'Expired ' + self.expiresOn();
                        }
                        return self.expiresOn();
                    }
                    else {
                        return '';
                    }
                });

            };

            ko.utils.extend(Vacancy.prototype, Item);

            return Vacancy;
        });
})();
