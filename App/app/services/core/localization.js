(function () {
    'use strict';

    define(['services/data/datacontext'],
        function (datacontext) {

            var service = {
                getLocalizedCodes: getLocalizedCodes,
                getLocalizedCodeSet: getLocalizedCodeSet
            };

            return service;

            function getLocalizedCodeSet(codeSetId) {
                var codeSet = {
                    codeSetId: codeSetId,
                    codes: getLocalizedCodes(codeSetId)
                };

                codeSet.getById = function (codeValue) {
                    return codeSet.codes.filter(function (code) {
                        return code.codeValue() === codeValue;
                    })[0];
                };

                return codeSet;
            }

            function getLocalizedCodes(codeSetId) {
                var codeset = datacontext.codesets.getItemById(codeSetId);

                return codeset.codes().map(function (code) {
                    var dataDefinitionId = code.dataDefinitionId().substring(0, 1).toLowerCase() + code.dataDefinitionId().substring(1);

                    return {
                        codeValue: code.codeValue,
                        name: ko.observable(datacontext.translations.item[dataDefinitionId]()),
                        codeSetId: code.codeSetId,
                        sortOrder: code.sortOrder
                    };
                });
            }
        });
})();
