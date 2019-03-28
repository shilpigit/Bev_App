'use strict';

// jshint unused:false
define([
        'knockout',
        'services/core/config',
        'services/core/logger',
        'tinymce'
    ],
    function (ko, config, logger, tinymce) {

        ko.extenders.async = function(computedDeferred, initialValue) {

            var plainObservable = ko.observable(initialValue), currentDeferred;
            plainObservable.inProgress = ko.observable(false);

            ko.computed(function() {
                if (currentDeferred) {
                    currentDeferred.reject();
                    currentDeferred = null;
                }

                var newDeferred = computedDeferred();
                if (newDeferred &&
                    (typeof newDeferred.done === 'function')) {

                    plainObservable.inProgress(true);

                    currentDeferred = $.Deferred().done(function(data) {
                        plainObservable.inProgress(false);
                        plainObservable(data);
                    });
                    newDeferred.done(currentDeferred.resolve);
                } else {
                    plainObservable(newDeferred);
                }
            });

            return plainObservable;
        };

        ko.onDemandObservable = function(callback, target) {
            var _value = ko.observable();  //private observable

            var result = ko.dependentObservable({
                read: function() {
                    //if it has not been loaded, execute the supplied function
                    if (!result.loaded()) {
                        callback.call(target);
                    }
                    //always return the current value
                    return _value();
                },
                write: function(newValue) {
                    //indicate that the value is now loaded and set it
                    result.loaded(true);
                    _value(newValue);
                },
                deferEvaluation: true  //do not evaluate immediately when created
            });

            //expose the current state, which can be bound against
            result.loaded = ko.observable();
            //load it again
            result.refresh = function() {
                result.loaded(false);
            };

            return result;
        };

        // internal methods
        var getDefaultOption = function (element) {
            return $(element.options[0]);
        };

        var enableDefault = function (element) {
            getDefaultOption(element).removeAttr('disabled');
        };

        var disableDefault = function (element) {
            getDefaultOption(element).attr('disabled', 'disabled');
        };

        var configure = function (defaults, extensions, options, args) {

            // Apply global configuration over TinyMCE defaults
            var config = $.extend(true, {}, defaults);

            if (options) {
                // Concatenate element specific configuration
                ko.utils.objectForEach(options, function (property) {
                    if (Object.prototype.toString.call(options[property]) === '[object Array]') {
                        if (!config[property]) {
                            config[property] = [];
                        }
                        options[property] = ko.utils.arrayGetDistinctValues(config[property].concat(options[property]));
                    }
                });

                $.extend(true, config, options);
            }

            // Ensure paste functionality
            if (!config.plugins) {
                config.plugins = ['paste'];
            } else if ($.inArray('paste', config.plugins) === -1) {
                config.plugins.push('paste');
            }

            // Define change handler
            var applyChange = function (editor) {
                // Ensure the valueAccessor state to achieve a realtime responsive UI.
                editor.on('change keyup nodechange', function (e) {
                    // Update the valueAccessor
                    args[1]()(editor.getContent());

                    // Run all applied extensions
                    for (var name in extensions) {
                        if (extensions.hasOwnProperty(name)) {
                            ko.bindingHandlers.wysiwyg.extensions[extensions[name]](editor, e, args[2], args[4]);
                        }
                    }
                });
            };

            if (typeof( config.setup ) === 'function') {
                var setup = config.setup;

                // Concatenate setup functionality with the change handler
                config.setup = function (editor) {
                    setup(editor);
                    applyChange(editor);
                };
            } else {
                // Apply change handler
                config.setup = applyChange;
            }

            return config;
        };

        ko.bindingHandlers.datepicker = {
                init: function (element, valueAccessor, allBindingsAccessor) {

                    // Initialize date picker
                    var options = allBindingsAccessor().datepickerOptions ||
                        {
                            format: 'dd M yyyy',
                            orientation: 'auto',
                            autoclose: true,
                            widgetPositioning: {
                                vertical: 'auto',
                                horizontal: 'left'
                            }
                        };

                    $(element).datepicker(options);

                    var value = ko.utils.unwrapObservable(valueAccessor());

                    $(element).data('datepicker').setDate(value);

                    $(element).on('changeDate', function (e) {
                        var observable = valueAccessor();
                        observable(e.date);

                    });
                },
                update: function (element, valueAccessor) {
                    var value = ko.utils.unwrapObservable(valueAccessor());
                    $(element).data('datepicker').setDate(value);
                }
            };

        ko.bindingHandlers.timepicker = {
            init: function (element, valueAccessor, allBindingsAccessor) {

                var options = allBindingsAccessor().datepickerOptions || {pickDate: false, pickSeconds: false};

                $(element).datetimepicker(options);

                var value = ko.utils.unwrapObservable(valueAccessor());

                $(element).data('datetimepicker').setLocalDate(value);

                $(element).on('changeDate', function (e) {
                    var observable = valueAccessor();
                    observable(e.localDate);
                });
            },
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                $(element).data('datetimepicker').setLocalDate(value);
            }
        };

        // it was designed to be image uploader later changed to file uploader
        ko.bindingHandlers.fileupload = {
            
            init: function (element, valueAccessor) {

                var fileObj = ko.utils.unwrapObservable(valueAccessor());

                if (!fileObj.fileUrl || !fileObj.fileReference) {
                    logger.logError('An Observable object with Url and Reference fields must be passed');
                }

                $(element).bind('change', function (evt) {                    

                    fileObj.uploadCompleted(false);
                    var files = evt.target.files;

                    if (files.length > 0) {

                        var formData = new FormData();
                        var file = files[0];

                        if (fileObj.size) {

                            if (fileObj.sizeIsValid) {
                                if (file.size > fileObj.size()) {
                                    fileObj.sizeIsValid(false);
                                    return;
                                }
                                else {
                                    fileObj.sizeIsValid(true);
                                }
                            }
                        }

                        formData.append('file', file);
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', config.root + 'api/imageupload/Post', true);

                        xhr.upload.onprogress = function (e) {
                            if (e.lengthComputable) {
                                var percentComplete = (e.loaded / e.total) * 100;

                                if (fileObj.hasOwnProperty('percentage')) {
                                    fileObj.percentage(parseInt(percentComplete.toFixed()));
                                }
                            }
                        };

                        xhr.onload = function () {
                            if (this.status === 200) {

                                var response = JSON.parse(this.response)[0];

                                if (fileObj.contentType) {
                                    fileObj.contentType(response.contentType);
                                }

                                fileObj.fileReference(response.name);
                                fileObj.fileUrl(response.location);

                                if (fileObj.uploadCompleted) {
                                    fileObj.uploadCompleted(true);
                                }

                            }
                            else {
                                if (fileObj.uploadCompleted) {
                                    fileObj.uploadCompleted(false);
                                }
                            }
                        };

                        xhr.send(formData);
                    }
                });
            }
        };

        ko.bindingHandlers.messageBox = {
            init: function (element) {
                $(element).hide();
            },
            update: function (element, valueAccessor) {
                var val = ko.utils.unwrapObservable(valueAccessor());

                if (!val.type() || val.type().length === 0) {
                    val.type('info');
                }
                if (val.message() && val.message().length > 0) {
                    return ko.bindingHandlers.html.update(element, function () {

                        $(element).fadeIn('slow');
                        return '<div class="alert alert-' + val.type() + '" role="alert">' + val.message() + '</div>';

                    });
                }

                $(element).fadeOut('slow');
                return '';
            }
        };

        ko.bindingHandlers.selected = {
            update: function (element, valueAccessor) {
                var selected = ko.utils.unwrapObservable(valueAccessor());
                if (selected) {
                    element.focus();
                    element.select();
                }
            }
        };

        ko.bindingHandlers.wysiwyg = {
            after: ['attr', 'value'],

            defaults: {},

            extensions: {},

            init: function (element, valueAccessor, allBindings) {
                if (!ko.isWriteableObservable(valueAccessor())) {
                    throw 'valueAccessor must be writeable and observable';
                }

                // Get custom configuration object from the 'wysiwygConfig' binding, more settings here... http://www.tinymce.com/wiki.php/Configuration
                var options = allBindings.has('wysiwygConfig') ? allBindings.get('wysiwygConfig') : null,

                // Get any extensions that have been enabled for this instance.
                    ext = allBindings.has('wysiwygExtensions') ? allBindings.get('wysiwygExtensions') : [],

                    settings = configure(ko.bindingHandlers.wysiwyg.defaults, ext, options, arguments);

                // Ensure the valueAccessor's value has been applied to the underlying element, before instanciating the tinymce plugin
                $(element).text(valueAccessor()());

                // Defer TinyMCE instantiation
                setTimeout(function () {
                    $(element).tinymce(settings);
                }, 0);

                // To prevent a memory leak, ensure that the underlying element's disposal destroys it's associated editor.
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(element).tinymce().remove();
                });

                return {controlsDescendantBindings: true};
            },

            update: function (element, valueAccessor) {
                var tinymce = $(element).tinymce(),
                    value = valueAccessor()();

                if (tinymce) {
                    if (tinymce.getContent() !== value) {
                        tinymce.setContent(value);
                        tinymce.execCommand('keyup');
                    }
                }
            }
        };

        ko.bindingHandlers.optionsDisableDefault = {
            init: function (element, valueAccessor) {
                if (!element.tagName.match(/^SELECT$/i)) {
                    throw new Error('The optionsDisableDefault binding can only be applied to <select>...</select> elements.');
                }

                if (valueAccessor()) {
                    disableDefault(element);
                } else {
                    enableDefault(element);
                }
            },
            update: function (element, valueAccessor) {
                if (!element.tagName.match(/^SELECT$/i)) {
                    throw new Error('The optionsDisableDefault binding can only be applied to <select>...</select> elements.');
                }

                if (valueAccessor()) {
                    disableDefault(element);
                } else {
                    enableDefault(element);
                }
            }
        };

        ko.bindingHandlers.executeOnEnter = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var callback = valueAccessor();
                $(element).keypress(function (event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        callback.call(viewModel);
                        return false;
                    }
                    return true;
                });
            }
        };
    });
