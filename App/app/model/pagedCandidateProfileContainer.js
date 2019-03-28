(function () {
    'use strict';

    define(['model/item', 'model/candidateProfileContainer'],
        function (Item, CandidateProfileContainer) {

            var PagedCandidateProfileContainer = function () {
                var self = this;

                self.state = function () {};
                self.candidateProfileContainers = ko.observableArray();
                self.continuationToken = ko.observable();
                self.recordsCount = ko.observable();

                self.state.mapping = {
                    'candidateProfileContainers': {
                        create: function (options) {
                            var request = new CandidateProfileContainer();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    }
                };
            };

            ko.utils.extend(PagedCandidateProfileContainer.prototype, Item);

            return PagedCandidateProfileContainer;
        });
})();
