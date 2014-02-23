jQuery.extend(Quill.prototype, {

  //
  //  idleCheck
  //
  //  This function handles client idle checking.
  //
  //
  idleCheck: function(options) {

    var settings = jQuery.extend({
      autoping: true,
      refreshevents: 'mousemove keydown click',
      interval: 1000,  // secs
      idle: 3000,  // secs
      to: 'quill-api.org',
      profiles: {
        'START': 'start',
        'PAUSE': 'pause',
        'PING': 'ping',
        'DONE': 'done',
        'STOP': 'stop'
      }
    }, options);

    //
    //  Actvities
    //
    //  This object holds all methods for user logging.
    //
    function Activities(settings) {

      this.settings = settings;
      this.sleepCntr = null;
    }

    Activities.prototype = {

      init: function() {

        // send initial message
        this.ping(this.settings.profiles['START']);

        // polling mode
        //if(this.settings.autoping) this.autoping('on');

      },

      //
      //  Activities.ping
      //
      //  Sends a user activity update message to a listening server.
      //
      ping: function(type) {

        // send activity to listener
        jQuery.ajax(this.settings.to, {
          type: 'post',
          data: {
            'ping': 'true',
            'activity_log_item': {
              'created_at': new Date(),
              'activity_type': type,
              // TODO figure out how the data is constructed
              ractivity_data': this.__eval({})
            }
          },
          success: function(resp) {
            // success
          },
          error: function(jqXhr, err) {
            // error
            console.log(err);
          },
        });

        // DOM trigger for ping action
        jQuery(document).trigger(type+'.activities');
      },

      //
      //  Activities.autoping
      //
      //  Enables automated user activity logging.
      //
      autoping: function(mode) {
        if(
          mode === "on" ||
          mode === true
        ) {
          this.sleepCntr = new Counter(
            this.settings.interval,
            function() { ping(this.settings.profiles['PING']); },
            this.settings.idle,
            function() { ping(this.settings.profiles['PAUSE']); },
            { stop: function() { ping(this.settings.profiles['STOP']); } }
          );
          this.sleepCntr.play();

          var sleepCntr = this.sleepCntr;
          jQuery(document).on(this.settings.refreshevents, function(e) {
            if( sleepCntr.in_timeout()) {
              sleepCntr.stop();
              sleepCntr.play();
            } else sleepCntr.refresh();
          });
        } else if(
          mode === "off" ||
          mode === false
        ) {
          this.sleepCntr.stop();
          this.sleepCntr = null;

          jQuery(document).off(this.settings.refreshevents);
        } else if(
          mode === "toggle" ||
          mode === undefined
        ) {
          this.sleepCntr === null ? autoping('on') : autoping('off');
        }
      },

      //
      //  Activities.__eval
      //
      //  Maps an object of functions to an object of return values. Non
      //  function values are mapped to themselves.
      //
      __eval: function(hash) {

        evaled_hash = {};
        jQuery.each(hash, function(i,e) {
          evaled_hash[i] = typeof e === "function" ? e() : e;
        });
        return evaled_hash

      }
    } // end Activities

    // instantiate Activities object
    logger = new Activities(settings);
    logger.init();

  } // end idleCheck()
});
