var app = angular.module('events', []);

if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
}

app.config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});

app.controller('HomeController', function ($scope, $http) {
    var dateStart = null;
    var dateEnd = null;
    $scope.currentMood = null;

    var datasets = [{name: 'Quebec', latitude: 46.8580073, longitude: -71.3460728}, 
        {name: 'Gatineau', latitude: 45.485499, longitude: -75.6269264}, 
        {name: 'Sherbrook', latitude: 45.417094, longitude: -71.9741315}, 
        {name: 'Tourisme_quebec'}];

    var categories_index = {
        0: "Arts",
        1: "Arts visuels",
        2: "Atelier",
        3: "Chant",
        4: "Musique",
        // 5: "Activité petit budget",
        6: "Conférence",
        7: "Visite guidée",
        8: "Activité littéraire",
        9: "Exposition",
        10: "Patrimoine",
        11: "Théâtre",
        12: "Activité familiale",
        13: "Bibliothèques",
        14: "Jeune public",
        15: "Grand événement",
        16: "Sports",
        // 17: "Vieux-Québec",
        18: "Animation",
        // 19: "Pâques",
        20: "Artisanat",
        21: "Activités estivales",
        22: "Cirque",
        // 23: "Noël",
        // 24: "Parc Linéaire",
        25: "Évenement",
        26: "Contes",
        27: "Humour",
        // 28: "Relâche",
        29: "Danse",
        // 30: "Divers",
        31: "Photographie",
        32: "Multimédia",
        33: "Littérature",
        34: "Cinéma",
        35: "Histoire animée",
        36: "Spectacles en salles et théâtre",
        37: "Fêtes et festivals",
        38: "Galerie d'art et exposition",
        39: "Expositions",
        40: "Activités et animations",
        41: "Spectacles",
        42: "Salons",
        43: "Salons et expositions",
        44: "Événements sportifs"
    };

    $scope.moods = {
        'Intello': [0, 1, 6, 7, 8, 9, 10, 11, 13, 26, 33, 34, 35, 36, 38, 39, 43],
        'Énergique': [12, 14, 16, 21, 22, 29, 44],
        'Festif': [3, 4, 15, 18, 21, 22, 25, 27, 37, 40, 41, 44],
        'Créatif': [0, 1, 2, 3, 4, 20, 31, 32],
        'Chill': [7, 8, 9, 11, 13, 26, 27, 31, 32, 33, 34, 36, 38, 39],
        'Social': [6, 9, 12, 14, 15, 16, 18, 21, 22, 25, 27, 29, 35, 36, 37, 40, 41, 42, 43, 44]
    };

    $scope.events = [];
    $scope.filteredEvents = [];

    $('#getEnglish').click(function() {
        window.location = "#googtrans(en)";
        window.location.reload();
    });

    var myLongitude, myLatitude, locationSet = false, eventbriteEvents = [];

    var getGeolocation = function (location) {
        myLongitude = location.coords.longitude;
        myLatitude = location.coords.latitude;
        locationSet = true;
        getNearbyEventsOnEventBrite();
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getGeolocation, function() {
            locationSet = false;
        });
    }

    window.setInterval(function() {
        $("iframe").hide();
        $("html").removeClass('translated-ltr');
        $("body").css('top', '0px');
    }, 1000);

    var getDistance = function (lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    var getNearbyEventsOnEventBrite = function () {

        Eventbrite({ 'app_key': 'NSE6URISYN4F6UWFB6', 'user_key': null }, function (eb_client) {
            // parameters to pass to the API
            var params = { within: 75, within_unit: 'K', 'longitude': myLongitude, 'latitude': myLatitude, max: 5 };
            // make a client request, provide a callback that will handle the response data
            eb_client.event_search(params, function (response) {

                eventbriteEvents = Enumerable.From(response.events).Skip(1).Select(function (event) {
                    
                    var descrip = event.event.description.replace(/\<.+?\>/g, '');
                    descrip = descrip.replace(/\<\/.+?\>/, '');
                    
                    return {
                        TITRE: event.event.title,
                        DT01: event.event.start_date,
                        DT02: event.event.end_date,
                        LOC: event.event.venue.name,
                        AD: event.event.venue.address + event.event.venue.address_2,
                        URL: event.event.url,
                        DESCRIP: descrip,
                        EVENTBRITE: true,
                        SOURCE: 'eventbrite'
                    };
                }).ToArray();

            });
        });
    };

    var getData = function (dataset) {
        $http.get("assets/javascripts/data/" + dataset.name + ".json")
            .success(function (data) {
                var eventsArray = data.EVTS.EVT;

                var alteredEvents = Enumerable.From(eventsArray).Select(function(event) {
                    if(dataset.latitude != null) {
                        event = $.extend(event, {LATITUDE: dataset.latitude, LONGITUDE: dataset.longitude});
                    } else {
                        event.LATITUDE = parseFloat(event.LATITUDE);
                        event.LONGITUDE = parseFloat(event.LONGITUDE);
                    }

                    return $.extend(event, {SOURCE: dataset.name});
                }).ToArray();

                $scope.events = $scope.events.concat(alteredEvents);
            })
            .error(function () {
                console.log("error");
            });
    };

    for (var i in datasets) {
        getData(datasets[i]);
    }

    $scope.$watch('events', function () {
        $scope.categories = window.Enumerable
            .From($scope.events)
            .SelectMany(function (x) {
                return (typeof x.CATEG === 'object' ? x.CATEG : [x.CATEG]);
            }).Distinct().ToArray();
    });

    var getEventsByMood = function (mood) {
        var filteredEvents = [];

        window.Enumerable.From($scope.events).ForEach(function (event) {

            var categoriesInEvent = window.Enumerable.From(typeof event.CATEG === 'object' ? event.CATEG : [event.CATEG])

                .Select(function (category) {
                    return window.Enumerable.From(categories_index).Where(function (c) {
                        return category === c.Value;
                    }).FirstOrDefault();
                }).Select(function (x) {
                    return x == null ? null : parseInt(x.Key);
                }).ToArray();

            var categoriesInMood = $scope.moods[mood];

            var hasCategoryInMood = Enumerable.From(categoriesInEvent).Where(function (x) {
                return x == null || categoriesInMood.indexOf(x) !== -1;
            }).Any();

            if (hasCategoryInMood) {
                filteredEvents.push(event);
            }

        });

        return filteredEvents;
    };

    $scope.today = function () {
        dateStart = moment(new Date()).toDate();
        dateEnd = moment(new Date()).toDate();

        $scope.selectedMoment = "aujourd'hui";

        $scope.filter();
    };

    $scope.tomorrow = function () {
        dateStart = moment(new Date()).add('days', 1).toDate();
        dateEnd = moment(new Date()).add('days', 1).toDate();

        $scope.selectedMoment = "demain";

        $scope.filter();
    };

    $scope.thisWeek = function () {
        dateStart = moment(new Date()).startOf('week').add('days', 1).toDate();
        dateEnd = moment(new Date()).endOf('week').add('days', 1).toDate();

        $scope.selectedMoment = "cette semaine";

        $scope.filter();
    };

    $scope.nextWeek = function () {
        dateStart = moment(new Date()).startOf('week').add('days', 1).add('weeks', 1).toDate();
        dateEnd = moment(new Date()).endOf('week').add('days', 1).add('weeks', 1).toDate();

        $scope.selectedMoment = "la semaine prochaine";

        $scope.filter();
    };

    $scope.thisWeekEnd = function () {
        dateStart = moment(new Date()).endOf('week').add('days', -1).toDate();
        dateEnd = moment(new Date()).endOf('week').add('days', 1).toDate();

        $scope.selectedMoment = "en fin de semaine";

        $scope.filter();
    };

    $scope.setCurrentMood = function (mood) {
        $scope.currentMood = mood;
    };

    var getEventsByDate = function (events) {
        return Enumerable.From(events).Where(function (event) {
            if (event.DT01 && event.DT02) {
                return (moment(event.DT01).isBefore(dateStart) && moment(event.DT02).isAfter(dateStart)) || (moment(event.DT01).isBefore(dateEnd) && moment(event.DT02).isAfter(dateEnd))
            }
            else {
                return moment(event.DT01).isSame(dateStart, 'day') || moment(event.DT01).isSame(dateEnd, 'day') || (moment(event.DT01).isAfter(dateStart) && moment(event.DT01).isBefore(dateEnd));
            }
        }).ToArray();
    };

    var filterByLocation = function(events) {
        return Enumerable.From(events).Where(function(event) {
            if(typeof event.LATITUDE == 'number' && typeof event.LONGITUDE == 'number') {
                var dist = getDistance(event.LATITUDE, event.LONGITUDE, myLatitude, myLongitude);
                return dist <= 100;
            } else {
                return false;
            }
        }).ToArray();
    };

    $scope.filter = function () {
        if ($scope.currentMood && dateStart && dateEnd) {
            var eventsByMood = getEventsByMood($scope.currentMood);

            var events = getEventsByDate(eventsByMood);

            if(locationSet) {
                events = filterByLocation(events);
            }

            for (var i in eventbriteEvents) {
                events.push(eventbriteEvents[i]);
            }

            $scope.filteredEvents = Enumerable.From(events).Shuffle().ToArray();

            window.setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $("#results").offset().top
                }, 'slow', 'swing');

                $('.row .description').readmore({maxHeight: 50, moreLink: '<a class="" href="#">Voir plus</a>', lessLink: '<a href="#">Voir moins</a>'});
            }, 100);
        }
    };

    $scope.today();
});
