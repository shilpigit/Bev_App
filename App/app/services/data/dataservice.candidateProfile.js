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
                search: search,
                searchPaged: searchPaged,
                advancedSearch: advancedSearch,
                newItem: newItem,
                newPagedItem: newPagedItem,
                saveItem: saveItem,
                getItem: getItem,
                getCurrentUserCandidateProfileContainer: getCurrentUserCandidateProfileContainer
            };

            init();

            return service;

            function init() {
                dataaccess.defineDelete('deleteCandidateProfile', 'candidateprofile');
                dataaccess.defineGet('getCandidateProfiles', 'candidateprofile');
                dataaccess.defineGet('getCandidateProfileAdvancedSearch', 'candidateprofile/candidateprofilecontainer/search/advanced');
                dataaccess.defineGet('getCandidateProfileContainers', 'candidateprofile/candidateprofilecontainer');
                dataaccess.definePut('putCandidateProfile', 'candidateprofile/candidateProfileContainer/putCandidateProfile');
                dataaccess.definePost('postCandidateProfile', 'candidateprofile/candidateProfileContainer/postCandidateProfile');
                dataaccess.defineGet('getCandidateProfileContainer', 'candidateprofile/candidateprofilecontainer/{id}');
                dataaccess.defineGet('getSearchCandidateProfiles', 'candidateprofile/candidateprofilecontainer/search');
                dataaccess.defineGet('getPagedSearchCandidateProfiles', 'candidateprofile/candidateprofilecontainer/searchpaged');
                dataaccess.defineGet('getCurrentUserCandidateProfileContainer', 'candidateprofile/candidateprofilecontainer/user');
              //  dataaccess.defineGet('getCurrentUserCandidateProfileContainer', 'candidateprofile/candidateprofilecontainer/user');
            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteCandidateProfile', callbacks, {id: id});
            }

            function saveItem(callbacks, data) {
                return dataaccess.save(data.id ? 'putCandidateProfile' : 'postCandidateProfile', callbacks, data);
            }
            
            function getItems(callbacks) {
                return dataaccess.request('getCandidateProfileContainers', callbacks);
            }

            function search(callbacks, candidateProfileSearchParameter) {
                return dataaccess.request('getSearchCandidateProfiles', callbacks,candidateProfileSearchParameter);
            }

            function searchPaged(callbacks, candidateProfileSearchParameter) {                
                return dataaccess.request('getPagedSearchCandidateProfiles', callbacks,candidateProfileSearchParameter);
            }

            function advancedSearch(callbacks, candidateProfileSearchParameter) {
                return dataaccess.request('getCandidateProfileAdvancedSearch', callbacks,candidateProfileSearchParameter);
            }
            function getCurrentUserCandidateProfileContainer(callbacks) {
                return dataaccess.request('getCurrentUserCandidateProfileContainer', callbacks);
            }

            function getItem(callbacks, id) {
                return dataaccess.request('getCandidateProfileContainer', callbacks, {id: id});
            }

            function newItem() {
                return new model.CandidateProfileContainer();
            }

            function newPagedItem() {
                return new model.PagedCandidateProfileContainer();
            }
        });
})();
