(function() {
	'use strict';
	angular.module('core')
	.factory('MalService', MalService);
	MalService.$inject = ['$http', '$resource'];

	function MalService($http, $resource) {
		var malService = $resource('', {},
			 {
				search: { method: 'GET', url: 'malSearch/:type', params: { type: '@_type', searchString: '@_searchString' }, isArray: true }
			 });

		function xmlToJson(xml) {
			var ELEMENT_NODE_TYPE = 1,
				TEXT_NODE_TYPE = 3,
				obj = {};

			if (xml.nodeType === ELEMENT_NODE_TYPE) {
				if (xml.attributes.length > 0) {
				obj['@attributes'] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType === TEXT_NODE_TYPE) {
				obj = xml.nodeValue;
			}

			if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === TEXT_NODE_TYPE) {
				obj = xml.childNodes[0].nodeValue;
			}
			else if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i),
						nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === 'undefined') {
						obj[nodeName] = xmlToJson(item);
					} else {
						if (typeof(obj[nodeName].push) === 'undefined') {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(xmlToJson(item));
					}
				}
			}
			return obj;
		}

		function xmlProcessor(type, data) {
			var searchResult = [],
				xml = data.responseXML,
				nodes = xml.evaluate(`//${type}/entry`, xml, null, XPathResult.ANY_TYPE, null),
				result = nodes.iterateNext();
			while (result) {
				searchResult.push(xmlToJson(result));
				result = nodes.iterateNext();
			}
			return searchResult;
		}

		return {
			search: function (queryType, searchString) { return malService.search({ type: queryType, searchString: searchString }).$promise; }
		};
				/*
				var searchUrl = `https://myanimelist.net/api/${queryType}/search.xml?q=${searchString}`;
				//$http.defaults.headers.common['Authorization'] = `Basic ${malService.credentials}`;
				$http({
					method: 'GET',
					url: searchUrl,
          withCredentials: true,
          headers: {
						'Accept': 'text/xml',
            'Authorization': `Basic ${malService.credentials}`
          }
				}).then(function success(result) {
					console.log(`${searchUrl} >> `, result.data);
					var processMalResponse = new Promise(function(resolve, reject) {
						resolve(xmlProcessor(queryType, result.data));
					});
					return processMalResponse;
				}, function error(result) {
					console.log(`error searching mal at ${searchUrl}: `, result);
				});
			}
			*/
	}
})();
