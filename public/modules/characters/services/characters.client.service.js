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
        var check, 
            gender = { 
                male: { count: 0, percentage: 0, text: '% male.'},
                female: { count: 0, percentage: 0, text: '% female.'},
                nosex: { count: 0, percentage: 0, text: '% unassigned.'}
            };
        angular.forEach(items, function(item) {
            if (item.tag === 'male') {
                gender.male.count = item.count;
                gender.male.percentage = Number(((item.count / maxCount) * 100).toFixed(2));
            } else if (item.tag === 'female') {
                gender.female.count = item.count;
                gender.female.percentage = Number(((item.count / maxCount) * 100).toFixed(2));
            }
        });
        gender.nosex.count = maxCount - gender.male.count - gender.female.count;
        gender.nosex.percentage = Number(((gender.nosex.count / maxCount) * 100).toFixed(2));
        
        //Fudge any rounding errors.
        check = gender.female.percentage + gender.male.percentage + gender.nosex.percentage;
        if (check > 100) {
            gender.nosex.percentage -= (check - 100).toFixed(2);
        } else if (check < 100) {
            gender.nosex.percentage += (100 - check).toFixed(2);
        }
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
    
    this.buildRelatedCharacterTags = function(items, name) {
        var add = true, tagDetailCollection = [], tagDetailResult = [];
        //get all character tag arrays that contain the chosen tag into a collection.
        angular.forEach(items, function(item){
            for(var i=0; i < item.tags.length; i++) {
                if (item.tags[i].text === name) {
                    tagDetailCollection.push(item.tags);
                }
            }
        });
//        console.log(tagDetailCollection);
        angular.forEach(tagDetailCollection, function(item) {
            angular.forEach(item, function(bit) {
//              console.log(bit);
                for(var i=0; i < tagDetailResult.length; i++) {
                    //if exists and not the search value - increment the count.
                    if (tagDetailResult[i].name===bit.text && bit.text!==name) {
                        add = false;
                        tagDetailResult[i].count += 1; 
                    }
                }
                //add if true and not the tag we searched on.
                if (add===true && bit.text!==name) {
                    tagDetailResult.push({ name: bit.text, count: 1 });
                }
                add = true;
            });
        });
//        console.log(tagDetailResult);
        return tagDetailResult;
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