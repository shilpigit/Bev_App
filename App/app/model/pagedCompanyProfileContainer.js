(function () {
    'use strict';

    define(['model/item', 'model/companyRedundantProfile'],
        function (Item, CompanyRedundantProfile) {

            var PagedCompanyProfileContainer = function () {
                var self = this;

                self.state = function () {};
                self.companyContainers = ko.observableArray();
                self.continuationToken = ko.observable();
                self.recordsCount = ko.observable();

                self.state.mapping = {
                    'companyContainers': {
                        create: function (options) {
                            var request = new CompanyContainer();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    }
                };
            };

            ko.utils.extend(PagedCompanyProfileContainer.prototype, Item);

            return PagedCompanyProfileContainer;
        });
})();
