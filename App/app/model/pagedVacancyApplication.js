(function () {
    'use strict';

    define(['model/item', 'model/vacancyApplication'],
        function (Item, VacancyApplication) {

            var PagedVacancyApplication = function () {
                var self = this;

                self.state = function () {};
                self.applications = ko.observableArray();
                self.continuationToken = ko.observable();
                self.recordsCount = ko.observable();


                self.state.mapping = {
                    'applications': {
                        create: function (options) {
                            var request = new VacancyApplication();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    }
                };
            };

            ko.utils.extend(PagedVacancyApplication.prototype, Item);

            return PagedVacancyApplication;
        });
})();
