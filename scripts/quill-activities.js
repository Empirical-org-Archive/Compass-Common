jQuery.extend(Quill.prototype, {

  //
  //  idleCheck
  //
  //  This function handles client idle checking.
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

    // instantiate Activities object
    logger = new Activities(settings);

    //
    //  Actvities
    //
    //  This object holds all methods for user logging.
    //
    function Activities(settings) {

      this.sleepCntr = null;

      // send initial message
      this.ping(settings.profile['START']);

      // polling mode
      if(settings.autoping) this.autoping('on');

    }

    Actvities.prototype = {

      //
      //  Activities.ping
      //
      //  Sends a user activity update message to a listening server.
      //
      ping: function(type) {

        // send activity to listener
        $.ajax(settings.to, {
          type: 'post',
          data: {
            'ping': 'true',
            'activity_log_item': {
              'created_at': new Date(),
              'activity_type': type,
              'activity_data': __eval(settings.payload)
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
        $(document).trigger(type+'.activities');
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
            settings.interval,
            function() { ping(settings.profile['PING']); },
            settings.idle,
            function() { ping(settings.profile['PAUSE']); },
            { stop: function() { ping(settings.profile['STOP']); } }
          );
          this.sleepCntr.play();

          var sleepCntr = this.sleepCntr;
          $(document).on(settings.refreshevents, function(e) {
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

          $(document).off(settings.refreshevents);
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
        $.each(hash, function(i,e) {
          evaled_hash[i] = typeof e === "function" ? e() : e;
        });
        return evaled_hash
      }
    } // end Activities
  } // end idleCheck()
});
