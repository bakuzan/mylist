'use strict';

//Characters service used to communicate Characters REST endpoints
angular.module('characters').factory('Characters', ['$resource',
	function($resource) {
		return $resource('characters/:characterId', { characterId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.service('CharacterService', function() {
    
    //build the character gender distribution.
    this.buildGenderDistribution = function(items, maxCount) {
        var gender = { male: { count: 0, percentage: 0, text: '% male.'}, female: { count: 0, percentage: 0, text: '% female.'}, nosex: { count: 0, percentage: 0, text: '% unassigned.'} };
        angular.forEach(items, function(item) {
            if (item.tag === 'male') {
                gender.male.count = item.count;
                gender.male.percentage = ((item.count / maxCount) * 100).toFixed(2);
            } else if (item.tag === 'female') {
                gender.female.count = item.count;
                gender.female.percentage = ((item.count / maxCount) * 100).toFixed(2);
            }
        });
        var nosex = maxCount - gender.male.count - gender.female.count;
        gender.nosex.count = nosex;
        gender.nosex.percentage = ((nosex / maxCount) * 100).toFixed(2);
//        console.log('GD: ', gender);
        return gender;
    };
    
    this.buildCharacterTags = function(items) {
        var add = true, statTags = [];
        //is tag in array?
        angular.forEach(items, function(item) {
            angular.forEach(item.tags, function(tag) {
                for(var i=0; i < statTags.length; i++) {
                    if (statTags[i].tag === tag.text) {
                        add = false;
                        statTags[i].count += 1; 
                    }
                }
                // add if not in
                if (add===true) {
                    statTags.push({ tag: tag.text, count: 1 });
                }
                add = true; //reset add status.
            });
//          console.log($scope.statTags);
        });
        
        return statTags;
    };
    
    this.buildVoiceActors = function(items) {
        var add = true, voiceActors = [];
        //is voice actor in array?
        angular.forEach(items, function(item) { 
            for(var i=0; i < voiceActors.length; i++) {
                if (voiceActors[i].name === item.voice) {
                    add = false;
                    voiceActors[i].count += 1;
                }
            }
            // add if not in
            if (add===true) {
                voiceActors.push({ name: item.voice, count: 1 });
            }
            add = true; //reset add status.
        });
        
        return voiceActors;
    };
    
    this.buildSeriesList = function(items) {
        var add = true, statSeries = [];
        //get series counts.
        angular.forEach(items, function(item) {
            for(var i=0; i < statSeries.length; i++) {
                if (item.anime !== null) {
                    if (statSeries[i].name === item.anime.title) {
                        add = false;
                        statSeries[i].count += 1; 
                    }
                } else if (item.manga !== null) {
                    if (statSeries[i].name === item.manga.title) {
                        add = false;
                        statSeries[i].count += 1; 
                    }
                }
            }
            // add if not in
            if (add === true) {
                if (item.anime !== null) {
                    statSeries.push({ name: item.anime.title, count: 1 });
                } else if (item.manga !== null) {
                    statSeries.push({ name: item.manga.title, count: 1 });
                }
            }
            add = true; //reset add status.
        });
        
        return statSeries;
    };
    
});