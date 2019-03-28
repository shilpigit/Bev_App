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
                getThisYearItems: getThisYearItems,
                newItem: newItem,
                saveItem: saveItem,
                getItem: getItem
            };

            init();

            return service;

            function init() {

                dataaccess.defineGet('getDocumentLibraryContainer', 'documentlibrary/DocumentLibraryContainer/{id}');
                dataaccess.defineGet('getDocumentLibraryContainers', 'documentlibrary/documentlibrarycontainer');
                dataaccess.defineGet('getThisYearDocumentLibraryContainers', 'documentlibrary/documentLibrarycontainer/current');
                dataaccess.defineGet('getDocumentLibrarys', 'documentlibrary');

                dataaccess.defineDelete('deleteDocumentLibrary', 'documentlibrary');

                dataaccess.definePut('putDocumentLibrary', 'documentlibrary');
                dataaccess.definePost('postDocumentLibrary', 'documentlibrary');
            }

            function deleteItem(callbacks, id) {
                dataaccess.request('deleteDocumentLibrary', callbacks, {id: id});
            }

            function saveItem(callbacks, data) {
                return dataaccess.save(data.id ? 'putDocumentLibrary' : 'postDocumentLibrary', callbacks, data);
            }

            function getItems(callbacks) {
                return dataaccess.request('getDocumentLibraryContainers', callbacks);
            }

            function getThisYearItems(callbacks) {
                return dataaccess.request('getThisYearDocumentLibraryContainers', callbacks);
            }

            function getItem(callbacks, id) {
                return dataaccess.request('getDocumentLibraryContainer', callbacks, {id: id});
            }

            function newItem() {
                return new model.DocumentLibraryContainer();
            }
        });
})();
