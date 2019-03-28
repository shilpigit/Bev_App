(function () {
    'use strict';

    define([
            'services/data/dataaccess'
        ],
    function (dataaccess) {

        var diagnostic = {
            getEvents: getEvents,
            getStats: getStats
        };

        init();

        return diagnostic;

        function init(){
            dataaccess.defineGet('getEvents','diagnostics/event');
            dataaccess.defineGet('getStats','diagnostics/stats');
        }

        function getStats (callbacks) {
            return dataaccess.request('getStats',callbacks);
        }

        function getEvents (callbacks) {
            return dataaccess.request('getEvents',callbacks);
        }
    });
})();