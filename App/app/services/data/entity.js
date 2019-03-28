(function () {
    'use strict';

    define(['knockout', 'services/core/logger'],
        function (ko, logger) {

            var Entity = function (getFunction, newFunction, updateFunction) {
                var self = this;

                self.item = newFunction && newFunction() || {};

                self.newItem = newItem;
                self.copyItem = copyItem;
                self.getItem = getItem;
                self.saveItem = saveItem;

                function copyItem(from, to) {
                    var entityJson = ko.mapping.toJS(from);

                    to.update(entityJson);
                }

                function getItem(id) {
                    return $.Deferred(function (def) {
                        getFunction({
                                success: function (dto) {
                                    self.item.update(dto);

                                    def.resolve(self.item);
                                },
                                error: function () {
                                    logger.log('GetItem faced error');
                                    def.reject();
                                }
                            },
                            id);
                    }).promise();
                }

                function newItem() {
                    return newFunction();
                }

                function saveItem(callbacks, args) {
                    var entityJson = ko.mapping.toJS(self.item);

                    return $.Deferred(function (def) {

                        updateFunction({
                            success: function (response) {
                                if (response) {
                                    self.item.update(response);
                                }

                                if (callbacks && callbacks.success) {
                                    callbacks.success();
                                }

                                def.resolve(response);
                            },
                            error: function (response) {
                                logger.logError('UpdateItem faced issues');
                                if (callbacks && callbacks.error) {
                                    callbacks.error();
                                }
                                def.reject(response);
                                return;
                            }
                        }, entityJson, args);
                    }).promise();
                }
            };

            return Entity;
        });
})();