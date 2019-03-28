(function () {
    'use strict';

    define(['services/core/logger'],
        function () {

            var service = {
                getPartyName: getPartyName,
                setPartyName: setPartyName
            };

            return service;

            function getPartyName(names, typeCode) {
                return names().filter(function (name) {
                    return name.nameCode() === typeCode;
                })[0];
            }

            function setPartyName(names, typeCode, name) {
                var namePart = getPartyName(names, typeCode);

                if (!namePart) {
                    names.push({nameCode: ko.observable(typeCode), name: ko.observable(name)});
                }
                else {
                    namePart.name(name);
                }
            }
        });
})();
