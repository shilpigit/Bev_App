(function () {
    'use strict';

    define(['model/item', 'model/code'],
        function (Item, Code) {

            var CodeSet = function () {
                var self = this;

                self.id = ko.observable();
                self.state = function () {};
                self.name = ko.observable();
                self.codes = ko.observableArray();

                self.state.mapping = {
                    'codes': {
                        create: function (options) {
                            var code = new Code();

                            ko.mapping.fromJS(options.data, {}, code);

                            return code;
                        }
                    }
                };
            };

            CodeSet.prototype.getItemById = function(id){
                var matches = ko.utils.arrayFilter(this.codes(), function(el) {
                    return el.codeValue() === id;
                });

                if (matches.length === 1){
                    return matches[0];
                }

                throw 'Unable to find code with id ' + id + ' in code set ' + this.id();
            };

            ko.utils.extend(CodeSet.prototype, Item);

            return CodeSet;
        });
    })
();