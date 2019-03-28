(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess, model) {

            var service = {
                deleteItem: deleteItem,
                getItems: getItems,
                getItem: getItem,
                getApplicationItems: getApplicationsItem,
                search: search,
                searchPaged: searchPaged,
                newItem: newItem,
                newPagedItem: newPagedItem,
                newVacancySearchResultItem: newVacancySearchResultItem,
                saveItem: saveItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineDelete('deleteVacancy', 'vacancy');
                dataaccess.defineGet('getCompanyVacancies', 'vacancy/companyvacancies/{companyId}');
                dataaccess.defineGet('getVacancyApplications', 'vacancy/applications/{vacancyId}');
                dataaccess.defineGet('getVacancies', 'vacancy');
                dataaccess.defineGet('getVacancy', 'vacancy/{id}');
                dataaccess.defineGet('getSearchVacancies', 'vacancy/search/advanced'); // using advanced search because nobody uses phrasal search in Panel
                dataaccess.defineGet('getPagedSearchVacancies', 'vacancy/search/advanced'); // same reason as above
                dataaccess.definePut('putVacancy', 'vacancy');
                dataaccess.definePost('postVacancy', 'vacancy');
            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteVacancy', callbacks, {id: id});
            }

            function saveItem(callbacks, data) {
                // Save (put/post)
                return dataaccess.save(data.id ? 'putVacancy' : 'postVacancy', callbacks, data);
            }

            function getItems(callbacks) {
                //return dataaccess.request('getCompanyVacancies', callbacks, {companyId: companyId});
                return dataaccess.request('getVacancies', callbacks);
            }

            function getApplicationsItem(callbacks, vacancyId) {
                return dataaccess.request('getVacancyApplications', callbacks, {vacancyId: vacancyId});
            }

            function getItem(callbacks, id) {
                return dataaccess.request('getVacancy', callbacks, {id: id});
            }

            function search(callbacks, vacancySearchParameter) {
                return dataaccess.request('getSearchVacancies', callbacks, vacancySearchParameter);
            }

            function searchPaged(callbacks, vacancySearchParameter) {
                return dataaccess.request('getPagedSearchVacancies', callbacks, vacancySearchParameter);
            }

            function newItem() {
                return new model.Vacancy();
            }

            function newPagedItem() {
                return new model.PagedVacancy();
            }

            function newVacancySearchResultItem() {
                return new model.VacancySearchResult();
            }

        });
})();
