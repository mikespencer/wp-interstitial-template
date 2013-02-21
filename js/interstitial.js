(function(w, d, $, wpAd){

  'use strict';

  wpAd = wpAd || {};

  // standard vars
  var $head = $('head'),
    $body = $('body'),
    $html = $('html'),
    $window = $(w),
    default_config = {

      // REQUIRED:
      creative: null,               //String: URL to creative.
      creativeType: null,           //String: flash, image, iframe, custom.

      // OPTIONAL (with defaults):
      width: 760,                   //Number: Width of creative
      height: 425,                  //Number: Height of creative
      timeOpen: 15,                 //Number: Seconds open before auto close
      clickTrack: '',               //String: Prepended click tracker
      clickTag: '',                 //String: Clickthru URL
      pixels: false,                //Array: Impression pixel url's
      backupImage: null,            //String: Backup image URL for flash creatives
      minFlashVer: 6,               //Number: Minimum version of flash player needed for flash creatives
      customFlashVars: false,       //Object: Custom flashvars mapping
      creativeBGColor: '#fff',      //String: background color of the acutal creative
      bgcolor: '#fff',              //String: background color of the overlay
      opacity: 1,                   //Number: 0-1. Opacity of the overlay background
      shadow: true,                 //Boolean: drop shadow on the creative if the background opacity < 1
      blur: true,                   //Boolean: blur the page if background opacity < 1
      siteOverride: false,          //String: washingtonpost.com, slate.com, theroot.com. Override auto site detection
      quartileTracking: false,      //Array: For use with flash video player
      wrapperID: 'interstitial_ad', //String: ID of html wrapper
      adid: null                    //String or Number. DFP ad id reference
    };

  //add bind method if browser does not natively support it:
  if(!Function.prototype.bind)Function.prototype.bind=function(oThis){if(typeof this!=="function")throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var aArgs=Array.prototype.slice.call(arguments,1),fToBind=this,FNOP=function(){},fBound=function(){return fToBind.apply(this instanceof FNOP&&oThis?this:oThis,aArgs.concat(Array.prototype.slice.call(arguments)));};FNOP.prototype=this.prototype;fBound.prototype=new FNOP();return fBound;};

  // constructor
  function Interstitial(config){
    //override default config
    this.config = $.extend(true, default_config, config);

    this.creativeCode = this.buildCreative();
    this.$wrapper = this.buildWrapper();

    this.$counter = $('span.counter', this.$wrapper);
    this.$header = $('div.ad-interstitial-header', this.$wrapper);
    this.$intbody = $('div.ad-interstitial-body', this.$wrapper);
    this.$creativeContainer = $('div.ad-interstitial-creative-container', this.$wrapper);

    this.site = this.getSite();
    this.render();

    return this;
  }

  // get the site for displaying different headers
  Interstitial.prototype.getSite = function(){
    return this.config.siteOverride || (wpAd.constants && wpAd.constants.domain) || w.wpniDomain || 'generic';
  };

  // render the interstitial
  Interstitial.prototype.render = function(){
    this.addSiteClass().bindEvents().styleOverlay().addInterstitial().startTimer().addTracking();
  };

  // add the creative to the body
  Interstitial.prototype.addInterstitial = function(){
    $html.addClass('has-interstitial');
    $body.append(this.$wrapper);
    return this;
  };

  // returns the relevant creative code
  Interstitial.prototype.buildCreative = function(){
    if(this.config.creativeType === 'flash'){
      if(this.getFlashVer() >= this.config.minFlashVer){
        this.flashvars = this.buildFlashVars();
        return this.buildSWFCreative();
      }
      return this.buildImageCreative(this.config.backupImage);
    } else if(this.config.creativeType === 'iframe'){
      return this.buildIframeCreative();
    } else if(this.config.creativeType === 'image'){
      return this.buildImageCreative();
    } else if(this.config.creativeType === 'custom'){
      return this.config.creative;
    }
  };

  // wrapper code
  Interstitial.prototype.buildWrapper = function(){
    return $('<div id="' + this.config.wrapperID + '" class="ad-interstitial">' +
      '<div class="ad-interstitial-cover"></div>' +
      '<div class="ad-interstitial-inner">' +
        '<div class="ad-interstitial-header shadow-narrow">' +
          '<div class="ad-col ad-col-25">' +
            '<div class="ad-logo"></div>' +
          '</div>' +
          '<div class="ad-col ad-col-50">' +
            '<div class="ad-message">' +
              '<span class="bold">Advertisement | </span>' +
               'The page you requested will appear in <span class="counter">' + this.config.timeOpen + '</span> seconds' +
            '</div>' +
          '</div>' +
          '<div class="ad-img-right ad-col ad-col-25">' +
            '<div class="ad-close bold">' +
              'CLOSE [X]' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ad-interstitial-body">' +
          '<div class="ad-interstitial-creative-container">' +
            this.creativeCode +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>');
  };

  // add the site class to the wrapper to display unique headers
  Interstitial.prototype.addSiteClass = function(){
    var classes = {
      'washingtonpost.com': 'wp-int',
      'slate.com': 'slate-int',
      'theroot.com': 'root-int'
    };

    if(classes[this.site]){
      this.$wrapper.addClass(classes[this.site]);
    }

    return this;
  };

  // bind relevant events using .interstitial namespace
  // using 'bind' instead of 'on' because theroot.com uses an old jQuery version
  Interstitial.prototype.bindEvents = function(){
    $('div.ad-close', this.$wrapper).bind('click.interstitial', this.close.bind(this));
    $window.bind('resize.interstitial', this.alignMiddle.bind(this));
    return this;
  };

  // remove bound events using .interstitial namespace
  // using 'unbind' instead of 'off' because theroot.com uses an old jQuery version
  Interstitial.prototype.unbindEvents = function(){
    $('div.ad-close', this.$wrapper).unbind('.interstitial');
    $window.unbind('.interstitial');
  };

  // vertically align the creative to the middle
  Interstitial.prototype.alignMiddle = function(){
    var offset = (($window.height() - this.$header.outerHeight()) - this.config.height) / 2;
    this.$creativeContainer.css({top: (offset > 0 ? offset : 0) + 'px'});
    return this;
  };

  // additional overlay styling
  Interstitial.prototype.styleOverlay = function(){
    this.alignMiddle();
    this.$creativeContainer.css({
      width: this.config.width + 'px',
      backgroundColor: this.config.creativeBGColor
    });
    if(this.config.opacity < 1){
      if(this.config.shadow){
        this.$creativeContainer.addClass('shadow-wide');
      }
      if(this.config.blur){
        $html.addClass('interstitial-blur');
      }
    }
    $('div.ad-interstitial-cover', this.$wrapper).css({
      backgroundColor: this.config.bgcolor,
      opacity: this.config.opacity
    });
    return this;
  };

  // close/remove the interstitial
  Interstitial.prototype.close = function(){
    this.clearTimer();
    this.showFlashAds();
    $html.removeClass('has-interstitial interstitial-blur');
    this.unbindEvents();
    this.$wrapper.remove();
  };

  // iframe specific code
  Interstitial.prototype.buildIframeCreative = function(){
    return '<iframe src="' + this.config.creative + '" width="' + this.config.width + '" height="' + this.config.height + '" frameborder="0" marginheight="0" marginwidth="0" scrolling="no"></iframe>';
  };

  // generates flashvars for swfs
  Interstitial.prototype.buildFlashVars = function(){
    var vars = [];
    if(this.config.clickTag){
      vars.push('clickTag=' + this.config.clickTrack + this.config.clickTag);
    }
    if(this.config.customFlashVars){
      for(var key in this.config.customFlashVars){
        if(this.config.customFlashVars.hasOwnProperty(key)){
          vars.push(key + '=' + this.config.customFlashVars[key]);
        }
      }
    }
    if(this.config.quartileTracking){
      var i = 0, l=this.config.quartileTracking.length, s=100/l;
      for(i;i<l;i++){
        if(this.config.quartileTracking[i]){
          vars.push('track' + (s*(i+1)) + 'percent=' + encodeURIComponent(this.config.quartileTracking[i]));
        }
      }
    }
    return vars.join('&');
  };

  // swf specific code
  Interstitial.prototype.buildSWFCreative = function(){
    return '<object id="intFlashCreative" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + this.config.width + '" height="' + this.config.height + '">' +
      '<param name="movie" value="' + this.config.creative + '" />' +
      '<param name="quality" value="high" />' +
      '<param name="wmode" value="window" />' +
      '<param name="menu" value="false" />' +
      '<param name="allowfullscreen" value="false" />' +
      '<param name="allowScriptAccess" value="always" />' +
      '<param name="flashVars" value="' + this.flashvars + '" />' +
      '<!--[if !IE]>-->' +
        '<object id="intFlashCreativex" type="application/x-shockwave-flash" data="' + this.config.creative + '" width="' + this.config.width + '" height="' + this.config.height + '">' +
          '<param name="movie" value="'+this.config.creative+'" />' +
          '<param name="quality" value="high" />' +
          '<param name="wmode" value="window" />' +
          '<param name="menu" value="false" />' +
          '<param name="allowfullscreen" value="false" />' +
          '<param name="allowScriptAccess" value="always" />' +
          '<param name="flashVars" value="'+ this.flashvars +'" />' +
        '</object>' +
      '<!--<![endif]-->' +
    '</object>';
  };

  // image specific code
  Interstitial.prototype.buildImageCreative = function(){
    return '<a href="' + this.config.clickTrack + this.config.clickTag + '" target="_blank">' +
      '<img src="' + (arguments[0] || this.config.creative) + '" width="' + this.config.width + '" height="' + this.config.height + '" alt="" />' +
    '</a>';
  };

  // start the countdown timer
  Interstitial.prototype.startTimer = function(){
    this.timer = setTimeout(this.updateTimer.bind(this), 1000);
    return this;
  };
 
  // update the countdown timer
  Interstitial.prototype.updateTimer = function(){
    this.config.timeOpen--;
    this.$counter.html(this.config.timeOpen);
    if(this.config.timeOpen){
      this.startTimer();
    } else{
      this.close();
    }
  };

  // clear the timer that auto closes the interstitial
  Interstitial.prototype.clearTimer = function(){
    clearTimeout(this.timer);
  };

  // re-animate and show standard display ads
  Interstitial.prototype.showFlashAds = function(){
    $('object, embed', '[id^="slug_"]').each(function(i, el){
      var mov_src = $(this).attr('src');
      if(mov_src){
        $(this).attr({src: '#'}).attr({src: mov_src});
      }
      $(this).find('param[name="movie"]').each(function(i, el){
        var param_mov_src = $(this).attr('value');
        $(this).attr({value: '#'}).attr({value: param_mov_src});
      });
      $(this).css({
        visibility: '',
        position: ''
      });
    });
  };

  // loop through and call the function to render pixels
  Interstitial.prototype.addTracking = function(){
    if(this.config.pixels){
      var l = this.config.pixels.length;
      while(l--){
        this.addPixel(this.config.pixels[l]);
      }
    }
    return this;
  };

  // render pixel
  Interstitial.prototype.addPixel = function(url){
    if(url){
      this.rndm = this.rndm || Math.floor(Math.random()*1E6);
      $body.append('<img src="' + url.replace(/\[random\]|\[timestamp\]i/, this.rndm) + '" width="1" height="1" style="display:none;" />');
    }
  };

  // Get flash player version
  Interstitial.prototype.getFlashVer = function(){
    var i,a,o,p,s="Shockwave",f="Flash",t=" 2.0",u=s+" "+f,v=s+f+".",rSW=new RegExp("^"+u+" (\\d+)");
    if((o=navigator.plugins)&&(p=o[u]||o[u+t])&&(a=p.description.match(rSW)))return a[1];
    else if(!!(w.ActiveXObject))for(i=10;i>0;i--)try{if(!!(new w.ActiveXObject(v+v+i)))return i;}catch(e){}
    return 0;
  };

  wpAd.Interstitial = Interstitial;

})(window, document, window.jQuery, window.wpAd);