function HomeController($scope, $http){    
    var datasets = ['Quebec', 'Gatineau', 'Sherbrook'];
    var categories_index = {
        0: "Arts",
        1: "Arts visuels",
        2: "Atelier",
        3: "Chant",
        4: "Musique",
        5: "Activité petit budget",
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
        17: "Vieux-Québec",
        18: "Animation",
        19: "Pâques",
        20: "Artisanat",
        21: "Activités estivales",
        22: "Cirque",
        23: "Noël",
        24: "Parc Linéaire",
        25: "Évenement",
        26: "Contes",
        27: "Humour",
        28: "Relâche",
        29: "Danse",
        30: "Divers",
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
        'Intello': [0], 
        'Énergétique' : [], 
        'Festif' : [], 
        'Créatif' : [1, 2], 
        'Chill': []
    };

    $scope.events = [];
    $scope.filteredEvents = [];
    
    var getData = function(dataset){
        $http.get("/client/javascripts/data/" + dataset + ".json")
            .success(function(data){
                var eventsArray = data.EVTS.EVT;
                $scope.events = $scope.events.concat(eventsArray);
            })
            .error(function(){
                console.log("error");
            });
        };

    for(var i in datasets){
        getData(datasets[i]);
    }
    
    $scope.$watch('events', function() {
        $scope.categories = window.Enumerable
                                  .From($scope.events)
                                  .SelectMany(function(x) {
                                      return (typeof x.CATEG === 'object' ? x.CATEG : [x.CATEG])
                                  }).Distinct().ToArray();
    });

    $scope.getEventsByMood = function(mood) {
        $scope.filteredEvents = [];

        window.Enumerable.From($scope.events).ForEach(function(event) {

            var categoriesInEvent = window.Enumerable.From(typeof event.CATEG === 'object' ? event.CATEG : [event.CATEG])
            
            .Select(function(x) {
                // console.log(x);
                return window.Enumerable.From(categories_index).Where(function(c) {
                    return x === c.Value;
                }).FirstOrDefault();
            }).Select(function(x) {return x == null ? null : parseInt(x.Key);}).ToArray();

            var categoriesInMood = $scope.moods[mood];

            var hasCategoryInMood = Enumerable.From(categoriesInEvent).Where(function(x) {
                return x == null || categoriesInMood.indexOf(x) !== -1;
            }).Any();

            if(hasCategoryInMood) {
                $scope.filteredEvents.push(event);
            }

        });
    };

    var dayOfTheWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var monthsOfTheYear = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    var setCurrentDateTo = function (date) {
        $scope.currentDate = date;
        $scope.currentDateAsString = dayOfTheWeek[$scope.currentDate.getDay()] + ' ' + $scope.currentDate.getDate() + ' ' + monthsOfTheYear[$scope.currentDate.getMonth()];
    };

    $scope.today = function () {
        setCurrentDateTo(new Date());
    };

    $scope.tomorrow = function () {
        setCurrentDateTo(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
    };

    $scope.today();
}
