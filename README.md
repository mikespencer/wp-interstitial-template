#DESCRIPTION
WP Interstitial template for DFP

#DEPENDENCIES
jQuery

#OPTIONS

    {
      // REQUIRED:
      creative: null,               //String: URL to creative.
      creativeType: null,           //String: flash, image, iframe, custom.

      // OPTIONAL (with defaults):
      width: 760,                   //Number: Width of creative
      height: 425,                  //Number: Height of creative
      timeOpen: 15,                 //Number: Seconds open before auto close
      clickTrack: '',               //String: Prepended click tracker
      clickTag: '',                 //String: Clickthru URL
      imgMap: false,                //String: String of <area /> tags as html code
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
      adid: null,                   //String or Number. DFP ad id reference
      useClickOverlay: false        //Boolean: Use a click overlay
    }

#EXAMPLE USAGE:

    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <script src="js/interstitial.js"></script>
    <script>
      var my_interstitial = new wpAd.Interstitial({/* options here */})
    </script>