
# bsp_select bsp utility

... `index.html` is a working demo; so look at that, first.

CSS provided has optional rules & required rules (this needs to be specified).

------------------------------------------------------------------------------------------------------------------------------

## Getting started

Look at the HTML & CSS & JS ...

This is the most basic implementation:

    bsp_select.live(document, ".custom-select");

Where, independently, you might attach change event(s) to your &lt;select&gt;, for example:

    $(document).on("change", "select", function() {
        console.log( "this select changed:", $(this).val() );
    });

... that change event will get copied to the custom ui.

Modifying the look & feel just requires updating some vars in bsp-select.less (or maybe bsp-select.css).

Other dependencies include jQuery 1.7 or greater & the core bsp-utils.js file (see the bower.json file included).


------------------------------------------------------------------------------------------------------------------------------

## Options (where these are the defaults)

        {
            debug: false,
            icons: {
                "open":  "fa-chevron-down",
                "close": "fa-chevron-up"
            },
            maxItems: null,
            openClassName: "open",
            openUpwardClassName: "open-upward",
            forceUpward: false
        }

"open" & "close" are for CSS classNames that get used to indicate the open or closed state of the dropdown.

"maxItems" is useful for constraining the dropdown's height when there are a ton of &lt;option&gt; elements, this requires applying a `height` or `min-height` to &lt;option&gt; elements in the CSS/Less.

The sample files & default options use classes that correspond to Font Awesome.

------------------------------------------------------------------------------------------------------------------------------

## Methods

[[IMPORTANT: these are future features / works in progress]]

### .add

There are also some public methods you can access, for example to be able to add arbitrary &lt;option&gt;s, use the `.add` method:

    var $customSelectAdderDemo = $(".custom-select-adder-demo").customSelect().data("customSelect");

    $customSelectAdderDemo.add( "some text", "some-value" );

(The value argument, the 2nd one, is optional, just like the value attribute on an &lt;option&gt; element.)

### .replaceOptions

To be able to replace all &lt;option&gt;s, use the `.replaceOptions` method:

    var $customSelectReplaceDemo = $(".custom-select-replace-demo").customSelect().data("customSelect");

    $customSelectReplaceDemo.replaceOptions(
        [{
            "_value" : "America/Puerto_Rico",
            "_text"  : "Puerto Rico (Atlantic)"
        }, {
            "_value" : "Pacific/Honolulu",
            "_text"  : "Honolulu (Hawaii)"
        }]
    );

### .addOptions

In the previous example, you could append a set of options by calling `addOptions` instead of `replaceOptions`.

------------------------------------------------------------------------------------------------------------------------------

