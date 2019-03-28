(function () {
    'use strict';

    define(['services/core/logger',
            'services/data/datacontext',
            'services/data/dataservice',
            'model/model'],
        function (logger, datacontext, dataserivce, model) {

            var service = {
                search: search,
                applyForVacancy: applyForVacancy,
                sendMailToApplicants: sendMailToApplicants,
                getApplicationsCount: getApplicationsCount,
                items: ko.observableArray()
            };

            return service;

            function applyForVacancy(vacancyId, userId) {

                return $.Deferred(function (def) {

                    var applicant = new model.VacancyApplicant();

                    applicant.userAccountId(userId);
                    applicant.vacancyId(vacancyId);
                    applicant.isDeleted(false);

                    dataserivce.vacancyApplicant.saveItem({
                        success: function () {
                            datacontext.myVacancyApplications.items.push(applicant);
                            def.resolve();
                        },
                        error: function () {
                            logger.log('Applying for vacancy faced some Errors');
                            def.reject();
                        }
                    }, applicant);
                }).promise();

            }

            function getApplicationsCount(vacancyId) {

                return $.Deferred(function (def) {
                    dataserivce.vacancyApplicant.getApplicationsCount({
                        success: function (c) {
                            // add to state
                            def.resolve(c); //return value from deffer
                        },
                        error: function () {
                            logger.log('Getting Applications faced some Errors');
                            def.reject();
                        }
                    }, vacancyId);
                }).promise();

            }

            function sendMailToApplicants(vacancyApplicantMailParameter) {

                return $.Deferred(function (def) {

                    dataserivce.vacancyApplicant.sendMailToApplicants({
                        success: function () {
                            def.resolve();
                        },
                        error: function () {
                            logger.log('Sending Mail To Applicants faced some Errors');
                            def.reject();
                        }
                    }, vacancyApplicantMailParameter);

                }).promise();

            }

            function search(searchPhrase) {

                // this mother fucker does not work!
                return $.Deferred(function (def) {
                    dataserivce.vacancy.search({
                        success: function (dtoList) {
                            var items = [];

                            dtoList.forEach(function (dto) {
                                // Create using new function and update
                                var item = new model.CandidateProfileContainer();

                                if (!item.update) {
                                    throw 'Item does not implement an update method';
                                }

                                item.update(dto);
                                items.push(item);
                            });

                            // Update observable array
                            this.items(items);
                            def.resolve();
                        },
                        error: function () {
                            logger.log('Get Candidate Profile Container Error');
                            def.reject();
                        }
                    }, searchPhrase);
                }).promise();

            }
        });
})();
