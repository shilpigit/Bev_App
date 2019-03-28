(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                newItem: newItem,
                newPagedItem: newPagedItem,
                newVacancyApplicationItem: newVacancyApplicationItem,
                newPagedVacancyApplicationItem: newPagedVacancyApplicationItem,
                saveItem: saveItem,
                getMyApplications: getMyApplications,
                sendMailToApplicants: sendMailToApplicants,
                getApplicationsCount: getApplicationsCount,
                getPagedApplication: getPagedApplication
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getVacancyApplications', 'vacancyapplicant/applications/{vacancyId}');
                dataaccess.defineGet('getMyApplications', 'vacancyapplicant/myApplications/{userAccountId}');
                dataaccess.defineGet('getPagedSearchVacancyApplicants', 'vacancyapplicant/search/advanced');
                dataaccess.definePost('postVacancyApplicant', 'vacancyapplicant');
                dataaccess.definePost('sendMailToApplicants', 'vacancyapplicant/sendMailToApplicants');
                dataaccess.defineGet('getApplicationsCount', 'vacancyapplicant/applicants/count/{vacancyId}');
                dataaccess.defineGet('getVacancyApplicants', 'vacancyapplicant/applicants');
            }


            function saveItem(callbacks, data) {
                return dataaccess.save('postVacancyApplicant', callbacks, data);
            }

            //function getItems(callbacks) {
            //    return dataaccess.request('getVacancies', callbacks);
            //}

            //function getItem(callbacks, id) {
            //    return dataaccess.request('getVacancy', callbacks, {id: id});
            //}


            function getPagedApplication(callbacks, data) {
                return dataaccess.request('getVacancyApplicants', callbacks, data);
            }

            function getApplicationsCount(callbacks, vacancyId) {
                return dataaccess.request('getApplicationsCount', callbacks, {vacancyId: vacancyId});
            }

            function getMyApplications(callbacks, data) {
                return dataaccess.request('getMyApplications', callbacks, data);
            }

            function newItem() {
                return new model.VacancyApplicant();
            }

            function newPagedItem() {
                return new model.PagedVacancy();
            }

            function newPagedVacancyApplicationItem() {
                return new model.PagedVacancyApplication();
            }

            function newVacancyApplicationItem() {
                return new model.VacancyApplication();
            }

            function sendMailToApplicants(callbacks, data) {
                return dataaccess.save('sendMailToApplicants', callbacks, data);
            }

        });
})();
