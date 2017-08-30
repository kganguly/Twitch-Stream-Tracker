var debug = false;
var clientId = "whozyuc72w6lm5gapst8n65spsu3s7";
var userNameArray = ["nalcs1", "esl_sc2", "ogamingsc2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "brunofin", "comster404"];
var broadcasters = {};

$(document).ready(function() {
  setListeners();
  setBroadcasters(userNameArray);
  getStatus();
});

function setListeners() {
  $("#toTop").click(function(event) {
    // Prevent default anchor click behavior
    event.preventDefault();
    scrollToTop(event);
  });
}

function setBroadcasters(userNames) {
  userNames.forEach(function(element) {
    broadcasters[element.toLowerCase()] = {};
  });
  if (debug) console.log(broadcasters);
}

function getStatus() {
  $.when(getUsers(), getStreams()).done(showStatus).fail(showFail);
}

function showFail(err) {
  console.log("getStatus() FAILED unhandled error: ");
  console.log(err);
}

function showStatus() {
  if (debug) console.log("STATUS!");
  $("#offline").children().find("span.status").addClass("disabled-text").html("Offline");
  //throw "Testing!";
}

function delayedPromise() {
  var promise = $.Deferred();
  setTimeout(function() {console.log("RESOLVE!"); promise.resolve();}, 3000);
  return promise;
}

function getUsers() {
  var userPromiseArr = [];
  for (var userName in broadcasters) {
    var userPromise = getUser(userName);
    userPromiseArr.push(userPromise);
    broadcasters[userName].promise = userPromise;
  }
  return $.when.apply($, userPromiseArr);
}

function getUser(userName) {
  var queryUrl = "https://api.twitch.tv/kraken/users/" + userName + "?api_version=3&client_id=" + clientId;

  return submitQuery(queryUrl).then(showUser, function(data) {
    noUser(data, queryUrl);
  });
}

function showUser(data) {
  if (debug) {
    console.log("User Data: ");
    console.log(data);
  }
  broadcasters[data.name].data = data;
  if (debug) console.log(broadcasters);
  
  var logoHtml = "";
  if (data.logo) {
    logoHtml = "<img class='img-circle userLogo' src='" + data.logo + "'>";
  } else {
    logoHtml = "<div class='userLogo'>" + glitchSvg + "</div>";
  }
  
  var bioHtml = "";
  if (data.bio) bioHtml = "<p class='userBio'>" + data.bio + "</p>";

  var userHTML = "";
  userHTML += "<a id='" + data.name + "' class='list-group-item interactive' href='https://www.twitch.tv/" + data.name + "' target='_blank'>" +
    "<div class='userLabel'>" + 
    logoHtml +
    "<div class='userInfo'>" +
    "<span class='list-group-item-heading'>" + data.display_name + "</span>" +
    "<span class='list-group-item-text status'>Loading...</span>" +
     bioHtml + 
    "</div>" + 
    "</div></a>";

  $("#offline").append(userHTML);
}

function noUser(err, queryUrl) {
  var userName = queryUrl.match(/users\/(.*)\?/)[1].toLowerCase();
  if (debug) {
    console.log("User Match: " + userName);
    console.log("ERR");
    console.log(err);
  }

  broadcasters[userName].data = {};
  if (debug) console.log(broadcasters);

  var userHTML = "";

  userHTML += "<div id='" + userName + "' class='list-group-item disabled userLabel'>" +
    "<div class='userLogo'>" + glitchSvg + "</div>" +
    "<div class='userInfo'>" +
    "<span class='list-group-item-heading'>" + userName + "</span>" +
    "<span class='list-group-item-text disabled-text'>Account Not Found</span>" +
    "</div>" +
    "</div>";

  $("#notFound").append(userHTML);

  if (err.readyState !== 4 && err.status !== 404) {
    console.log("Unexpected ERROR returned for user: " + userName);
  }
}

function getStreams() {
  var queryUrl = "https://api.twitch.tv/kraken/streams?api_version=3&client_id=" + clientId + "&channel=" + Object.keys(broadcasters);

  return submitQuery(queryUrl).then(showStreams, function(err, queryUrl) {
    console.log("STREAM ERR:");
    console.log(err);
    console.log("Query: " + queryUrl);
    return false;
  });
}

function showStreams(data) {
  if (debug) {
    console.log("STREAMS: ");
    console.log(data);
  }

  var showStreamPromArr = [];
  
  var streams = data.streams;
  streams.forEach(function(entry) {
    var userName = entry.channel.name;
    var userPromise = broadcasters[userName].promise;
    showStreamPromArr.push(userPromise.then(function () {
      var statusHTML = "<div class='text-center stream'><img src='" + entry.preview.large + "' class='img-responsive center-block'>" +
          "<div class='description'><i class='fa fa-gamepad'></i> " + entry.game +
          " - " + entry.channel.status + " | Viewers: " + entry.viewers + "</div></div>"; 
      var el = $("#" + userName);
      el.append(statusHTML);
      el.appendTo("#online");
      el.find("span.status").html("Online");
      if (debug) console.log("SHOWSTREAM: " + userName);
    }));
  });
  
  return $.when.apply($, showStreamPromArr).then(function() {
    if (debug) {
      console.log(showStreamPromArr); 
      console.log("STREAMS SHOWN!");
    }
  });
}

function submitQuery(queryUrl, success, error) {
  return $.ajax({
    url: queryUrl,
    type: 'GET',
    dataType: "jsonp"
  });
}

function scrollToTop() {
  $('html, body').animate({
    scrollTop: 0
  }, 'slow', 'swing');
}

function scrollToElement(element) {
  $('html, body').animate({
    scrollTop: element.offset().top //$(document).height()
  }, 'slow', 'swing');
}

function scrollToBottom() {
  $('html, body').animate({
    scrollTop: $(document).height()
  }, 'slow', 'swing');
}

var glitchSvg = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 134"><defs><style>.cls-1{fill:#6441a4;fill-rule:evenodd;}</style></defs><title>Glitch</title><path class="cls-1" d="M89,77l-9,23v94h32v17h18l17-17h26l35-35V77H89Zm107,76-20,20H144l-17,17V173H100V89h96v64Zm-20-41v35H164V112h12Zm-32,0v35H132V112h12Z" transform="translate(-80 -77)"/></svg>';