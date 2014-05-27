
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

                base.$menu_list.find("ul").append("<li data-value='"+_value+"' "+_selected+">"+_text+"</li>");

            });

            if (base.options.maxItems) {

                var restricted_height = base.options.maxItems * parseInt(base.$menu_list.find("li").height(), 10);

                base.$menu_list.height(restricted_height + "px").css({"overflow-y":"scroll"});

            }

            base.$el.find("li").on("click", function() {

                var $menu_item = $(this);

                // update data-selected
                base.$menu_list.find("li").removeAttr("data-selected");
                $menu_item.attr("data-selected", "selected")

                // set original select's value & trigger change event:
                base.$select.val( $menu_item.data("value") ).attr("selected","selected").trigger("change");

                if (base.options.debug) {
                    console.log("menu item clicked", $menu_item.data("value") );
                }

            });

        };

        base.selectPreviousOption = function(){

            if (! base.$el.hasClass( base.options._open )) return false;

            console.log("selectPreviousOption");

        };

        base.selectNextOption = function(){

            if (! base.$el.hasClass( base.options._open )) return false;

            console.log("selectNextOption");

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
            if (! base.$el.hasClass( base.options._open )) {

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
                .keydown(function(event) {

                    var key = event.which, _up = _down = _escape = _enter = false;

                    if (!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {

                        if (key == 38) {
                            _up = true;

                            base.selectPreviousOption();

                            return false;
                        }

                        if (key == 40) {
                            _down = true;

                            base.selectNextOption();

                            return false;
                        }

                        if (key == 27) {
                            _escape = true;

                            // should this revert to the originally selected option???

                            // close this select, aka close them all
                            base.closeCustomSelects();

                            return false;
                        }

                        if (key == 13) {
                            _enter = true;

                            // close this select, aka close them all
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

