
// custom-select jQuery plugin

(function($){

    var customSelect = function(element, options){

        var base = this;

        base.$el = $(element);
        base.el = element;

        base.$select = base.$el.find("select");
        base.$options = base.$el.find("option");

        base.defaultOptions = {

            debug: false,

            prefix: "custom-select-",

            icons: {
                "open":  "fa-chevron-down",
                "close": "fa-chevron-up"
            },

            // if set, once maxItems is exceeded scrolling kicks in
            maxItems: null,

            openClassName: "open",
            openUpwardClassName: "open-upward",
            forceUpward: false

        };

        base.init = function() {

            // skip mobile browsers using this: http://detectmobilebrowser.com/
            if (typeof jQuery.browser !== "undefined" &&
                typeof jQuery.browser.mobile !== "undefined" &&
                jQuery.browser.mobile) {
                return false;
            }

            // skip IE8 & older, this looks exactly until <selevct> is clicked
            // which for IE8 & older just displays the browser default <option> menu
            if (document.all && !document.addEventListener) {
                return false;
            }

            base.options = $.extend({}, base.defaultOptions, options);

            // _open is an "alias" to open or openUpward
            base.options._open = (base.options.forceUpward ? base.options.openUpwardClassName : base.options.openClassName);

            base.$el.append("<div class='"+base.options.prefix+"custom-menu'><ul></ul></div>");
            base.$menu_list = base.$el.find("."+base.options.prefix+"custom-menu");

            base.$el.on("click", function(event) {
                event.stopPropagation();
                event.preventDefault();
            });

            base.$select.on("focus mousedown", function(event) {
                base.toggleCustomSelect();
            });

            base.$options.each(function(i, option) {

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

                base.currentSelectionIndex = base.$menu_list.find("li[data-selected]").index() || 0;

                base.$menu_list.find("ul").append("<li data-value='"+_value+"' "+_selected+">"+_text+"</li>");

            });

            if (base.currentSelectionIndex === 0) {
                base.$menu_list.find("li").eq(0).attr("data-selected", "selected");
            }

            if (base.options.maxItems) {

                base.item_height =  base.$menu_list.find("li").outerHeight();

                base.restricted_height = base.options.maxItems * base.item_height;

                base.$menu_list.height(base.restricted_height + "px").css({"overflow-y":"scroll"});

                // base.restricted_height += parseInt(base.$menu_list.css("border-width"), 10);
                // //base.restricted_height += parseInt(base.$menu_list.css("border-width-bottom"), 10);

                // console.log("base.restricted_height", base.restricted_height);

            }

            base.$el.find("li").on("click", function() {

                var $menu_item = $(this);

                // update data-selected
                base.$menu_list.find("li").removeAttr("data-selected");

                $menu_item.attr("data-selected", "selected");

                // set original select's value & trigger change event:
                base.$select.val( $menu_item.data("value") ).attr("selected","selected").trigger("change");

                // track index of currently selected item
                base.currentSelectionIndex = base.$menu_list.find("li[data-selected]").index();

                // after a selection close the dropdown
                base.closeCustomSelects();

                if (base.options.debug) {
                    console.log("menu item clicked", $menu_item.data("value"), base.currentSelectionIndex );
                }

            });

        };

        base.not_open = function() {
            // return true if the select doesn't have either open or openUpward classes
            return base.$el.hasClass( base.options._open ) ? false : true;
        }

        base.selectOption = function(){

            if (base.not_open()) {
                return false;
            }

            base.$el.find("li[data-selected]").trigger("click");

        };

        base.highlightOption = function(_index){

            if (base.not_open()) {
                return false;
            }

            base.$el.find("li").removeAttr("data-selected");
            base.$el.find("li").eq( _index ).attr("data-selected", "selected");

            // handle options that are not visible in the dropdown
            if (base.options.maxItems !== null) {
                if (base.currentSelectionIndex + 1 > base.options.maxItems) {
                    var adjust_top = (base.currentSelectionIndex + 1 - base.options.maxItems) * base.item_height;
                    adjust_top = "-" + adjust_top + "px";
                } else {
                    adjust_top = "0px";
                }
                base.$menu_list.find("ul").css({"top": adjust_top });
            }

        };

        base.highlightPreviousOption = function(){

            if (base.not_open()) {
                return false;
            }

            base.currentSelectionIndex = Math.max(base.currentSelectionIndex - 1, 0);

            base.highlightOption( base.currentSelectionIndex );

        };

        base.highlightNextOption = function(){

            if (base.not_open()) {
                return false;
            }

            base.currentSelectionIndex = Math.min(base.currentSelectionIndex + 1, base.$el.find("li").length - 1);

            base.highlightOption( base.currentSelectionIndex );

        };

        base.closeCustomSelects = function(){

            $(base.el)
                .removeClass( base.options._open )
                .addClass( base.options.icons.open )
                .removeClass( base.options.icons.close );

        };

        base.toggleCustomSelect = function(){

            event.preventDefault();

            // if the dropdown needs to open
            if (base.not_open()) {

                $(document).trigger("click");

                event.stopPropagation();

                base.$el
                    .addClass( base.options._open )
                    .removeClass( base.options.icons.open )
                    .addClass( base.options.icons.close );

            // if the dropdown needs to close
            } else {

                base.closeCustomSelects();

            }

            // if the dropdown needs to open upward
            if (base.$el.hasClass(base.options.openUpwardClassName)) {
                base.$menu_list.css({"top": "-" + base.$menu_list.height() + "px" });
            }

        };

        base.add = function(_text, _value){

            // for "no value" options
            if (typeof _value === "undefined") {
                _value = _text;
            }

            base.$menu_list
                .find("ul")
                .append("<li data-value='"+_value+"'>"+_text+"</li>");

            base.$menu_list
                .find("li[data-value='"+_value+"']")
                .on("click", function() {

                    var $menu_item = $(this);

                    // set original select's value & trigger change event:
                    base.$el.find("select")
                        .val( $menu_item.data("value") ).trigger("change");

                    if (base.options.debug) {
                        console.log("menu item clicked", base.$el.find("select").data("value") );
                    }

                });

            base.$select
                .append("<option value='"+_value+"'>"+_text+"</option>");

        };

        base.addOptions = function(options_element_map){

            $(options_element_map).each(function(i, option) {
                base.add(option._text, option._value);
            });

        };

        base.replaceOptions = function(options_element_map){

            base.$menu_list.find("ul").empty();
            base.$select.empty();

            base.addOptions(options_element_map);

        };

        base.init();

        // js that needs to run once

            // dismiss select on "blur"
            $(document)
                .on("click", function() {

                    // close them all
                    base.closeCustomSelects();

                })
                .on("keydown", function(event) {

                    var key = event.which;

                    if (!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {

                        // UP ARROW
                        if (key == 38) {

                            base.highlightPreviousOption();

                            return false;
                        }

                        // DOWN ARROW
                        if (key == 40) {

                            base.highlightNextOption();

                            return false;
                        }

                        // ESCAPE
                        if (key == 27) {

                            // close select(s)
                            base.closeCustomSelects();

                            return false;
                        }

                        // ENTER
                        if (key == 13) {

                            // select highlighted option
                            base.selectOption();

                            // close select(s)
                            base.closeCustomSelects();

                            return false;
                        }

                    }

                    return true;
                });

    };

    $.fn.customSelect = function(options){
        return this.each(function(){

            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('customSelect')) return;

            // pass options to plugin constructor
            var customselect = new customSelect(this, options);

            // Store plugin object in this element's data
            element.data('customSelect', customselect);

        });
    };

})(jQuery);

