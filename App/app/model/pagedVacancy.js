(function () {
    'use strict';

    define(['model/item', 'model/vacancySearchResult'],
        function (Item, VacancySearchResult) {

            var PagedVacancy = function () {
                var self = this;

                self.state = function () {};
                self.vacancySearchResult = ko.observableArray();
                self.continuationToken = ko.observable();
                self.recordsCount = ko.observable();


                self.state.mapping = {
                    'vacancySearchResult': {
                        create: function (options) {
                            var request = new VacancySearchResult();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    }
                };
            };

            ko.utils.extend(PagedVacancy.prototype, Item);

            return PagedVacancy;
        });
})();
