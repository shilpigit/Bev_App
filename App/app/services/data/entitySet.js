(function () {
    'use strict';

    define([
            'knockout',
            'services/core/logger'
        ],
        function (ko, logger) {

            var EntitySet = function (getFunction, newFunction, updateFunction, deleteFunction) {
                var self = this;

                self.copyItem = copyItem;
                self.deleteItem = deleteItem;
                self.items = ko.observableArray();
                self.getData = getData;
                self.getItemById = getItemById;
                self.saveItem = saveItem;
                self.newItem = newItem;

                function getData(data, forceGet) {
                    self.items([]);

                    return $.Deferred(function (def) {
                        if (self.items().length > 0 && !forceGet) {
                            def.resolve();
                        } else {

                            getFunction({
                                success: function (dtoList) {
                                    var items = [];

                                    dtoList.forEach(function (dto) {
                                        var item = newFunction();

                                        if (!item.update){
                                            throw 'Item does not implement an update method';
                                        }

                                        item.update(dto);
                                        items.push(item);
                                    });

                                    self.items(items);
                                    def.resolve();
                                },
                                error: function () {
                                    logger.log('GetData faced an error');
                                    def.reject();
                                }
                            }, data);
                        }
                    }).promise();
                }

                function copyItem(from, to) {
                    var entityJson = ko.mapping.toJS(from);

                    to.update(entityJson);
                }

                function getItemById(id) {
                    var matchingItems = ko.utils.arrayFilter(self.items(), function (el) {
                        return el.id() === id;
                    });

                    if (matchingItems.length === 1) {
                        return matchingItems[0];
                    }

                    throw new Error('Unable to find item with id ' + id);
                }

                function deleteItem(id, params) {
                    return $.Deferred(function (def) {

                        deleteFunction({
                            success: function (response) {

                                // Look up
                                var existingItem = findById(self.items, id);

                                if (existingItem !== null) {
                                    // Remove
                                    self.items.remove(existingItem);
                                }

                                def.resolve(response);
                            },
                            error: function (response) {
                                logger.log('DeleteItem faced an error');

                                def.reject(response);
                                return;
                            }
                        }, id, params);
                    }).promise();
                }

                function saveItem(entity, callbacks, args) {
                    var entityJson = ko.mapping.toJS(entity);

                    return $.Deferred(function (def) {

                        updateFunction({
                            success: function (response) {

                                if (response && !entity.id()) {
                                    entity.update(response);

                                    self.items.push(entity);
                                }

                                if (callbacks && callbacks.success) {
                                    callbacks.success();
                                }

                                def.resolve(response);
                            },
                            error: function (response) {
                                logger.log('SaveItem faced an error');
                                if (callbacks && callbacks.error) {
                                    callbacks.error();
                                }

                                def.reject(response);

                                return;
                            }
                        }, entityJson, args);
                    }).promise();
                }

                function newItem () {
                    return newFunction();
                }

                function findById(items, id) {
                    return $.grep(items(), function (item) {
                        return item.id() === id;
                    }, false)[0];
                }
            };

            return EntitySet;
        });

})();
