(function() {
    'use strict';

    define(['durandal/system', 'toastr'],
        function(system, toastr) {
            var logger = {
                log: log,
                logSuccess: logSuccess,
                logError: logError,
                logInfo: logInfo,
                logWarning: logWarning
            };

            return logger;

            function log(message, data, source) {
                logIt(message, data, source);
            }

            function logError(message, data, source) {
                logIt(message, data, source);

                toastr.error(message);
            }

            function logSuccess(message, data, source) {
                logIt(message, data, source);

                toastr.success(message);
            }

            function logInfo(message, data, source) {
                logIt(message, data, source);

                toastr.info(message);
            }

            function logWarning(message, data, source) {
                logIt(message, data, source);

                toastr.warning(message);
            }

            function logIt(message, data, source) {
                source = source ? '[' + source + '] ' : '';

                if (data) {
                    system.log(source, message, data);
                } else {
                    system.log(source, message);
                }
            }
        });
})();
