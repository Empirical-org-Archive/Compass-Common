jQuery.extend(Quill.prototype, {

  //
  //  activity events
  //
  //  This object handles client-side tracking of user activity.
  //
  activities: {

    // instance settings
    settings: {
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
    },

    //  initialization method (should be called first)
    //  TODO this should be a normal object initializer
    Activities: function(options) {

      // settings
      this.settings.extend({
        autoping: true,
        refreshevents: 'mousemove keydown click',
        interval: 1000,  // secs
        idle: 3000,  // secs
        to: 'quill.org',
        profile: $.extend({
          'START': 'start',
          'PAUSE': 'pause',
          'PING': 'ping',
          'DONE': 'done',
          'STOP': 'stop'
        }, options.profiles),
        payload: {}
      }, options);

      $e = $(e);
      $e.sleepCntr = null;

      // send initial message
      ping(settings.profile['START']);

      // polling mode
      if(settings.autoping) autoping('on');

    },

    ping: function(type) {

      // send activity to listener
      $.ajax(settings.to, {
        type: 'post',
        data: {
          'ping': 'true',
          'activity_log_item': {
            'created_at': new Date(),
            // TODO get activity_log_id dynamically
            'activities_activity_log_id': 1,
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
    }

    function __eval(hash) {
      evaled_hash = {};
      $.each(hash, function(i,e) {
        evaled_hash[i] = typeof e === "function" ? e() : e;
      });
      return evaled_hash
    }
  }
});
