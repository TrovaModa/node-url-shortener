(function ($) {
  var manageTags = function(){
    $(".bootstrap-tagsinput input").autocomplete({
      source: "/partner/list",
      minLength: 0,
      select: function( event, ui ) {
        var self = this;
        var e = jQuery.Event("keypress");
        e.which = 13; //enter event
        e.keyCode = 13;
        setTimeout(function(){
          $(self).trigger(e);
        },300)
        // setTimeout(function(){
        //   $(".bootstrap-tagsinput input").val("");
        // },100); 
        return true;
      },
      messages: {
        noResults: '',
        results: function() {}
      }
    });
  };

  $.getJSON("/partner/list", function( tags ) {
    $('.bootstrap-tagsinput').on('beforeItemAdd', function(event) {
      if(tags.indexOf(event.item) < 0){
        event.cancel = true;
      }
    });
  });

  var _nus = function (data) {
    this._api_ = '/api/v1/shorten/';
    this._form_ = '#nus';
    this._errormsg_ = 'An error occurred shortening that link';

    var _utmSource = $(this._form_).find('#utmSource');
    _utmSource.on("change",function(){
      if(_utmSource.val() === "__notselected__"){
        $("#mediumContainer").css("display","none")
      }
      else{
        $("#mediumContainer").css("display","block")
      }
    })
  };

  _nus.prototype.init = function () {
    this._input_ = $(this._form_).find('#link');
    this._output_ = $(this._form_).find('#linkShort');
    this._utmSource = $(this._form_).find('#utmSource');
    this._utmMedium = $(this._form_).find('#utmMedium');
    this._partners = $(this._form_).find('#partners');

    if (!this.check(this._input_.val())) {
      return this.alert(this._errormsg_, true);
    }

    this.request(this._input_.val(), this._output_.val(),
                 this._utmSource.val(), this._utmMedium.val(),
                 this._partners.val()
                );
  };

  _nus.prototype.check = function (s) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  };

  _nus.prototype.alert = function (message, error) {
    var t = error === true ? 'alert-danger' : 'alert-success';

    $('.alert').alert('close');
    $('<div class="alert ' + t + ' alert-dismissible" role=alert>'
      + '<button type=button class=close data-dismiss=alert aria-label=Close><span aria-hidden=true>&times;</span></button>'
      + message
      + '</div>').insertBefore(this._form_);
  };

  _nus.prototype.request = function (url, short_url, utm_source, utm_medium, partners) {
    var self = this;
    $.post(self._api_, { long_url: url, short_url: short_url,
                         utm_source: utm_source, utm_medium: utm_medium,
                         partners: partners}, function (data) {
      if (data.hasOwnProperty('status_code') && data.hasOwnProperty('status_txt')) {
        if (parseInt(data.status_code) == 200) {
          self._output_.val(data.short_url).select();
          return self.alert('Copy your shortened url');
        } else {
          self._errormsg_ = data.status_txt;
        }
      }
      return self.alert(self._errormsg_, true);
    }).error(function (data) {
      if(data.responseJSON && data.responseJSON.status_txt){
        return self.alert(data.responseJSON.status_txt, true);
      }
      else{
        return self.alert(self._errormsg_, true);
      }
    });
  };

   $(function () {
    var n = new _nus();
    var clipboard = new Clipboard('.btn');

    $(n._form_).on('submit', function (e) {
      e && e.preventDefault();
      n.init();

      clipboard.on('success', function(e) {
        n.alert('Copied to clipboard!');
      });

      clipboard.on('error', function(e) {
        n.alert('Error copying to clipboard', true);
      });
    });
    manageTags();
  });

})(window.jQuery);
