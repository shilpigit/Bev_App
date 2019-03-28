(function () {
    'use strict';

    define([
            'services/data/dataaccess',
            'model/model'
        ],
        function (dataaccess) {

            var service = {
                getItem: getItem
            };

            init();

            return service;

            function init() {
                dataaccess.defineGet('getFileUrl', 'storage/url');
            }

            function getItem(callbacks, id) {
                return dataaccess.request('getFileUrl', callbacks, {id: id});
            }

        });
})();
