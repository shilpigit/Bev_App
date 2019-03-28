(function () {
    'use strict';

    define(['model/item','model/vacancy', 'model/companyContainer'],
        function (Item,Vacancy, CompanyContainer) {

            var VacancySearchResult = function () {
                var self = this;

                self.state = function () {};
                self.companyContainer = new CompanyContainer();
                self.vacancy = new Vacancy();
                self.vacancyIsLoaded = ko.observable(false);

                self.formattedPostedDateTime = ko.pureComputed(function () {
                    if (self.vacancy.createdDateTime()) {
                        return moment(self.vacancy.createdDateTime()).format('MMMM Do YYYY');
                    }
                    else {
                        return 'Who Knows!';
                    }
                });

                self.relativePostedDateTime = ko.pureComputed(function () {                    
                    if (self.vacancy.createdDateTime()) {
                        return moment(self.vacancy.createdDateTime()).fromNow();
                    }
                    else {
                        return 'Who Knows!';
                    }
                });

            };

            ko.utils.extend(VacancySearchResult.prototype, Item);

            return VacancySearchResult;
        });
})();
