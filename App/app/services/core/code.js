(function () {
    'use strict';

    define(['services/data/datacontext'],
        function (datacontext) {

            var service = {
                getLocalizedCodes: getLocalizedCodes,
                getLocalizedCodeSet: getLocalizedCodeSet,
                getMappedCodes: getMappedCodes
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
                    if (!code.dataDefinitionId || !code.dataDefinitionId()){
                        throw 'Code does not contain data definition';
                    }

                    var dataDefinitionId = code.dataDefinitionId().substring(0, 1).toLowerCase() + code.dataDefinitionId().substring(1);

                    return {
                        codeValue: code.codeValue,
                        name: ko.observable(datacontext.translations.item[dataDefinitionId]()),
                        codeSetId: code.codeSetId,
                        sortOrder: code.sortOrder
                    };
                });
            }

            function getMappedCodes(fromCodeSetId, toCodeSetId, fromValues) {
                var toCodeSet = getLocalizedCodeSet(toCodeSetId);

                if (fromValues && !Array.isArray(fromValues)) {
                    fromValues = [fromValues];
                }

                return datacontext.codeMappings.items().filter(function(mapping){
                    if (mapping.fromCodeSetId() === fromCodeSetId &&
                        mapping.toCodeSetId() === toCodeSetId) {

                        return !fromValues || fromValues.indexOf(mapping.fromCode()) > -1;
                    }
                }).map(function(mapping){
                    return toCodeSet.getById(mapping.toCode());
                });
            }
        }
    );
})();
