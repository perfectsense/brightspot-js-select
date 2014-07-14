/*
**  bsp_select is intended to be an easy way to customize <select> elements
**
**  it's imperative to leverage the provided Less file (or CSS) with your customizations
**  it's also imperative to use the basic HTML structure provided in the example files
**
**  see the HTML file see how bsp_select is invoked & how it coexists with pre-defined
**  change events bound to the original <select> element ...
**
**  lastly bsp_select depends on a recent version of jQuery & bsp-utils.js
**  see http://bower.io or the included bower.json file
**
*/
(function(globals, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery', 'bsp-utils' ], factory);

    } else {
        factory(globals.jQuery, globals.bsp_utils, globals);
    }

})(this, function($, bsp_utils, globals) {

    return bsp_utils.plugin(globals, 'bsp', 'select', {

        /*
        **  _defaultOptions get merged (using $.extend) with options you define when you instantiate the plugin
        **
        **  instantiate the plugin by calling: bsp_select.live( document, "some jQuery selector", { ... some options ... } );
        **
        **  ... to retrieve a current value use: plugin.option(selector, "forceUpward")
        **  in that example you're defining plugin & selector (see more examples below in _each)
        */

        '_defaultOptions': {
            'debug': false,
            'prefix': "custom-select",
            'icons_open':  "fa-chevron-down",
            'icons_close': "fa-chevron-up",
            'maxItems': null,
            'openClassName': "open",
            'openUpwardClassName': "open-upward",
            'forceUpward': false
        },

        '_install': function() {

            /*
            **  _install gets called absolutely once no matter how many times you instantiate the plugin
            **
            **  instantiate the plugin by calling: bsp_select.live( document, "some jQuery selector", { ... some options ... } );
            **
            **  IMPORTANT: by using .live anytime that "some jQuery selector" is inserted in to the DOM
            **  the cycle of _init, _each, _all is kicked off again, for example if $.ajax retrieves a new
            **  <select> & and adds some JS change event to it, upon insertion _init will fire & document
            **  event bindings inside _install will get applied to that new element ...
            **
            **  when _install completes _init is triggered
            */

            var plugin = this;

            // document event bindings
            //     click ---- closes all open selects
            //     keydown -- maps keyboard shortcuts
            $(document)
                .on("click", function() {

                    plugin.closeCustomSelects();

                })
                .on("keydown", function(event) {

                    var key = event.which;

                    var selector = window.bsp_select_cache.selector_currently_opened;

                    // check to ensure keydown applies only when a dropdown is open
                    if (selector === "" || selector === null) {
                        return;
                    }

                    if (!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {

                        // UP ARROW
                        if (key === 38) {
                            plugin.focusOnPreviousOption(selector);
                            return false;
                        }

                        // DOWN ARROW
                        if (key === 40) {
                            plugin.focusOnNextOption(selector);
                            return false;
                        }

                        // ESCAPE
                        if (key === 27) {

                            // on escape, focus on the current / most recent selection

                            // reset index to option seen when dropdown opened
                            plugin._data(selector, "currentSelectionIndex", window.bsp_select_cache.original_option);

                            // scroll back to top of lists
                            var _prefix = plugin.option(selector, "prefix");
                            $(selector).find("."+ _prefix +"-custom-menu").find("ul").css({"top": "0px" });

                            // re-select current selection
                            plugin.focusOnOption(selector);

                            // close select(s)
                            plugin.closeCustomSelects();

                            return false;
                        }

                        // ENTER
                        if (key === 13) {
                            // select focused option
                            plugin.selectOption(selector);
                            // close select(s)
                            plugin.closeCustomSelects();
                            return false;
                        }

                        // DELETE
                        if (key === 8) {

                            // delete key shortens suggestion

                            if (window.bsp_select_cache.suggestion.length > 0) {

                                window.bsp_select_cache.suggestion = window.bsp_select_cache.suggestion.slice(0, -1);

                                plugin.highlightMatchingOptions(selector);

                                plugin.autoSuggest(selector);

                            }

                            return false;
                        }

                    }
                    // else {

                    //     // autosuggest / higlight
                    //     // all letters, numbers, hyphen, underscore, space
                    //     if (/[a-zA-Z0-9-_ ]/.test(key)) {
                    //         var character = String.fromCharCode(key).toLowerCase();
                    //         plugin.autoSuggest(character, selector);
                    //         //return false;
                    //     }

                    // }

                });

            // update String prototype with new method for easy matching
            // used by highlight & autosuggest functionality
            if (typeof String.prototype.startsWith !== 'function') {

                // TODO: verify that this is the best version of this method
                String.prototype.startsWith = function (str){
                    return this.indexOf(str) == 0;
                };
            }

        },

        '_init': function(context, selector) {

            /*
            **  _install finished (or was skipped if not defined as part of this plugin)
            **
            **  _init runs once per each instantiation, e.g.
            **
            **      bsp_select.live( document, "some jQuery selector", { ... some options ... } );
            **
            **  when _init completes _each is triggered
            */

            // skip mobile browsers using this: http://detectmobilebrowser.com/
            if (typeof jQuery.browser !== "undefined" &&
                typeof jQuery.browser.mobile !== "undefined" &&
                jQuery.browser.mobile) {
                return false;
            }

            // skip IE8 & older, this still looks the same
            // until you click at which point upu see the default
            // browser select menu
            if (document.all && !document.addEventListener) {
                return false;
            }

            // start actual plugin "work"

            var plugin = this;

            // this helps document's click event from triggering on the dropdown
            plugin._on(context, 'click', selector, function(event) {
                event.stopPropagation();
                event.preventDefault();
            });

            // this is what transfers clicking on <select> to the custom UI
            plugin._on(context, 'focus mousedown', selector + " select", function() {
                var selectorIndex = $(this).closest(selector).attr("data-bsp-select-index");
                plugin.toggleCustomSelect(selector, selectorIndex);
            });

            // the map is just a cache for global things like which menu is open right now
            window.bsp_select_cache = {
                selector_currently_opened: "",
                selector_instance_count: 0,
                original_option: "",
                suggestion: ""
            };

        },

        '_each': function(selector) {

            /*
            **  _init finished (or was skipped if not defined as part of this plugin)
            **
            **  _each runs once per each matched selector, e.g. the "some jQuery selector" in:
            **
            **        bsp_select.live( document, "some jQuery selector", { ... some options ... } );
            **
            **  when _each completes _all is triggered
            */

            var plugin = this;

            var DEBUG = plugin.option(selector, 'debug');

            // adds convenience data attr & className to track instances of selector
            var bsp_select_index = window.bsp_select_cache.selector_instance_count;
            $(selector).attr("data-bsp-select-index", bsp_select_index).addClass("bsp-select-item-"+bsp_select_index);
            window.bsp_select_cache.selector_instance_count++;

            /*
            **  Note:
            **
            **  plugin._data is a wrapper for jQuery.data
            **
            **  this is a convenient way to cache or store values specific to each instance (or instantiation)
            **
            */

            // _open is an "alias" to open or openUpward
            plugin._data(selector, "_open", plugin.option(selector, "forceUpward") ? plugin.option(selector, "openUpwardClassName") : plugin.option(selector, "openClassName") );

            var _prefix = plugin.option(selector, "prefix");

            /*
            **  Note:
            **
            **  plugin.option(selector) returns the whole instance specific options object
            **
            */

            if (DEBUG) {
                console.log( "_init plugin", plugin, "selector", selector, "options", plugin.option(selector) );
            }

            // create HTML container for custom UI
            $(selector).append("<div class='"+ _prefix +"-custom-menu'><ul></ul></div>");

            // get all the <option>s
            $(selector).find("option").each(function(i, option) {

                // convert <option> to <li>

                // transfer attributes:
                var _text = $(option).text(),
                    _value = typeof $(option).attr("value") !== "undefined" ? $(option).attr("value") : _text,
                    _classes = typeof $(option).attr("data-classes") !== "undefined" ? "class='"+$(option).attr("data-classes")+"'" : "",
                    _selected = typeof $(option).attr("selected") !== "undefined" ? "data-selected='selected'" : "";

                // calculate & cache currentSelectionIndex for this dropdown
                plugin._data(selector, "currentSelectionIndex", Math.max( $(selector).find("."+ _prefix +"-custom-menu").find("li[data-selected]").index(), 0 ) );

                // create & append <li> for current <option>
                $(selector).find("."+ _prefix +"-custom-menu").find("ul").append("<li data-value='"+_value+"' "+_selected+" "+_classes+">"+_text+"</li>");

            });

            // if there wasn't a selected="selected" option create set those attribute on 1st <li>
            if (plugin._data(selector, "currentSelectionIndex") === 0) {
                $(selector).find("."+ _prefix +"-custom-menu").find("li").eq(0).attr("data-selected", "selected");
            }

            // for dropdowns that are constrained to a certain height base on maxItems to display:
            if (plugin.option(selector, "maxItems")) {

                // calculate <li> height
                plugin._data(selector, "item_height", $(selector).find("."+ _prefix +"-custom-menu").find("li").outerHeight() );

                // calculate overall "allowed height": (maxItems * item_height)
                plugin._data(selector, "restricted_height", plugin.option(selector, "maxItems") * plugin._data(selector, "item_height") );

                // apply restricted height
                $(selector).find("."+ _prefix +"-custom-menu").outerHeight( plugin._data(selector, "restricted_height") + "px").css({"overflow-y":"scroll"});
            }

            // add click events to custom UI
            $(selector).find("li").on("click", function() {

                var $menu_item = $(this);

                // update data-selected
                $(selector).find("."+ _prefix +"-custom-menu").find("li").removeAttr("data-selected");
                $menu_item.attr("data-selected", "selected");

                // set original select's value & trigger change event:
                $(selector).find("select").val( $menu_item.data("value") ).attr("selected","selected").trigger("change");

                // track index of currently selected item
                plugin._data(selector, "currentSelectionIndex", $(selector).find("."+ _prefix +"-custom-menu").find("li[data-selected]").index() );

                // after a selection close the dropdown
                plugin.closeCustomSelects();

                if (DEBUG) {
                    console.log("menu item clicked", $menu_item.data("value"), plugin._data(selector, "currentSelectionIndex") );
                }

            });

            /*
            **  examples of 'helper functions' ... note: they're public
            **
            */

            plugin.not_open = function(selector, selectorIndex){

                var plugin = this;

                // return true if the select doesn't have either open or openUpward classes
                return $(selector+".bsp-select-item-" + selectorIndex).hasClass( plugin._data(selector, "_open") ) ? false : true;

            };

            plugin.selectOption = function(selector){

                var plugin = this;

                if (DEBUG) {
                    console.log("selectOption", $(selector).find("li[data-selected]"));
                }

                // if selectOption was the result of autoSuggest reset that
                window.bsp_select_cache.suggestion = "";

                $(selector).find("li[data-selected]").trigger("click");

            };

            plugin.focusOnOption = function(selector){

                var plugin = this;

                var _index = plugin._data(selector, "currentSelectionIndex");

                var _max = plugin.option(selector, "maxItems");

                var _prefix = plugin.option(selector, "prefix");

                plugin.unhighlightMatchingOptions(selector);

                $(selector).find("li").removeAttr("data-selected");
                $(selector).find("li").eq( _index ).attr("data-selected", "selected");

                // handle options that are not visible in the dropdown
                if (_max !== null) {

                    var adjust_top;

                    if (_index + 1 > _max) {
                        adjust_top = (_index + 1 - _max) * plugin._data(selector, "item_height");
                        adjust_top = "-" + adjust_top + "px";
                    } else {
                        adjust_top = "0px";
                    }

                    $(selector).find("."+ _prefix +"-custom-menu").find("ul").css({"top": adjust_top });
                }

            };

            plugin.focusOnPreviousOption = function(selector){

                var plugin = this;

                var _index = plugin._data(selector, "currentSelectionIndex");

                plugin._data(selector, "currentSelectionIndex", Math.max(_index - 1, 0) );

                plugin.focusOnOption(selector);

            };

            plugin.focusOnNextOption = function(selector){

                var plugin = this;

                var _index = plugin._data(selector, "currentSelectionIndex");

                plugin._data(selector, "currentSelectionIndex", Math.min(_index + 1, $(selector).find("li").length - 1) );

                plugin.focusOnOption(selector);

            };

            plugin.highlightMatchingOptions = function(selector){

                var plugin = this;

                var suggestion = window.bsp_select_cache.suggestion;

                $(selector).find("li").each(function() {

                    var $this = $(this);

                    var _text = $this.text();

                    var _match = _text.substr(0, suggestion.length);

                    if (_text.toLowerCase().startsWith( suggestion ) ) {

                        _text = _text.replace( _match, "<u>"+ _match +"</u>" );

                        $this.html( _text );

                    }

                });

            };

            plugin.unhighlightMatchingOptions = function(selector){

                var plugin = this;

                $(selector).find("li").each(function() {
                    // strip html
                    $(this).html( $(this).text() );
                });

            };

            plugin.autoSuggest = function(character, selector){

                // for delete key
                if (typeof selector === "undefined") {

                    character = selector;

                // for 'normal' autoSuggest w/ new characters being added
                } else {

                    // append additional characters to the suggestion that's cached globally
                    window.bsp_select_cache.suggestion += character;

                }

                // create a local copy, for conveience
                var suggestion = window.bsp_select_cache.suggestion;

                // cap the length of a suggestion to 12 characters
                if (suggestion.length > 12) {
                    return false;
                }

                var plugin = this;

                // could just use i in the .each below ...
                var matchingItemIndex;

                // loop over all the <options> & quit when the suggestion matches
                // the first set of characters in an option ...
                $(selector).find("li").each(function(i) {

                    var _text = $(this).text();

                    if ( _text.toLowerCase().startsWith(suggestion) ) {

                        matchingItemIndex = i;

                        plugin._data(selector, "currentSelectionIndex", matchingItemIndex );

                        plugin.focusOnOption(selector);

                        plugin.highlightMatchingOptions(selector);

                        return false;

                    }

                });

            };

            plugin.closeCustomSelects = function(){

                // register all lists as closed
                window.bsp_select_cache.selector_currently_opened = null;

                // reset autoSuggest
                window.bsp_select_cache.suggestion = "";

                var plugin = this;

                // this is the only call that doesn't need an instance specific
                // selector since we're closing all instances
                var selector = ".bsp-select-item";

                $(selector)
                    .removeClass( plugin.option(selector, "openClassName") )
                    .removeClass( plugin.option(selector, "openUpwardClassName") )
                    .removeClass( plugin.option(selector, "icons_close") )
                    .addClass( plugin.option(selector, "icons_open") );

            };

            plugin.toggleCustomSelect = function(selector, selectorIndex){

                var plugin = this;

                var _prefix = plugin.option(selector, "prefix");

                event.preventDefault();

                // reset autoSuggest
                window.bsp_select_cache.suggestion = "";
                plugin.unhighlightMatchingOptions(selector);

                // if the dropdown needs to open
                if (plugin.not_open(selector, selectorIndex)) {

                    // close open dropdowns
                    $(document).trigger("click");

                    event.stopPropagation();

                    // register this list as opened globally
                    window.bsp_select_cache.selector_currently_opened = selector+".bsp-select-item-" + selectorIndex;

                    // store the original option's index selected so that escape can restore this
                    window.bsp_select_cache.original_option = plugin._data(selector, "currentSelectionIndex");

                    // open this one
                    $(window.bsp_select_cache.selector_currently_opened)
                        .addClass( plugin._data(selector, "_open") )
                        .removeClass( plugin.option(selector, "icons_open") )
                        .addClass( plugin.option(selector, "icons_close") );

                // if the dropdown needs to close
                } else {

                    // close open dropdowns
                    $(document).trigger("click");

                }

                // if the dropdown needs to open upward
                if ($(window.bsp_select_cache.selector_currently_opened).hasClass( plugin.option(selector, "openUpwardClassName") ) ) {

                    // set top to -height
                    $(window.bsp_select_cache.selector_currently_opened)
                        .find("."+ _prefix +"-custom-menu")
                        .css({"top": "-" + $(window.bsp_select_cache.selector_currently_opened).find("."+ _prefix +"-custom-menu").height() + "px" });

                }

            };

        },

        '_all': function(selector) {

            /*
            **  _each finished (or was skipped if not defined as part of this plugin)
            **
            **  _all runs once per each instantiation, e.g. bsp_select.live( document, "some jQuery selector", { ... some options ... } );
            **
            **  it's similar to _init but trails iterative tasks executed in _each
            **
            **  when _all completes, thaaat's all
            **
            **  ... but keep in mind by using .live anytime that "some jQuery selector" is inserted in to the DOM
            **  the cycle of _init, _each, _all is kicked off again
            */

            var plugin = this;

            var DEBUG = plugin.option(selector, 'debug');

            /*
            **  examples of public methods
            **
            */

            plugin.add = function(_text, _value, selector){

                var plugin = this;

                // only 2 args were passed in ...
                if (typeof selector === "undefined") {
                    selector = _value;
                    _value = _text;
                }

                var _prefix = plugin.option(selector, "prefix");

                // for "no value" options
                if (typeof _value === "undefined") {
                    _value = _text;
                }

                $(selector).find("."+ _prefix +"-custom-menu")
                    .find("ul")
                    .append("<li data-value='"+_value+"'>"+_text+"</li>");

                $(selector).find("."+ _prefix +"-custom-menu")
                    .find("li[data-value='"+_value+"']")
                    .on("click", function() {

                        var $menu_item = $(this);

                        // set original select's value & trigger change event:
                        $(selector).find("select").val( $menu_item.data("value") ).trigger("change");

                        if (DEBUG) {
                            console.log("menu item clicked", $(selector).find("select").data("value") );
                        }

                    });

                $(selector).find("select").append("<option value='"+_value+"'>"+_text+"</option>");

            };

            plugin.addOptions = function(options_element_map, selector){

                var plugin = this;

                $(options_element_map).each(function(i, option) {
                    plugin.add(option._text, option._value, selector);
                });

            };

            plugin.replaceOptions = function(options_element_map, selector){

                var plugin = this;

                var _prefix = plugin.option(selector, "prefix");

                $(selector).find("."+ _prefix +"-custom-menu").find("ul").empty();
                $(selector).find("select").empty();

                plugin.addOptions(options_element_map, selector);

            };

        }

    });
});

