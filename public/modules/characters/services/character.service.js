(function() {
	'use strict';
	angular.module('characters')
	.service('CharacterService', CharacterService);
	CharacterService.$inject = ['$q'];

	function CharacterService($q) {

	    //build the character gender distribution.
	    this.buildGenderDistribution = function(items, maxCount) {
	        return $q(function(resolve, reject) {
	            var check, gender = [];
	            angular.forEach(items, function(item) {
	                if (item.tag === 'male') {
	                    gender.push({
	                        type: 'male',
	                        count: item.count,
	                        percentage: Number(((item.count / maxCount) * 100).toFixed(2)),
	                        text: '% male.'
	                    });
	                } else if (item.tag === 'female') {
	                    gender.push({
	                        type: 'female',
	                        count: item.count,
	                        percentage: Number(((item.count / maxCount) * 100).toFixed(2)),
	                        text: '% female.'
	                    });
	                }
	            });
	            gender.push({
	                type: 'unassigned',
	                count: maxCount - gender[0].count - gender[1].count,
	                percentage: Number(((maxCount - gender[0].count - gender[1].count / maxCount) * 100).toFixed(2)),
	                text: '% unassigned.'
	            });

	            //Fudge any rounding errors.
	            check = gender[0].percentage + gender[1].percentage + gender[2].percentage;
	            if (check > 100) {
	                gender[2].percentage -= (check - 100).toFixed(2);
	            } else if (check < 100) {
	                gender[2].percentage += (100 - check).toFixed(2);
	            }
	            resolve(gender);
	        });
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
	                if (item.anime) {
	                    if (statSeries[i].name === item.anime.title) {
	                        add = false;
	                        statSeries[i].count += 1;
	                    }
	                } else if (item.manga) {
	                    if (statSeries[i].name === item.manga.title) {
	                        add = false;
	                        statSeries[i].count += 1;
	                    }
	                }
	            }
	            // add if not in
	            if (add === true) {
	                if (typeof(item.anime) === 'object' && item.anime !== null) {
	                    statSeries.push({ _id: item.anime._id, name: item.anime.title, count: 1 });
	                } else if (typeof(item.manga) === 'object' && item.manga !== null) {
	                    statSeries.push({ _id: item.manga._id, name: item.manga.title, count: 1 });
	                }
	            }
	            add = true; //reset add status.
	        });

	        return statSeries;
	    };

	}

})();
