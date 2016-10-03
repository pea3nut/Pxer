/*
 *  jQuery Scoped CSS plugin
 *  This adds support for the CSS scoped attribute to limit a block of style declarations
 *  to a specific area of the HTML. You can also use @import and media filters in scoped blocks
 *  http://www.w3.org/TR/html5/semantics.html#the-style-element
 *
 *  Simon Madine, 1 February 2011
 *
 *  Use:
 *  Include this plugin file (minified, ideally) and call $.scoped() on load
 *
 *  Limitations:
 *  - If you're using multiple nested declarations, Webkit might apply different inheritance
 *    specificity rules from the other engines. I don't know who's right.
 *  - Sometimes there are delays parsing externally loaded stylesheets (via @import) and they
 *    might get skipped. Not often but it happens.
 *
 *  Notes:
 *  - If the browser natively supports <style scoped>, this will return without doing anything
 *  - Style elements really shouldn't have classes added to them. This functionality should
 *    probably use some kind of data attribute.
 *  - Currently, getElementStyles is hand-rolled and probably wrong.
 *
 *  v0.6 2013-04-08
 *  Removed $.browser requirement and refactored a bit so it runs slightly faster and works with
 *  jQuery 1.9. Also checks for native scoped style support and exits early if available.
 *
 *  v0.5 2011-01-30
 *  Sibling blocks work, most nested blocks work but some oddness in Webkit means that some
 *  styles don't inherit correctly when there are multiple nested declarations.
 *
 *  v0.4 2011-01-29
 *  First jQuery plugin version. Works for most cases but gets confused when there are
 *  multiple scoped blocks affecting the same context (siblings).
 *
 */
(function($) {
  "use strict";
  //Add this to the global jQuery object as we want to apply this once to the entire document
  $.scoped = function() {
    if ('scoped' in document.createElement('style')) {
      return;
    }

    // To detect which method to use when setting styles
    // IE9 pretends to use setProperty but doesn't
    var styleSettable = true;
    try {
      document.createElement("div").style.setProperty("opacity", 0, "");
    } catch (error) {
      styleSettable = false;
    }

    scopedReset();

    //Backup the original styles
    backupBlocks();

    //Go through once to add dependencies
    var $style = $('style');
    $style.each(function(index) {
      var $this = $(this);
      if (isScoped($this)) {
        $this.addClass('this_is_' + index);

        //Get all style blocks in this scope
        //Including nested blocks
        $this.parent().find('style').each(function() {
          //Add a dependency class here to check for later
          $(this).addClass('depends_on_' + index);
        });
      }
    });

    //Go through a second time to process the scopes
    $style.each(function() {
      var $this = $(this);
      if (isScoped($this)) {

        //Empty all scoped style blocks
        //Except those that this context is dependant on
        emptyBlocks($this);

        var holdingArea = [];

        //Read all styles and copy them to a holding area
        var $parent = $this.parent(),
          $all = $parent.find('*');
        $all.add($parent).each(function() {
          $(this).css('cssText', '');
          if (this.nodeName !== 'STYLE') {
            holdingArea.push(getStylesText(this));
          }
        });

        //Copy all the styles back from the holding area onto the in-scope elements
        $all.add($parent).each(function() {
          var this_style, n;
          if (this.nodeName !== 'STYLE') {

            if (!$(this).data('originalInline')) {
              $(this).data('originalInline', $(this).attr('style'));
            }


            this_style = holdingArea.shift();

            if (typeof this_style === 'string') {
              // Webkit, Gecko
              $(this).css('cssText', this_style);
            } else {
              if (styleSettable) {
                // Opera
                for (n in this_style) {
                  if (n !== 'content' || this_style[n] !== 'none') {
                    try {
                      this.style.setProperty(n, this_style[n]);
                    } catch (err) {}
                  }
                }
              } else {
                // IE
                for (n in this_style) {
                  try {
                    if (this && this.style && n && this_style[n] && n !== '' && this_style[n] !== '') {
                      this.style[n] = this_style[n];
                    }
                  } catch (err) {}
                }
              }
            }
          }
        });

        //Put all other style blocks back
        fillBlocks();
      }
    });

    //Measurements done and styles applied, now clear styles from this style block
    //This will stop them affecting out-of-scope elements
    $('style').each(function(i, e) {
      if (isScoped(e)) {
        try {
          e.innerHTML = '';
        } catch (error) {
          $(e).attr('disabled', 'disabled');
        }
      }
    });

    //Standard jQuery attribute selector $('style[scoped]') doesn't
    //work with empty boolean attributes so this is used instead

    function isScoped(styleBlock) {
      return ($(styleBlock).attr('scoped') !== undefined);
    }

    //Save all style tag contents to a data object

    function backupBlocks() {
      $('style').each(function(i, e) {
        if (isScoped(e)) {
          var $e = $(e);
          $e.data('original-style', $e.html());
        }
      });
    }

    //Each style block now has class="depends_on_1 depends_on_2"
    //We switch off all the scoped style blocks not mentioned in that list
    //The disabled attribute only works on IE but coincidentally,
    //IE doesn't allow .html() on style blocks.

    function emptyBlocks(currentBlock) {
      $('style').each(function(i, e) {
        if (isScoped(e)) {
          if (!currentBlock.hasClass('depends_on_' + i)) {
            try {
              e.innerHTML = '';
            } catch (error) {
              $(e).attr('disabled', 'disabled');
            }
          }
        }
      });
    }

    //Put all the styles back to reset for the next loop

    function fillBlocks() {
      $('style').each(function(i, e) {
        var $e = $(e);
        if (isScoped(e)) {
          try {
            e.innerHTML = $e.data('original-style');
          } catch (error) {
            $(this).removeAttr('disabled');
          }
        }
      });
    }

    //Update this bit with some jQuery magic later

    function getStylesText(element) {
      var temp, styles, n, key;

      if (element.currentStyle) {
        //We work with a style object in IE and Opera rather than the text
        sleep(50); //50ms delay to allow for external stylesheet parsing.
        return element.currentStyle;
      }

      //We extract and process the ComputedCSSStyleObject into text
      temp = document.defaultView.getComputedStyle(element, null);
      styles = '';
      for (n in temp) {
        if (parseInt(n, 10)) {
          key = camelize(temp[n]);
          if (temp[key] !== undefined) {
            styles += temp[n] + ':' + temp[key] + ';\n';
          }
        }
      }
      return styles;
    }

    function scopedReset() {
      var $style = $('style');
      $style.each(function(i, styleBlock) {
        var $styleBlock = $(styleBlock);
        var $parent = $(this).parent(),
          $all = $parent.find('*');

        $all.add($parent).each(function() {
          var $this = $(this);
          if (this.nodeName !== 'STYLE') {
            if ($this.data('scopedprocessed')) {
              $this.attr('style', $this.data('originalInline') || '');
              $this.data('scopedprocessed', true);
            }
          }
        });

        if (($styleBlock.attr('scoped') !== undefined)) {
          try {
            if ($styleBlock.data('scopedprocessed')) {
              this.innerHTML = $styleBlock.data('original-style');
            }
          } catch (error) {
            $styleBlock.removeAttr('disabled');
          }
          $styleBlock.data('scopedprocessed', true);
        }


      });
    }

    //from Prototype

    function camelize(string) {
      return string.replace(/-+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    }

    function sleep(ms) {
      var dt = new Date();
      dt.setTime(dt.getTime() + ms);
      while (new Date().getTime() < dt.getTime()) {
        $.noop();
      }
    }

  };
})(jQuery);