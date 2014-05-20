
# custom-select bsp utility

... `custom-select.html` is a working demo; so look at that, first.

CSS provided has optional rules & required rules (this needs to be specified).

------------------------------------------------------------------------------------------------------------------------------

## Getting started

Look at the HTML & CSS & JS ...

This is the most basic implementation:

    $(".custom-select").customSelect();

Modifying the look & feel just requires updating some vars in custom-select.less

------------------------------------------------------------------------------------------------------------------------------

## Options

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

The sample files use classes that correspond to Font Awesome.

------------------------------------------------------------------------------------------------------------------------------

## Methods

### .add

There are also some public methods you can access, for example to be able to add arbitrary <option>s, use the `.add` method:

    var $customSelectAdderDemo = $(".custom-select-adder-demo").customSelect().data("customSelect");

    $customSelectAdderDemo.add( "some text", "some-value" );
    
(The value argument, the 2nd one, is optional, just like the value attribute on an <option> element.)

### .replaceOptions

To be able to replace all <option>s, use the `.replaceOptions` method:

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

