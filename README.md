#DESCRIPTION
WP Interstitial template for DFP

#OPTIONS
    {
      // REQUIRED:
      creative: null,               //String: URL to creative.
      creativeType: null,           //String: flash, image, iframe, custom.

      // OPTIONAL:
      width: 760,                   //Number: Width of creative
      height: 425,                  //Number: Height of creative
      timeOpen: 15,                 //Number: Seconds open before auto close
      clickTrack: '',               //String: Prepended click tracker
      clickTag: '',                 //String: Clickthru URL
      pixels: false,                //Array: 3rd party impression pixels
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
    }

#EXAMPLE USAGE:
    <script src="interstitial.js"></script>
    <script>
      var my_interstitial = new wpAd.Interstitial({/* options here */})
    </script>