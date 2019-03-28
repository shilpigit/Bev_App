(function () {
    'use strict';

    define(['model/item', 'model/vacancyApplicant', 'model/candidateProfileContainer'],
        function (Item, VacancyApplicant, CandidateProfileContainer) {

            var VacancyApplication = function () {
                var self = this;

                self.state = function () {};
                self.applicant = new VacancyApplicant();
                self.applicantProfileContainer = new CandidateProfileContainer();
                self.isSelected = ko.observable(false);


                self.state.mapping = {
                    'applicantProfileContainer': {
                        create: function (options) {
                            var request = new CandidateProfileContainer();

                            ko.mapping.fromJS(options.data, request.mapping || {}, request);

                            return request;
                        }
                    }
                };
            };

            ko.utils.extend(VacancyApplication.prototype, Item);

            return VacancyApplication;
        });
})();
