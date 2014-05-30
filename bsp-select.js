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
            'prefix': "custom-select-",
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

                    var selector = window.bsp_select_currently_opened;

                    if (!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {

                        // UP ARROW
                        if (key === 38) {
                            plugin.highlightPreviousOption(selector);
                            return false;
                        }

                        // DOWN ARROW
                        if (key === 40) {
                            plugin.highlightNextOption(selector);
                            return false;
                        }

                        // ESCAPE
                        if (key === 27) {
                            // close select(s)
                            plugin.closeCustomSelects();
                            return false;
                        }

                        // ENTER
                        if (key === 13) {
                            // select highlighted option
                            plugin.selectOption(selector);
                            // close select(s)
                            plugin.closeCustomSelects();
                            return false;
                        }

                    }

                    return true;
                });

        },

        '_init': function(context, selector) {

            /*
            **  _install finished (or was skipped if not defined as part of this plugin)
            **
            **  _init runs once per each instantiation, e.g. bsp_select.live( document, "some jQuery selector", { ... some options ... } );
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
                plugin.toggleCustomSelect(selector);
            });

            // register all lists as closed
            window.bsp_select_currently_opened = null;

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

            /*
            **  IMPORTANT:
            **
            **  plugin._data is a wrapper for jQuery.data
            **
            **  this is a convenient way to cache or store values specific to each instance (or instantiation)
            **
            */

            // _open is an "alias" to open or openUpward
            plugin._data(selector, "_open", plugin.option(selector, "forceUpward") ? plugin.option(selector, "openUpwardClassName") : plugin.option(selector, "openClassName") );

            if (DEBUG) {
                console.log( "_init plugin", plugin, "selector", selector, "options", plugin.option(selector) );
            }

            // create HTML container for custom UI
            $(selector).append("<div class='"+ plugin.option(selector, "prefix") +"custom-menu'><ul></ul></div>");

            // get all the <option>s
            $(selector).find("option").each(function(i, option) {

                // convert <option> to <li>

                // transfer attributes:

                var _text = $(option).text(),
                    _value = $(option).attr("value"),
                    _selected = $(option).attr("selected");

                // for "no value" options
                if (typeof _value === "undefined") {
                    _value = _text;
                }

                // for "selected" options
                if (typeof _selected !== "undefined") {
                    _selected = "data-selected='selected'";
                } else {
                    _selected = "";
                }

                // calculate & cache currentSelectionIndex for this dropdown
                plugin._data(selector, "currentSelectionIndex", Math.max( $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("li[data-selected]").index(), 0 ) );

                // create & append <li> for current <option>
                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("ul").append("<li data-value='"+_value+"' "+_selected+">"+_text+"</li>");

            });

            // if there wasn't a selected="selected" option create set those attribute on 1st <li>
            if (plugin._data(selector, "currentSelectionIndex") === 0) {
                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("li").eq(0).attr("data-selected", "selected");
            }

            // for dropdowns that are constrained to a certain height base on maxItems to display:
            if (plugin.option(selector, "maxItems")) {

                // calculate <li> height
                plugin._data(selector, "item_height", $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("li").outerHeight() );

                // calculate overall "allowed height": (maxItems * item_height)
                plugin._data(selector, "restricted_height", plugin.option(selector, "maxItems") * plugin._data(selector, "item_height") );

                // apply restricted height
                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").height( plugin._data(selector, "restricted_height") + "px").css({"overflow-y":"scroll"});
            }

            // add click events to custom UI
            $(selector).find("li").on("click", function() {

                var $menu_item = $(this);

                // update data-selected
                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("li").removeAttr("data-selected");
                $menu_item.attr("data-selected", "selected");

                // set original select's value & trigger change event:
                $(selector).find("select").val( $menu_item.data("value") ).attr("selected","selected").trigger("change");

                // track index of currently selected item
                plugin._data(selector, "currentSelectionIndex", $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("li[data-selected]").index() );

                // after a selection close the dropdown
                plugin.closeCustomSelects();

                if (DEBUG) {
                    console.log("menu item clicked", $menu_item.data("value"), plugin._data(selector, "currentSelectionIndex") );
                }

            });

            /*
            **  examples of helper functions ...
            **
            **  IMPORTANT: .add, .addOptions, .replaceOptions don't work yet & are intended to be public method eventually
            **
            */

            plugin.not_open = function(selector){

                var plugin = this;

                // return true if the select doesn't have either open or openUpward classes
                return $(selector).hasClass( plugin._data(selector, "_open") ) ? false : true;

            };

            plugin.selectOption = function(selector){

                // var selector = window.bsp_select_currently_opened;

                var plugin = this;

                if (DEBUG) {
                    console.log("selectOption", $(selector).find("li[data-selected]"));
                }

                $(selector).find("li[data-selected]").trigger("click");

            };

            plugin.highlightOption = function(selector){

                // var selector = window.bsp_select_currently_opened;

                var plugin = this;

                var _index = plugin._data(selector, "currentSelectionIndex");

                $(selector).find("li").removeAttr("data-selected");
                $(selector).find("li").eq( _index ).attr("data-selected", "selected");

                // handle options that are not visible in the dropdown
                if (plugin.option(selector, "maxItems") !== null) {

                    var adjust_top;

                    if (_index + 1 > plugin.option(selector, "maxItems")) {
                        adjust_top = (_index + 1 - plugin.option(selector, "maxItems")) * plugin._data(selector, "item_height");
                        adjust_top = "-" + adjust_top + "px";
                    } else {
                        adjust_top = "0px";
                    }

                    $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("ul").css({"top": adjust_top });
                }

            };

            plugin.highlightPreviousOption = function(selector){

                // var selector = window.bsp_select_currently_opened;

                var plugin = this;

                var _index = plugin._data(selector, "currentSelectionIndex");

                plugin._data(selector, "currentSelectionIndex", Math.max(_index - 1, 0) );

                plugin.highlightOption(selector);

            };

            plugin.highlightNextOption = function(selector){

                //var selector = window.bsp_select_currently_opened;

                var plugin = this;

                var _index = plugin._data(selector, "currentSelectionIndex");

                plugin._data(selector, "currentSelectionIndex", Math.min(_index + 1, $(selector).find("li").length - 1) );

                plugin.highlightOption(selector);

            };

            plugin.closeCustomSelects = function(){

                // register all lists as closed
                window.bsp_select_currently_opened = null;

                var plugin = this;

                // this is the only call that doesn't need an instance specific
                // selector since we're working against all instances
                var selector = ".bsp-select-item";

                $(selector)
                    .removeClass( plugin.option(selector, "openClassName") )
                    .removeClass( plugin.option(selector, "openUpwardClassName") )
                    .removeClass( plugin.option(selector, "icons_close") )
                    .addClass( plugin.option(selector, "icons_open") );

            };

            plugin.toggleCustomSelect = function(selector){

                var plugin = this;

                event.preventDefault();

                // if the dropdown needs to open
                if (plugin.not_open(selector)) {

                    // close open dropdowns
                    $(document).trigger("click");

                    event.stopPropagation();

                    // register this list as opened globally
                    window.bsp_select_currently_opened = selector;

                    // open this one
                    $(selector)
                        .addClass( plugin._data(selector, "_open") )
                        .removeClass( plugin.option(selector, "icons_open") )
                        .addClass( plugin.option(selector, "icons_close") );

                // if the dropdown needs to close
                } else {

                    // close open dropdowns
                    $(document).trigger("click");

                }

                // if the dropdown needs to open upward
                if ($(selector).hasClass( plugin.option(selector, "openUpwardClassName") ) ) {

                    // set top to -height
                    $(selector)
                        .find("."+ plugin.option(selector, "prefix") +"custom-menu")
                        .css({"top": "-" + $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").height() + "px" });

                }

            };

            plugin.add = function(_text, _value, selector){

                var plugin = this;

                // for "no value" options
                if (typeof _value === "undefined") {
                    _value = _text;
                }

                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu")
                    .find("ul")
                    .append("<li data-value='"+_value+"'>"+_text+"</li>");

                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu")
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

                $(selector).find("."+ plugin.option(selector, "prefix") +"custom-menu").find("ul").empty();
                $(selector).find("select").empty();

                plugin.addOptions(options_element_map, selector);

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

            // _all doesn't get used by this plugin (yet -- maybe)!!

        }

    });
});
