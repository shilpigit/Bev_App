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
                getCommunityItems: getCommunityItems,
                newItem: newItem,
                saveItem: saveItem,
                getContainer: getContainer,
                searchCompanyPaged: searchCompanyPaged,
                invalidateCache: invalidateCache
            };

            init();

            return service;

            function init() {                
                dataaccess.defineDelete('deleteCompany', 'company');
                dataaccess.defineGet('getCompanies', 'company');
                dataaccess.defineGet('getCompanyContainers', 'company/companycontainer/my/{userId}');
                dataaccess.defineGet('getCompanyContainersForCommunity', 'company/companycontainer/forcommunity');
                dataaccess.definePut('putCompany', 'company');
                dataaccess.definePut('invalidateCache', 'company/invalidatecache');
                dataaccess.definePost('postCompany', 'company');
                dataaccess.defineGet('getCompanyContainer', 'company/companycontainer/{id}');
                //---------------------------Added By shilpi----------------------------------------------------------------
                dataaccess.defineGet('getPagedSearchCompanyProfiles', 'company/companyprofilecontainer/searchcompanypaged');
                //---------------------------End----------------------------------------------------------------

            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteCompany', callbacks, {id: id});
            }

            function saveItem(callbacks, data) {
                return dataaccess.save(data.id ? 'putCompany' : 'postCompany', callbacks, data);
            }

            function invalidateCache(callbacks) {
                return dataaccess.request('invalidateCache', callbacks);
            }

            function getItems(callbacks, userId) {
                return dataaccess.request('getCompanyContainers', callbacks, {userId: userId + '?ci=' + Date.now()});
            }

            function getCommunityItems(callbacks) {
                return dataaccess.request('getCompanyContainersForCommunity', callbacks);
            }

            function getContainer(callbacks, id) {
                return dataaccess.request('getCompanyContainer', callbacks, {id: id});
            }

             //---------------------------Added By shilpi----------------------------------------------------------------
            function searchCompanyPaged(callbacks, companyCandidateProfileSearchParameter) {                
                return dataaccess.request('getPagedSearchCompanyProfiles', callbacks, companyCandidateProfileSearchParameter);
            }
             //---------------------------End----------------------------------------------------------------
            function newItem() {
                return new model.CompanyContainer();
            }
        });
})();
